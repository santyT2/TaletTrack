import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Tree, { type CustomNodeElementProps, type RawNodeDatum } from 'react-d3-tree';
import hrService from '../../../core/services/hrService';
import { ZoomIn, ZoomOut, Maximize, AlertCircle } from 'lucide-react';

type OrgAttributes = {
    cargo?: string | null;
    foto?: string | null;
    departamento?: string | null;
};

type OrgNode = {
    id?: number;
    name: string;
    attributes?: OrgAttributes;
    children?: OrgNode[];
};

function sanitizeNode(node: any): OrgNode {
    const rawChildren = Array.isArray(node?.children)
        ? node.children
        : Array.isArray(node?.subordinates)
        ? node.subordinates
        : [];
    const safeChildren = rawChildren.filter(Boolean).map((child: any) => sanitizeNode(child));
    return {
        id: node?.id,
        name: node?.name || node?.full_name || node?.nombre_completo || 'Sin nombre',
        attributes: node?.attributes || {
            cargo: node?.position_name || node?.cargo_nombre,
            foto: node?.photo_url || node?.foto_url,
            departamento: node?.departamento || node?.branch_name,
        },
        children: safeChildren,
    };
}

class TreeErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    componentDidCatch(error: any) {
        console.error('Organigram tree error:', error);
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 text-center text-rose-600 bg-rose-50 border border-rose-100 rounded-lg">
                    No se pudo renderizar el organigrama.
                </div>
            );
        }
        return this.props.children as any;
    }
}

export default function OrganigramPage() {
    const [treeData, setTreeData] = useState<OrgNode[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [translate, setTranslate] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

    useEffect(() => {
        const fetchOrg = async () => {
            try {
                const data = await hrService.getOrganigram();
                const organization = Array.isArray(data) ? data : data?.organization || [];
                const normalized = organization.map((node: any) => sanitizeNode(node));

                // Si hay múltiples raíces, react-d3-tree muestra solo el primer nodo.
                // Los agrupamos bajo un nodo virtual para ver todo el bosque.
                if (normalized.length > 1) {
                    setTreeData([
                        {
                            id: 0,
                            name: 'Organización',
                            attributes: { cargo: 'Vista consolidada', departamento: 'General' },
                            children: normalized,
                        },
                    ]);
                } else {
                    setTreeData(normalized);
                }
            } catch (err) {
                setError('Error al cargar la estructura organizacional.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrg();
    }, []);

    useEffect(() => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
            setTranslate({ x: rect.width / 2, y: 80 });
        }
    }, [treeData.length]);

    const customNode = useCallback(({ nodeDatum }: CustomNodeElementProps) => {
        const attrs = nodeDatum.attributes as OrgAttributes | undefined;
        const foto = attrs?.foto ?? null;
        const cargo = attrs?.cargo ?? 'Sin cargo';
        const departamento = attrs?.departamento ?? 'Corporativo';
        const colors = getDeptColors(departamento);

        return (
            <g>
                <foreignObject x={-110} y={-60} width={220} height={120}>
                    <div style={{ borderTop: `5px solid ${colors.border}` }} className="bg-white rounded-xl shadow-sm border border-slate-200 px-4 py-3 flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center border border-white shadow">
                            {foto ? (
                                <img src={foto} alt={nodeDatum.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="font-semibold text-lg">{nodeDatum.name.charAt(0)}</span>
                            )}
                        </div>
                        <div className="text-center leading-tight">
                            <div className="text-sm font-semibold text-slate-900" title={nodeDatum.name}>{nodeDatum.name}</div>
                            <div className="text-[12px] text-slate-500" title={cargo}>{cargo}</div>
                        </div>
                        <span className="text-[11px] font-semibold px-3 py-1 rounded-full" style={{ background: colors.badgeBg, color: colors.badgeText }}>
                            {departamento}
                        </span>
                    </div>
                </foreignObject>
            </g>
        );
    }, []);

    const treeMemo = useMemo(() => treeData as unknown as RawNodeDatum | RawNodeDatum[], [treeData]);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center space-y-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
                    <p className="text-gray-500">Construyendo organigrama...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center text-red-500 bg-red-50 rounded-lg m-8 flex flex-col items-center">
                <AlertCircle className="h-12 w-12 mb-2" />
                <p>{error}</p>
            </div>
        );
    }

    const isEmpty = !loading && treeData.length === 0;

    return (
        <div className="h-full flex flex-col overflow-hidden bg-gray-50/50">
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm z-10">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Organigrama</h1>
                    <p className="text-sm text-gray-500">Visualización jerárquica en tiempo real</p>
                </div>
                <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
                    <button onClick={() => setZoom(Math.max(0.4, zoom - 0.1))} className="p-2 hover:bg-white rounded-md transition-colors shadow-sm" title="Reducir">
                        <ZoomOut size={18} className="text-gray-600" />
                    </button>
                    <span className="text-xs font-mono w-12 text-center text-gray-600">{Math.round(zoom * 100)}%</span>
                    <button onClick={() => setZoom(Math.min(2.5, zoom + 0.1))} className="p-2 hover:bg-white rounded-md transition-colors shadow-sm" title="Aumentar">
                        <ZoomIn size={18} className="text-gray-600" />
                    </button>
                    <div className="w-px h-6 bg-gray-300 mx-2"></div>
                    <button onClick={() => setZoom(1)} className="p-2 hover:bg-white rounded-md transition-colors shadow-sm" title="Restablecer">
                        <Maximize size={18} className="text-gray-600" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-auto" ref={containerRef}>
                {loading && (
                    <div className="flex h-full items-center justify-center min-h-[60vh]">
                        <div className="flex flex-col items-center space-y-4">
                            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
                            <p className="text-gray-500">Construyendo organigrama...</p>
                        </div>
                    </div>
                )}

                {!loading && error && (
                    <div className="p-8 text-center text-red-500 bg-red-50 rounded-lg m-8 flex flex-col items-center">
                        <AlertCircle className="h-12 w-12 mb-2" />
                        <p>{error}</p>
                    </div>
                )}

                {!loading && !error && isEmpty && (
                    <div className="p-8 text-center text-slate-500 bg-white rounded-lg m-8 border border-dashed border-slate-200">
                        No se ha definido jerarquía. Asigne supervisores en la edición de empleados.
                    </div>
                )}

                {!loading && !error && !isEmpty && (
                    <div className="h-[80vh] w-full">
                        <TreeErrorBoundary>
                            <Tree
                                data={treeMemo}
                                translate={translate}
                                separation={{ siblings: 1.2, nonSiblings: 1.4 }}
                                zoom={zoom}
                                orientation="vertical"
                                renderCustomNodeElement={customNode}
                                collapsible={false}
                                pathFunc="step"
                            />
                        </TreeErrorBoundary>
                    </div>
                )}
            </div>
        </div>
    );
}

function getDeptColors(dept: string) {
    const key = dept.toLowerCase();
    if (key.includes('tecnolog')) return { border: '#4f46e5', badgeBg: '#eef2ff', badgeText: '#312e81' };
    if (key.includes('finan')) return { border: '#0ea5e9', badgeBg: '#e0f2fe', badgeText: '#075985' };
    if (key.includes('rrhh') || key.includes('talent')) return { border: '#22c55e', badgeBg: '#dcfce7', badgeText: '#166534' };
    return { border: '#6366f1', badgeBg: '#eef2ff', badgeText: '#312e81' };
}

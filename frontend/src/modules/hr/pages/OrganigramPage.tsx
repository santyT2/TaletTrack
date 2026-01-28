import { useEffect, useState } from 'react';
import hrService, { type EmployeeNode } from '../../../core/services/hrService';
import { ZoomIn, ZoomOut, Maximize, AlertCircle } from 'lucide-react';

export default function OrganigramPage() {
    const [treeData, setTreeData] = useState<EmployeeNode[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1);

    useEffect(() => {
        const fetchOrg = async () => {
            try {
                const data = await hrService.getOrganigram();
                const organization = data?.organization || [];
                const mapped = organization.map((node: any) => mapToNode(node, null));
                setTreeData(mapped);
            } catch (err) {
                setError('Error al cargar la estructura organizacional.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrg();
    }, []);

    function mapToNode(node: any, parentId: number | null): EmployeeNode {
        return {
            id: node.id,
            name: node.full_name || node.nombre_completo,
            title: node.position_name || node.cargo_nombre || 'Sin puesto',
            parentId,
            img: node.foto_url || null,
            children: (node.subordinates || []).map((child: any) => mapToNode(child, node.id)),
        };
    }

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

    return (
        <div className="h-full flex flex-col overflow-hidden bg-gray-50/50">
            {/* Toolbar */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm z-10">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Organigrama</h1>
                    <p className="text-sm text-gray-500">Visualización jerárquica de la organización</p>
                </div>
                <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
                    <button onClick={() => setZoom(Math.max(0.5, zoom - 0.1))} className="p-2 hover:bg-white rounded-md transition-colors shadow-sm" title="Reducir">
                        <ZoomOut size={18} className="text-gray-600" />
                    </button>
                    <span className="text-xs font-mono w-12 text-center text-gray-600">{Math.round(zoom * 100)}%</span>
                    <button onClick={() => setZoom(Math.min(2, zoom + 0.1))} className="p-2 hover:bg-white rounded-md transition-colors shadow-sm" title="Aumentar">
                        <ZoomIn size={18} className="text-gray-600" />
                    </button>
                    <div className="w-px h-6 bg-gray-300 mx-2"></div>
                    <button onClick={() => setZoom(1)} className="p-2 hover:bg-white rounded-md transition-colors shadow-sm" title="Restablecer">
                        <Maximize size={18} className="text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 overflow-auto p-8 relative cursor-grab active:cursor-grabbing">
                <div 
                    className="min-w-max min-h-max flex justify-center origin-top transition-transform duration-200 ease-out"
                    style={{ transform: `scale(${zoom})` }}
                >
                    {treeData.length === 0 ? (
                        <div className="text-gray-400 text-lg mt-20">No hay datos de empleados para mostrar.</div>
                    ) : (
                        treeData.map(node => <TreeNode key={node.id} node={node} level={0} />)
                    )}
                </div>
            </div>
        </div>
    );
}

// Recursive Tree Node Component
function TreeNode({ node, level }: { node: EmployeeNode; level: number }) {
    const hasChildren = node.children && node.children.length > 0;
    
    // Dynamic styling based on level for visual hierarchy
    const isRoot = level === 0;
    const cardWidth = isRoot ? 'w-64' : 'w-56';
    const cardBg = isRoot ? 'bg-white ring-2 ring-indigo-50' : 'bg-white';

    return (
        <div className="flex flex-col items-center">
            {/* Node Card */}
            <div className={`
                relative z-10 flex flex-col items-center p-4 rounded-xl shadow-sm border border-gray-200 
                ${cardWidth} ${cardBg} hover:shadow-lg hover:border-indigo-200 transition-all duration-300 group mb-8
            `}>
                <div className="relative mb-3">
                    <div className={`
                        w-14 h-14 rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-md
                        ${node.img ? 'bg-gray-100' : 'bg-gradient-to-br from-indigo-500 to-purple-600'}
                    `}>
                        {node.img ? (
                            <img src={node.img} alt={node.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-lg font-bold text-white">{node.name.charAt(0)}</span>
                        )}
                    </div>
                    {/* Status Indicator (Mockup) */}
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                
                <h3 className="font-bold text-gray-900 text-center truncate w-full px-2" title={node.name}>
                    {node.name}
                </h3>
                <p className="text-xs text-indigo-600 font-medium text-center truncate w-full px-2 uppercase tracking-wide">
                    {node.title}
                </p>
                
                {/* Hover Details */}
                <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center pointer-events-none">
                    <p className="text-xs text-gray-500 mb-1">ID: {node.id}</p>
                    <button className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-medium pointer-events-auto hover:bg-indigo-100">
                        Ver Perfil
                    </button>
                </div>
            </div>

            {/* Recursion & Connectors */}
            {hasChildren && (
                <div className="flex flex-col items-center">
                    {/* Vertical line leaving the parent */}
                    <div className="w-px h-6 bg-gray-300 -mt-8 mb-0 relative z-0"></div>
                    
                    {/* Horizontal Bar Wrapper */}
                    <div className="flex relative pt-4">
                        {/* Horizontal Connector Line */}
                        {node.children!.length > 1 && (
                            <div 
                                className="absolute top-0 h-px bg-gray-300"
                                style={{ 
                                    left: `calc(${100 / node.children!.length / 2}% + 1px)`, 
                                    right: `calc(${100 / node.children!.length / 2}% + 1px)` 
                                }}
                            ></div>
                        )}

                        {/* Render Children */}
                        {node.children!.map((child) => (
                            <div key={child.id} className="flex flex-col items-center px-4 relative">
                                {/* Vertical line entering the child */}
                                <div className="absolute top-0 w-px h-4 bg-gray-300"></div>
                                <TreeNode node={child} level={level + 1} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

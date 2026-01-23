import { useEffect, useState } from 'react';
import api from '../../services/api';

interface EmployeeNode {
    id: number;
    name: string;
    title: string;
    parentId: number | null;
    img: string | null;
    children?: EmployeeNode[];
}

export default function OrganigramPage() {
    const [tree, setTree] = useState<EmployeeNode[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/organigram/')
            .then(res => {
                const flatData = res.data;
                const treeData = buildTree(flatData);
                setTree(treeData);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando organigrama...</div>;

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Organigrama Jerárquico</h1>
            <div className="overflow-x-auto pb-12 bg-gray-50 p-4 rounded-xl min-h-[500px]">
                <div className="min-w-max flex justify-center pt-8">
                    {tree.map(node => <TreeNode key={node.id} node={node} />)}
                </div>
            </div>
        </div>
    );
}

function buildTree(items: any[]): EmployeeNode[] {
    const rootItems: EmployeeNode[] = [];
    const lookup: { [key: number]: EmployeeNode } = {};

    for (const item of items) {
        const itemId = item.id;
        const node: EmployeeNode = { ...item, children: [] };
        lookup[itemId] = node;
    }

    for (const item of items) {
        if (item.parentId === null) {
            rootItems.push(lookup[item.id]);
        } else {
            const parent = lookup[item.parentId];
            if (parent) {
                parent.children?.push(lookup[item.id]);
            }
        }
    }

    return rootItems;
}

function TreeNode({ node }: { node: EmployeeNode }) {
    return (
        <div className="flex flex-col items-center">
            <div className="border border-gray-200 p-4 rounded-lg shadow-sm bg-white w-52 text-center mb-4 relative z-10 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-indigo-100 rounded-full mx-auto mb-2 overflow-hidden flex items-center justify-center">
                     {node.img ? <img src={node.img} alt={node.name} className="w-full h-full object-cover"/> : <span className="text-xl font-bold text-indigo-500">{node.name.charAt(0)}</span>}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm truncate" title={node.name}>{node.name}</h3>
                <p className="text-xs text-indigo-600 truncate" title={node.title}>{node.title}</p>
            </div>
            
            {node.children && node.children.length > 0 && (
                <div className="flex flex-col items-center relative">
                    <div className="w-px h-6 bg-gray-300"></div>
                    <div className="flex relative">
                        {/* Horizontal connector line */}
                        {node.children.length > 1 && (
                             <div className="absolute top-0 left-0 right-0 h-px bg-gray-300" style={{ left: '50%', right: '50%', transform: `scaleX(${node.children.length - 1})` }}></div>
                        )}
                         {/* We need a better way to draw lines, but for now CSS borders on wrapper logic is tricky without precise width calculation. 
                             Simplified: Just stack them horizontally with top borders? No, tree lines are specific.
                             Let's use a simpler visual approach: vertical line down, then horizontal bar, then vertical lines down to children.
                         */}
                        
                        <div className="flex space-x-4 relative">
                            {/* Horizontal bar connecting all children */}
                            <div className="absolute top-0 left-0 right-0 h-px bg-gray-300 transform -translate-y-px" style={{ 
                                left: `calc(${100 / node.children.length / 2}% + 1px)`, 
                                right: `calc(${100 / node.children.length / 2}% + 1px)` 
                            }}></div>
                            
                            {node.children.map((child, index) => (
                                <div key={child.id} className="flex flex-col items-center relative pt-4">
                                     {/* Vertical line from horizontal bar to child */}
                                    <div className="absolute top-0 w-px h-4 bg-gray-300"></div>
                                    <TreeNode node={child} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

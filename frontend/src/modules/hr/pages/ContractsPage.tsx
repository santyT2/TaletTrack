import { useState, useEffect } from 'react';
import hrService, { type Contract } from '../../../services/hrService';
import { FileText, AlertTriangle, Download, Calendar, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ContractsPage() {
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Mock employee ID for demo purposes - in real app would come from auth context or route param
    const DEMO_EMPLOYEE_ID = 1; 

    useEffect(() => {
        loadContracts();
    }, []);

    const loadContracts = async () => {
        try {
            setLoading(true);
            // In a real scenario, we might list all contracts or filter by user
            // Here we try to fetch for a specific employee as per service definition, 
            // or we could adjust the service to fetch all if no ID provided.
            // For now, let's assume we want to see contracts for the current view context
            const data = await hrService.getContracts(DEMO_EMPLOYEE_ID); 
            setContracts(data);
        } catch (err) {
            console.error(err);
            // If API fails (e.g. 404 because employee doesn't exist), we handle it gracefully
            setError('No se pudieron cargar los contratos.');
            // Mock data for UI demonstration if backend is empty/failing
            // setContracts(MOCK_CONTRACTS); 
        } finally {
            setLoading(false);
        }
    };

    const isExpiringSoon = (endDate?: string | null) => {
        if (!endDate) return false;
        const days = differenceInDays(parseISO(endDate), new Date());
        return days >= 0 && days <= 30;
    };

    const isExpired = (endDate?: string | null) => {
        if (!endDate) return false;
        return differenceInDays(parseISO(endDate), new Date()) < 0;
    };

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-gray-900">Historial de Contratos</h1>
                <p className="text-gray-500">Documentación legal y acuerdos laborales.</p>
            </header>

            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 flex items-center gap-2">
                    <AlertTriangle size={20} />
                    {error}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo de Contrato</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vigencia</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salario</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">Cargando contratos...</td>
                                </tr>
                            ) : contracts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No hay contratos registrados.</td>
                                </tr>
                            ) : (
                                contracts.map((contract) => {
                                    const expiring = isExpiringSoon(contract.end_date);
                                    const expired = isExpired(contract.end_date);
                                    
                                    return (
                                        <tr key={contract.id} className={`transition-colors ${expiring ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'}`}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className={`flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center ${expiring ? 'bg-red-100 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                                        <FileText size={20} />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900 capitalize">
                                                            {contract.contract_type.replace('_', ' ')}
                                                        </div>
                                                        <div className="text-xs text-gray-500">ID: {contract.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col text-sm">
                                                    <div className="flex items-center gap-1 text-gray-900">
                                                        <Calendar size={14} className="text-gray-400" />
                                                        {format(parseISO(contract.start_date), 'dd MMM yyyy', { locale: es })}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-gray-500 mt-1">
                                                        <span className="text-gray-400">Hasta:</span>
                                                        {contract.end_date ? (
                                                            <span className={expiring ? 'text-red-600 font-bold' : ''}>
                                                                {format(parseISO(contract.end_date), 'dd MMM yyyy', { locale: es })}
                                                            </span>
                                                        ) : (
                                                            <span className="text-green-600 font-medium">Indefinido</span>
                                                        )}
                                                    </div>
                                                    {expiring && (
                                                        <span className="text-xs text-red-600 font-bold flex items-center gap-1 mt-1">
                                                            <AlertTriangle size={10} /> Vence pronto
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center text-sm text-gray-900 font-medium">
                                                    <DollarSign size={14} className="text-gray-400 mr-1" />
                                                    {Number(contract.salary).toLocaleString('es-CO')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {contract.is_active && !expired ? (
                                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 flex items-center w-fit gap-1">
                                                        <CheckCircle size={12}/> Activo
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 flex items-center w-fit gap-1">
                                                        <XCircle size={12}/> Inactivo
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {contract.document ? (
                                                    <a href={contract.document} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1">
                                                        <Download size={16} /> Descargar
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-400 italic text-xs">Sin adjunto</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

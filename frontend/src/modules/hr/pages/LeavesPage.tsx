import { useEffect, useState } from 'react';
import leavesService, { type LeaveRequest } from '../../../core/services/leavesService';
import LeavesManagementTable from '../components/LeavesManagementTable';
import { AlertCircle } from 'lucide-react';

export default function LeavesPage() {
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        void loadLeaves();
    }, []);

    const loadLeaves = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await leavesService.list({ status: 'PENDING' });
            setLeaves(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setError('Error al cargar las solicitudes.');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: number) => {
        try {
            await leavesService.approve(id);
            await loadLeaves();
        } catch (err) {
            console.error(err);
            setError('No se pudo aprobar la solicitud.');
        }
    };

    const handleReject = async (id: number, reason: string) => {
        try {
            await leavesService.reject(id, reason);
            await loadLeaves();
        } catch (err) {
            console.error(err);
            setError('No se pudo rechazar la solicitud.');
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Bandeja de permisos</h1>
                    <p className="text-gray-500">Revisa, aprueba o rechaza con motivo obligatorio.</p>
                </div>
                <button
                    onClick={() => void loadLeaves()}
                    className="text-sm font-semibold text-indigo-700 bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100 hover:bg-indigo-100"
                >
                    Refrescar
                </button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 flex items-center gap-2 animate-fade-in">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            <LeavesManagementTable
                leaves={leaves}
                loading={loading}
                onApprove={handleApprove}
                onReject={handleReject}
            />
        </div>
    );
}

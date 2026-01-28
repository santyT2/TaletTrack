import { useMemo, useState } from 'react';
import { differenceInDays, format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlertCircle, CheckCircle, Clock, Loader2, X, XCircle } from 'lucide-react';
import type { LeaveRequest } from '../../../core/services/leavesService';

interface Props {
  leaves: LeaveRequest[];
  loading?: boolean;
  onApprove: (id: number) => Promise<void> | void;
  onReject: (id: number, reason: string) => Promise<void> | void;
}

export default function LeavesManagementTable({ leaves, loading = false, onApprove, onReject }: Props) {
  const [rejectModal, setRejectModal] = useState<{ id: number; reason: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const rows = useMemo(() => Array.isArray(leaves) ? leaves : [], [leaves]);

  const handleRejectConfirm = async () => {
    if (!rejectModal || !rejectModal.reason.trim()) {
      setLocalError('Debes ingresar un motivo de rechazo.');
      return;
    }
    try {
      setSubmitting(true);
      await onReject(rejectModal.id, rejectModal.reason.trim());
      setRejectModal(null);
      setLocalError(null);
    } catch (err) {
      console.error(err);
      setLocalError('No se pudo rechazar la solicitud.');
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (status: LeaveRequest['status']) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700 inline-flex items-center gap-1">
            <CheckCircle size={12} /> Aprobado
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-700 inline-flex items-center gap-1">
            <X size={12} /> Rechazado
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-700 inline-flex items-center gap-1">
            <Clock size={12} /> Pendiente
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solicitante</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motivo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fechas</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duración</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin inline mr-2" /> Cargando solicitudes...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No hay solicitudes registradas.</td>
              </tr>
            ) : (
              rows.map((leave) => {
                const start = parseISO(String(leave.start_date));
                const end = parseISO(String(leave.end_date));
                const duration = Number(leave.days ?? differenceInDays(end, start) + 1);

                return (
                  <tr key={leave.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{leave.empleado_nombre ?? 'Empleado'}</div>
                      <div className="text-xs text-gray-500">ID {leave.empleado}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{leave.reason || 'Permiso'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex flex-col">
                        <span className="font-medium">{format(start, 'dd MMM yyyy', { locale: es })}</span>
                        <span className="text-gray-500 text-xs">hasta {format(end, 'dd MMM yyyy', { locale: es })}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{duration} días</td>
                    <td className="px-6 py-4 whitespace-nowrap">{statusBadge(leave.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2 text-sm">
                      <button
                        onClick={() => onApprove(leave.id)}
                        disabled={leave.status !== 'PENDING' || submitting}
                        className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 font-semibold hover:bg-emerald-100 disabled:opacity-60"
                      >
                        Aprobar
                      </button>
                      <button
                        onClick={() => setRejectModal({ id: leave.id, reason: '' })}
                        disabled={leave.status !== 'PENDING' || submitting}
                        className="px-3 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-100 font-semibold hover:bg-rose-100 disabled:opacity-60"
                      >
                        Rechazar
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {rejectModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 space-y-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Motivo de rechazo</h3>
              <button onClick={() => setRejectModal(null)} className="text-gray-500 hover:text-gray-700">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600">Esta acción registrará al revisor y notificará al solicitante.</p>
            <textarea
              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
              rows={4}
              placeholder="Ingresa el motivo de rechazo"
              value={rejectModal.reason}
              onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
            />
            {localError && (
              <div className="flex items-center gap-2 text-sm text-rose-700 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4" /> {localError}
              </div>
            )}
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setRejectModal(null)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                onClick={() => void handleRejectConfirm()}
                disabled={submitting}
                className="px-4 py-2 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-700 disabled:opacity-60"
              >
                {submitting ? 'Enviando...' : 'Rechazar' }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

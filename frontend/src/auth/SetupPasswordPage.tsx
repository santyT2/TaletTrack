import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import authService from '../services/authService';
import { useAuth } from './AuthContext';

export default function SetupPasswordPage() {
  const { user, markPasswordChanged, logout } = useAuth();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    try {
      await authService.changePasswordInitial(newPassword, user.accessToken);
      markPasswordChanged();
      const dest = user.role === 'EMPLOYEE' ? '/portal' : '/dashboard';
      navigate(dest, { replace: true });
    } catch (err: any) {
      const detail = err?.response?.data?.detail || 'No pudimos actualizar tu contraseña.';
      setError(detail);
      if (err?.response?.status === 401) {
        logout();
        navigate('/login', { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 w-full max-w-md p-8 space-y-4">
        <div>
          <p className="text-xs uppercase text-slate-500">Seguridad</p>
          <h1 className="text-2xl font-bold text-slate-900">Crea tu nueva contraseña</h1>
          <p className="text-sm text-slate-600">Tu acceso está bloqueado hasta cambiar la contraseña inicial.</p>
        </div>
        {error && <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">{error}</p>}
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm text-slate-700">Nueva contraseña</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              minLength={6}
              required
            />
          </div>
          <div>
            <label className="text-sm text-slate-700">Confirmar contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              minLength={6}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 text-white py-2 font-semibold hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? 'Guardando...' : 'Guardar y continuar'}
          </button>
        </form>
      </div>
    </div>
  );
}

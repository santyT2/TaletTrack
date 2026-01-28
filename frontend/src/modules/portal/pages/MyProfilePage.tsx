import { IdCard, Mail, Phone, ShieldCheck, Briefcase, Clock3, MapPin, AlertTriangle } from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useAuth } from '../../../core/auth/AuthContext';
import portalService, { type PortalProfile } from '../../../core/services/portalService';

export default function MyProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<PortalProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const money = useMemo(() => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', maximumFractionDigits: 0 }), []);

  const renderWeekdays = (dias: number[] | null | undefined): string => {
    if (!dias || dias.length === 0) return '—';
    const mapping = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return dias.map((d) => mapping[d] || String(d)).join(', ');
  };

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        const data = await portalService.getProfile();
        setProfile(data);
      } catch (e: any) {
        setError('No pudimos cargar tu perfil.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <p className="p-6 text-slate-600">Cargando perfil...</p>;
  if (error) return <p className="p-6 text-rose-600">{error}</p>;

  return (
    <section className="space-y-6">
      <header className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs uppercase text-slate-500">Mi perfil</p>
          <h1 className="text-2xl font-bold text-slate-900">{profile?.nombre || user?.name || 'Empleado'}</h1>
          <p className="text-slate-600">Documento {profile?.documento || user?.id}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge icon={<ShieldCheck className="w-4 h-4" />} text="Acceso seguro" />
          {profile?.cargo ? <Badge icon={<Briefcase className="w-4 h-4" />} text={profile.cargo} /> : null}
          {profile?.supervisor_name ? <Badge icon={<ShieldCheck className="w-4 h-4" />} text={`Jefe: ${profile.supervisor_name}`} /> : null}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Datos personales" icon={<IdCard className="w-5 h-5 text-slate-600" />}>
          <DetailRow label="Documento" value={profile?.documento || '—'} />
          <DetailRow label="Correo" value={profile?.email || '—'} icon={<Mail className="w-4 h-4 text-slate-500" />} />
          <DetailRow label="Teléfono" value={profile?.telefono || '—'} icon={<Phone className="w-4 h-4 text-slate-500" />} />
          <DetailRow label="Sucursal" value={profile?.sucursal || '—'} icon={<MapPin className="w-4 h-4 text-slate-500" />} />
          <DetailRow label="Cargo" value={profile?.cargo || '—'} />
          <DetailRow label="Jefe directo" value={profile?.supervisor_name || 'Sin supervisor asignado'} />
        </Card>

        <Card title="Contrato" icon={<Briefcase className="w-5 h-5 text-slate-600" />}>
          {profile?.contract_details ? (
            <>
              <DetailRow label="Tipo" value={profile.contract_details.type} />
              <DetailRow label="Inicio" value={profile.contract_details.start_date} />
              <DetailRow label="Fin" value={profile.contract_details.end_date || 'Indefinido'} />
              <DetailRow label="Salario" value={money.format(profile.contract_details.salary)} />
            </>
          ) : (
            <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-sm">
              <AlertTriangle className="w-4 h-4" /> Sin contrato activo, contacte a RRHH
            </div>
          )}
        </Card>
      </div>

      <Card title="Turno asignado" icon={<Clock3 className="w-5 h-5 text-slate-600" />}>
        {profile?.shift_details ? (
          <>
            <DetailRow label="Nombre" value={profile.shift_details.name} />
            <DetailRow label="Horario" value={`${profile.shift_details.start_time} - ${profile.shift_details.end_time}`} />
            <DetailRow label="Días" value={renderWeekdays(profile.shift_details.days)} />
          </>
        ) : (
          <DetailRow label="Turno" value="Sin turno asignado" />
        )}
      </Card>
    </section>
  );
}

function Card({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>
    </div>
  );
}

function DetailRow({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      {icon ? <span className="mt-0.5">{icon}</span> : null}
      <div>
        <p className="text-xs uppercase text-slate-500">{label}</p>
        <p className="text-sm font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function Badge({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold bg-brand-50 text-brand-700 border border-brand-100">
      {icon}
      {text}
    </span>
  );
}

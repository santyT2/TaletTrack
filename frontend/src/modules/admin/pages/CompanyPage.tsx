export default function CompanyPage() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase text-slate-500">Configuración</p>
        <h1 className="text-2xl font-bold text-slate-900">Empresa</h1>
        <p className="text-slate-600">Datos generales de la organización, políticas y branding.</p>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 text-slate-600">
        <p className="text-sm">Configura aquí la razón social, logo, colores y parámetros globales.</p>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Download, Calendar, DollarSign, Clock, TrendingUp } from 'lucide-react';

interface PreNominaData {
  empleado: string;
  dias_trabajados: number;
  horas_extra: number;
  minutos_atraso: number;
}

export default function PrenominaPage() {
  const [mes, setMes] = useState<string>(new Date().toISOString().slice(0, 7));
  const [datos] = useState<PreNominaData[]>([
    // Datos de ejemplo - en producción vendrían del backend
    {
      empleado: 'Juan Pérez',
      dias_trabajados: 22,
      horas_extra: 5.5,
      minutos_atraso: 15,
    },
    {
      empleado: 'María García',
      dias_trabajados: 20,
      horas_extra: 2.0,
      minutos_atraso: 0,
    },
    {
      empleado: 'Carlos Rodríguez',
      dias_trabajados: 21,
      horas_extra: 8.0,
      minutos_atraso: 45,
    },
  ]);

  const exportarExcel = async () => {
    try {
      const blob = await import('../../../services/attendanceService').then(
        (module) => module.default.exportarExcel()
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pre-nomina-${mes}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exportando pre-nómina:', error);
      alert('Error al exportar el archivo');
    }
  };

  const totalDias = datos.reduce((sum, d) => sum + d.dias_trabajados, 0);
  const totalHorasExtra = datos.reduce((sum, d) => sum + d.horas_extra, 0);
  const totalAtrasos = datos.reduce((sum, d) => sum + d.minutos_atraso, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pre-nómina</h1>
          <p className="text-gray-600 mt-1">Resumen mensual para cálculo de nómina</p>
        </div>
        <button
          onClick={exportarExcel}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Download className="w-5 h-5 mr-2" />
          Descargar Excel
        </button>
      </div>

      {/* Selector de Mes */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-blue-600 mr-2" />
            <label className="text-sm font-medium text-gray-700 mr-4">
              Seleccionar Mes
            </label>
            <input
              type="month"
              value={mes}
              onChange={(e) => setMes(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={() => {/* Recargar datos */}}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Actualizar Datos
          </button>
        </div>
      </div>

      {/* Cards de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Días Trabajados</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalDias}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Horas Extra</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{totalHorasExtra.toFixed(1)}</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Minutos Atraso</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{totalAtrasos}</p>
            </div>
            <div className="bg-red-100 rounded-full p-3">
              <Clock className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabla Detallada */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <DollarSign className="w-5 h-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">
              Detalle por Empleado - {new Date(mes + '-01').toLocaleDateString('es-ES', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empleado
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Días Trabajados
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Horas Extra
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Minutos de Atraso
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {datos.map((empleado, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {empleado.empleado}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm text-gray-900 font-semibold">
                      {empleado.dias_trabajados}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm text-green-600 font-semibold">
                      {empleado.horas_extra.toFixed(1)} hrs
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className={`text-sm font-semibold ${
                      empleado.minutos_atraso > 0 ? 'text-red-600' : 'text-gray-400'
                    }`}>
                      {empleado.minutos_atraso > 0 ? `${empleado.minutos_atraso} min` : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {empleado.minutos_atraso === 0 ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Puntual
                      </span>
                    ) : empleado.minutos_atraso < 30 ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Advertencia
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Atención
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr className="font-semibold">
                <td className="px-6 py-4 text-sm text-gray-900">TOTALES</td>
                <td className="px-6 py-4 text-sm text-gray-900 text-center">{totalDias}</td>
                <td className="px-6 py-4 text-sm text-green-600 text-center">{totalHorasExtra.toFixed(1)} hrs</td>
                <td className="px-6 py-4 text-sm text-red-600 text-center">{totalAtrasos} min</td>
                <td className="px-6 py-4"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Información Adicional */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Información</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• El mes laboral considera días hábiles</li>
            <li>• Horas extra se calculan después de 8 horas diarias</li>
            <li>• Los atrasos se acumulan por mes</li>
          </ul>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 mb-2">📊 Próximos Pasos</h3>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Revisar los datos antes de procesar nómina</li>
            <li>• Descargar Excel para enviar a Contabilidad</li>
            <li>• Verificar empleados con atrasos significativos</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

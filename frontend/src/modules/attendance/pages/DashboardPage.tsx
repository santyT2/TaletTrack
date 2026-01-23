import { useState, useEffect } from 'react';
import { Clock, Users, CheckCircle, AlertCircle, MapPin } from 'lucide-react';
import attendanceService, { type AsistenciaHoy } from '../../../services/attendanceService';

export default function DashboardPage() {
  const [registros, setRegistros] = useState<AsistenciaHoy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarAsistenciaHoy();
  }, []);

  const cargarAsistenciaHoy = async () => {
    try {
      const data = await attendanceService.obtenerHoy();
      setRegistros(data);
    } catch (error) {
      console.error('Error cargando asistencia:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPresentes = registros.length;
  const totalATiempo = registros.filter(r => r.estado === 'A tiempo').length;
  const totalTarde = registros.filter(r => r.estado === 'Tarde').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Asistencia</h1>
          <p className="text-gray-600 mt-1">Vista general de asistencia del día</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Fecha</p>
          <p className="text-lg font-semibold">{new Date().toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Presentes</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalPresentes}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">A Tiempo</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{totalATiempo}</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tardanzas</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{totalTarde}</p>
            </div>
            <div className="bg-red-100 rounded-full p-3">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Mapa de Ubicaciones */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <MapPin className="w-5 h-5 text-blue-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">Ubicaciones de Registro</h2>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : registros.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No hay registros de asistencia hoy</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Lista de registros con ubicación */}
            {registros.map((registro) => (
              <div key={registro.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    registro.estado === 'A tiempo' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <p className="font-medium text-gray-900">{registro.empleado_nombre}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(registro.fecha_hora).toLocaleTimeString('es-ES', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    registro.estado === 'A tiempo' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {registro.estado}
                  </span>
                  {registro.lat && registro.lng && (
                    <p className="text-xs text-gray-500 mt-1">
                      📍 {registro.lat.toFixed(4)}, {registro.lng.toFixed(4)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <Clock className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">Horario de Entrada</p>
            <p className="text-sm text-blue-700 mt-1">
              Las tardanzas se marcan automáticamente después de las 9:00 AM
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

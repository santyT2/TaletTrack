import { useState } from 'react';
import { LogIn, LogOut, MapPin, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import attendanceService from '../../../services/attendanceService';

type TipoMarcacion = 'ENTRADA' | 'SALIDA';

export default function MarkPage() {
  const [tipo, setTipo] = useState<TipoMarcacion>('ENTRADA');
  const [loading, setLoading] = useState(false);
  const [ubicacion, setUbicacion] = useState<{ lat: number; lng: number } | null>(null);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);
  const [obteniendoUbicacion, setObteniendoUbicacion] = useState(false);

  const obtenerUbicacion = () => {
    setObteniendoUbicacion(true);
    setMensaje(null);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUbicacion({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setObteniendoUbicacion(false);
          setMensaje({
            tipo: 'success',
            texto: '📍 Ubicación obtenida correctamente',
          });
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error);
          setObteniendoUbicacion(false);
          setMensaje({
            tipo: 'error',
            texto: 'No se pudo obtener la ubicación. Puedes marcar sin ubicación.',
          });
        }
      );
    } else {
      setObteniendoUbicacion(false);
      setMensaje({
        tipo: 'error',
        texto: 'Tu navegador no soporta geolocalización',
      });
    }
  };

  const marcarAsistencia = async () => {
    setLoading(true);
    setMensaje(null);

    try {
      const response = await attendanceService.marcar({
        tipo,
        latitud: ubicacion?.lat,
        longitud: ubicacion?.lng,
      });

      if (response.success) {
        setMensaje({
          tipo: 'success',
          texto: response.message,
        });
        // Cambiar automáticamente al tipo contrario después de marcar
        setTipo(tipo === 'ENTRADA' ? 'SALIDA' : 'ENTRADA');
        setUbicacion(null);
      } else {
        setMensaje({
          tipo: 'error',
          texto: response.message,
        });
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al marcar asistencia';
      setMensaje({
        tipo: 'error',
        texto: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Marcar Asistencia</h1>
        <p className="text-gray-600 mt-2">Registra tu entrada o salida del día</p>
      </div>

      {/* Card Principal */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Selector de Tipo */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Tipo de Marcación
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setTipo('ENTRADA')}
              className={`p-6 rounded-lg border-2 transition-all ${
                tipo === 'ENTRADA'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <LogIn className={`w-12 h-12 mx-auto mb-3 ${
                tipo === 'ENTRADA' ? 'text-green-600' : 'text-gray-400'
              }`} />
              <p className={`font-semibold text-lg ${
                tipo === 'ENTRADA' ? 'text-green-900' : 'text-gray-600'
              }`}>
                Entrada
              </p>
              <p className="text-sm text-gray-500 mt-1">Inicio de jornada</p>
            </button>

            <button
              onClick={() => setTipo('SALIDA')}
              className={`p-6 rounded-lg border-2 transition-all ${
                tipo === 'SALIDA'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <LogOut className={`w-12 h-12 mx-auto mb-3 ${
                tipo === 'SALIDA' ? 'text-blue-600' : 'text-gray-400'
              }`} />
              <p className={`font-semibold text-lg ${
                tipo === 'SALIDA' ? 'text-blue-900' : 'text-gray-600'
              }`}>
                Salida
              </p>
              <p className="text-sm text-gray-500 mt-1">Fin de jornada</p>
            </button>
          </div>
        </div>

        {/* Ubicación */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Ubicación (Opcional)
          </label>
          
          {!ubicacion ? (
            <button
              onClick={obtenerUbicacion}
              disabled={obteniendoUbicacion}
              className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors disabled:opacity-50"
            >
              {obteniendoUbicacion ? (
                <div className="flex items-center justify-center">
                  <Loader className="w-5 h-5 animate-spin text-blue-600 mr-2" />
                  <span className="text-blue-600">Obteniendo ubicación...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-gray-600">Obtener mi ubicación</span>
                </div>
              )}
            </button>
          ) : (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-green-900">Ubicación obtenida</p>
                    <p className="text-xs text-green-700">
                      Lat: {ubicacion.lat.toFixed(6)}, Lng: {ubicacion.lng.toFixed(6)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setUbicacion(null)}
                  className="text-sm text-green-600 hover:text-green-700"
                >
                  Quitar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mensajes */}
        {mensaje && (
          <div className={`mb-6 p-4 rounded-lg ${
            mensaje.tipo === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center">
              {mensaje.tipo === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              )}
              <p className={`text-sm font-medium ${
                mensaje.tipo === 'success' ? 'text-green-900' : 'text-red-900'
              }`}>
                {mensaje.texto}
              </p>
            </div>
          </div>
        )}

        {/* Botón Principal */}
        <button
          onClick={marcarAsistencia}
          disabled={loading}
          className={`w-full py-4 px-6 rounded-lg text-white font-semibold text-lg transition-colors disabled:opacity-50 ${
            tipo === 'ENTRADA'
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <Loader className="w-5 h-5 animate-spin mr-2" />
              Marcando...
            </div>
          ) : (
            `Marcar ${tipo}`
          )}
        </button>

        {/* Info */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            ℹ️ <strong>Nota:</strong> El horario de entrada es hasta las 9:00 AM. 
            Las marcaciones posteriores se registrarán como tardanzas.
          </p>
        </div>
      </div>

      {/* Hora Actual */}
      <div className="text-center">
        <p className="text-sm text-gray-500">Hora actual</p>
        <p className="text-2xl font-bold text-gray-900">
          {new Date().toLocaleTimeString('es-ES')}
        </p>
      </div>
    </div>
  );
}

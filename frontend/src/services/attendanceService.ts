import axios from 'axios';

// Base API para módulo de asistencia (DRF router)
const API_URL = 'http://localhost:8000/api/attendance';

export interface RegistroAsistencia {
  id: number;
  empleado: number;
  empleado_nombre?: string;
  sucursal?: string;
  cargo?: string;
  fecha_hora: string;
  tipo: 'ENTRADA' | 'SALIDA';
  latitud?: number;
  longitud?: number;
  es_tardanza: boolean;
  minutos_atraso: number;
}

export interface MarcarAsistenciaRequest {
  tipo: 'ENTRADA' | 'SALIDA';
  latitud?: number;
  longitud?: number;
  empleado_id?: number;
}

export interface MarcarAsistenciaResponse {
  success: boolean;
  message: string;
  registro?: {
    id: number;
    tipo: string;
    fecha_hora: string;
    es_tardanza: boolean;
  };
}

export interface AsistenciaHoy {
  id: number;
  empleado_nombre: string;
  estado: 'A tiempo' | 'Tarde';
  lat: number | null;
  lng: number | null;
  fecha_hora: string;
}

export interface PreNominaEmpleado {
  empleado: string;
  dias_trabajados: number;
  horas_extra: number;
  minutos_atraso: number;
}

const attendanceService = {
  // Marcar asistencia (entrada/salida)
  async marcar(data: MarcarAsistenciaRequest): Promise<MarcarAsistenciaResponse> {
    const response = await axios.post<MarcarAsistenciaResponse>(`${API_URL}/marcar/`, data);
    return response.data;
  },

  // Obtener asistencia de hoy (para el mapa del dashboard)
  async obtenerHoy(): Promise<AsistenciaHoy[]> {
    const response = await axios.get<AsistenciaHoy[]>(`${API_URL}/today/`);
    return response.data;
  },

  // Exportar reporte de pre-nómina en Excel
  async exportarExcel(): Promise<Blob> {
    const response = await axios.get(`${API_URL}/exportar-excel/`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Obtener registros de asistencia con filtros (usando la API genérica de Django)
  async listar(params?: {
    empleado?: number;
    fecha_inicio?: string;
    fecha_fin?: string;
    tipo?: 'ENTRADA' | 'SALIDA';
  }): Promise<RegistroAsistencia[]> {
    const response = await axios.get<RegistroAsistencia[]>(`${API_URL}/registros/`, { params });
    return response.data;
  }
};

export default attendanceService;

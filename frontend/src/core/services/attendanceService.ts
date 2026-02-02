import axios from 'axios';

// Base API para módulo de asistencia (DRF router)
const API_URL = 'http://localhost:8000/api/attendance';

// Reutilizamos un cliente con token para que los endpoints protegidos devuelvan datos
const client = axios.create({ baseURL: API_URL });
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export type AttendanceType = 'CHECK_IN' | 'CHECK_OUT' | 'LUNCH_START' | 'LUNCH_END';

export interface AttendanceRecordNew {
  id: number;
  employee: number;
  employee_name?: string;
  timestamp: string;
  type: AttendanceType;
  latitude?: number | null;
  longitude?: number | null;
  device_info?: string | null;
  is_late: boolean;
  sucursal_nombre?: string | null;
  cargo_nombre?: string | null;
  sucursal_id?: number | null;
}

export interface AttendanceTodayStatus {
  has_checked_in: boolean;
  has_checked_out: boolean;
  last_type?: AttendanceType | null;
  last_timestamp?: string | null;
  server_time: string;
}

export interface RegistroAsistencia {
  id: number;
  empleado: number;
  empleado_nombre?: string;
  sucursal?: string;
  cargo?: string;
  fecha_hora: string;
  tipo: 'ENTRADA' | 'SALIDA';
  latitud?: number | null;
  longitud?: number | null;
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
    const response = await client.post<MarcarAsistenciaResponse>('/marcar/', data);
    return response.data;
  },

  // Nueva API de marcación georreferenciada
  async markNew(payload: { type: AttendanceType; latitude?: number; longitude?: number }): Promise<AttendanceRecordNew> {
    const response = await client.post<{ record: AttendanceRecordNew }>('/mark/', payload);
    return response.data.record;
  },

  async history(): Promise<AttendanceRecordNew[]> {
    const response = await client.get<AttendanceRecordNew[]>('/history/');
    return response.data;
  },

  async todayStatus(): Promise<AttendanceTodayStatus> {
    const response = await client.get<AttendanceTodayStatus>('/today-status/');
    return response.data;
  },

  async listRecords(params?: {
    date?: string;
    start_date?: string;
    end_date?: string;
    start_time?: string;
    end_time?: string;
    search?: string;
    employee?: number | string;
    sucursal?: number | string;
  }): Promise<AttendanceRecordNew[]> {
    const response = await client.get<AttendanceRecordNew[]>('/records/', { params });
    return Array.isArray(response.data?.results) ? (response.data as any).results : response.data;
  },

  // Obtener asistencia de hoy (para el mapa del dashboard)
  async obtenerHoy(): Promise<AsistenciaHoy[]> {
    const response = await client.get<AsistenciaHoy[]>('/today/');
    return response.data;
  },

  // Exportar reporte de pre-nómina en Excel
  async exportarExcel(): Promise<Blob> {
    const response = await client.get('/exportar-excel/', {
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
    hoy?: boolean;
  }): Promise<RegistroAsistencia[]> {
    const response = await client.get<RegistroAsistencia[]>('/registros/', { params });
    return response.data;
  },

  async listarHoy(): Promise<RegistroAsistencia[]> {
    const hoy = new Date().toISOString().slice(0, 10);
    return this.listar({ fecha_inicio: hoy, fecha_fin: hoy });
  }
};

export default attendanceService;

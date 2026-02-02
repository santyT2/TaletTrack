import api from './api';

export interface PortalProfile {
  id: number;
  nombre: string;
  documento: string;
  email: string;
  cargo: string | null;
  sucursal: string | null;
  foto_url: string | null;
  supervisor_name: string | null;
  manager_nombre?: string | null;
  salary?: number | null;
  telefono?: string | null;
  direccion?: string | null;
  turno?: string | null;
  contract_details: {
    id: number;
    type: string;
    start_date: string;
    end_date: string | null;
    salary: number;
  } | null;
  current_shift_detail?: {
    id: number;
    name: string;
    start_time: string;
    end_time: string;
    days: number[];
  } | null;
  shift_details: {
    id: number;
    name: string;
    start_time: string;
    end_time: string;
    days: number[];
  } | null;
}

export interface PortalStats {
  asistencia_mes_pct: number;
  attendance_score: number;
  onboarding_pendientes: number;
  pending_tasks: { id: number; description: string; due_date: string | null }[];
  vacaciones_disponibles: number;
  next_shift: { nombre: string; hora_inicio: string; hora_fin: string } | null;
}

const portalService = {
  async getProfile(): Promise<PortalProfile> {
    const response = await api.get('/portal/me/');
    return response.data as PortalProfile;
  },

  async getDashboardStats(): Promise<PortalStats> {
    const response = await api.get('/portal/dashboard-stats/');
    return response.data as PortalStats;
  },
};

export default portalService;

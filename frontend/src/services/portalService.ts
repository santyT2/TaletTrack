import api from './api';

export interface PortalProfile {
  id: number;
  nombre: string;
  documento: string;
  email: string;
  cargo: string | null;
  sucursal: string | null;
  foto_url: string | null;
  contrato: {
    id: number;
    tipo: string;
    estado: string;
    fecha_inicio: string;
    fecha_fin: string | null;
    salary: number;
    salario_base: number;
    beneficios: any;
  } | null;
  turno: {
    id: number;
    nombre: string;
    hora_inicio: string;
    hora_fin: string;
    dias_semana: number[];
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

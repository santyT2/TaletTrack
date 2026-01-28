import axios from 'axios';

const client = axios.create({ baseURL: 'http://localhost:8000/api/leaves' });
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface LeaveRequest {
  id: number;
  empleado: number;
  empleado_nombre?: string;
  start_date: string;
  end_date: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  rejection_reason?: string | null;
  approved_at?: string | null;
  reviewed_by?: number | null;
  created_at?: string;
}

export interface CreateLeavePayload {
  start_date: string;
  end_date: string;
  reason: string;
}

const leavesService = {
  async list(params?: { status?: LeaveStatus; empleado?: number; day?: string }): Promise<LeaveRequest[]> {
    const { data } = await client.get<LeaveRequest[]>(`/requests/`, { params });
    return Array.isArray((data as any)?.results) ? (data as any).results : data;
  },

  async create(payload: CreateLeavePayload): Promise<LeaveRequest> {
    const { data } = await client.post<LeaveRequest>(`/requests/`, payload);
    return data;
  },

  async approve(id: number): Promise<LeaveRequest> {
    const { data } = await client.post<LeaveRequest>(`/requests/${id}/approve/`);
    return data;
  },

  async reject(id: number, reason: string): Promise<LeaveRequest> {
    const { data } = await client.post<LeaveRequest>(`/requests/${id}/reject/`, { reason });
    return data;
  },
};

export default leavesService;

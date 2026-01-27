import axios from 'axios';

const API_URL = 'http://localhost:8000/api/leaves';

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
  created_at?: string;
}

export interface CreateLeavePayload {
  start_date: string;
  end_date: string;
  reason: string;
}

const leavesService = {
  async list(params?: { status?: LeaveStatus; empleado?: number; day?: string }): Promise<LeaveRequest[]> {
    const { data } = await axios.get<LeaveRequest[]>(`${API_URL}/requests/`, { params });
    return data;
  },

  async create(payload: CreateLeavePayload): Promise<LeaveRequest> {
    const { data } = await axios.post<LeaveRequest>(`${API_URL}/requests/`, payload);
    return data;
  },

  async approve(id: number): Promise<LeaveRequest> {
    const { data } = await axios.post<LeaveRequest>(`${API_URL}/requests/${id}/approve/`);
    return data;
  },

  async reject(id: number, reason: string): Promise<LeaveRequest> {
    const { data } = await axios.post<LeaveRequest>(`${API_URL}/requests/${id}/reject/`, { reason });
    return data;
  },
};

export default leavesService;

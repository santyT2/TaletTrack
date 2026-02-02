import api from './api';
import axios from 'axios';

const rootApi = axios.create({ baseURL: 'http://localhost:8000/api' });
rootApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// --- Interfaces ---

export interface KPIResponse {
    headcount_by_department: { sucursal__nombre: string; count: number }[];
    headcount_by_branch?: Array<{
        id?: number;
        branch?: string;
        sucursal?: string;
        sucursal_id?: number;
        sucursal__nombre?: string;
        name?: string;
        nombre?: string;
        count: number;
    }>;
    employees_by_status?: { status: string; count: number }[];
    retention_rate: number;
    pending_leaves_count: number;
    onboarding_progress: number;
}

export interface EmployeeNode {
    id: number;
    name: string;
    title: string;
    parentId: number | null;
    img: string | null;
    level?: string;
    position_name?: string;
    branch_name?: string;
    full_name?: string;
    children?: EmployeeNode[];
}

export interface EmployeeRow {
    id: number;
    nombres: string;
    apellidos: string;
    nombre_completo: string;
    email: string;
    foto_url?: string | null;
    cargo?: number | null;
    cargo_nombre?: string | null;
    sucursal?: number | null;
    sucursal_nombre?: string | null;
    estado: string;
    empresa?: number;
    manager?: number | null;
    manager_nombre?: string | null;
    position_details?: {
        id: number;
        name: string;
        min_salary: number | string;
        max_salary: number | string;
    } | null;
    active_contract?: {
        id: number;
        contract_type?: string;
        start_date?: string | null;
        end_date?: string | null;
        salary?: number | string;
        is_active?: boolean;
        schedule_description?: string | null;
    } | null;
    current_shift?: number | null;
    current_shift_name?: string | null;
    telefono?: string | null;
    direccion?: string | null;
}

export interface ContractItem {
    id: number;
    employee: number;
    employee_name: string;
    branch_name?: string | null;
    position_name?: string | null;
    contract_type: 'INDEFINIDO' | 'PLAZO_FIJO' | 'SERVICIOS_PRO';
    start_date: string;
    end_date: string | null;
    salary: number | string;
    schedule_description: string;
    is_active: boolean;
    days_until_expiry?: number | null;
    is_expiring_soon?: boolean;
}

export interface ContractPayload {
    employee: number;
    contract_type: 'INDEFINIDO' | 'PLAZO_FIJO' | 'SERVICIOS_PRO';
    start_date: string;
    end_date?: string | null;
    salary: number;
    schedule_description?: string;
    is_active?: boolean;
}

export interface PayrollPreviewRow {
    employee_id: number;
    employee_name: string;
    branch: string | null;
    position: string | null;
    base_salary: number;
    unexcused_days: number;
    days_worked: number;
    estimated_payment: number;
    contract_id: number;
    end_date: string | null;
}

export interface PayrollPreviewResponse {
    month: number;
    year: number;
    results: PayrollPreviewRow[];
    issues?: PayrollIssue[];
}

export interface PayrollIssue {
    employee_id: number;
    employee_name: string;
    level: 'error' | 'warning' | string;
    message: string;
}

export interface WorkShift {
    id: number;
    name: string;
    start_time: string;
    end_time: string;
    days: number[];
    empresa: number;
}

export interface SolicitudAusencia {
    id?: number;
    empleado: number;
    tipo_ausencia: number;
    fecha_inicio: string;
    fecha_fin: string;
    motivo: string;
    estado?: 'pendiente' | 'aprobado' | 'rechazado';
    adjunto?: string | File | null;
    created_at?: string;
}

export interface Contrato {
    id?: number;
    empleado: number;
    tipo: 'indefinido' | 'plazo_fijo' | 'pasantia' | 'obra_labor';
    fecha_inicio: string;
    fecha_fin?: string | null;
    salario_base: string | number;
    jornada_semanal_horas?: number;
    estado?: 'activo' | 'finalizado' | 'suspendido';
}

export interface OnboardingTask {
    id?: number;
    employee: number;
    title: string;
    is_completed?: boolean;
    due_date?: string | null;
}

export interface TipoAusenciaItem {
    id: number;
    nombre: string;
}

export interface EmpleadoLite {
    id: number;
    nombre_completo: string;
}

// --- Service Functions ---

const hrService = {
    /**
     * Obtiene los KPIs principales para el Dashboard.
     * Endpoint: GET /api/dashboard/kpi/
     */
    getDashboardKPIs: async (): Promise<KPIResponse> => {
        try {
            const response = await api.get<KPIResponse>('/dashboard/kpi/');
            return response.data;
        } catch (error) {
            console.error("Error fetching Dashboard KPIs:", error);
            throw error;
        }
    },

    /**
     * Obtiene la estructura plana del organigrama.
     * Endpoint: GET /api/hr/organigram/
     */
    getOrganigram: async (): Promise<any> => {
        try {
            const response = await rootApi.get('/hr/organigram/');
            return response.data;
        } catch (error) {
            console.error("Error fetching Organigram (HR endpoint), fallback to legacy:", error);
            const legacy = await api.get('/organigram/');
            return legacy.data;
        }
    },

    /**
     * Obtiene las solicitudes de permisos/vacaciones.
     * Endpoint: GET /api/solicitudes-ausencia/
     * @param filters Opcional: Filtros por empleado o estado
     */
    getLeaves: async (filters?: { empleado?: number; estado?: string }): Promise<SolicitudAusencia[]> => {
        try {
            const response = await api.get('/solicitudes-ausencia/', { params: filters });
            const data = Array.isArray(response.data?.results)
                ? response.data.results
                : Array.isArray(response.data)
                ? response.data
                : [];
            return data as SolicitudAusencia[];
        } catch (error) {
            console.error("Error fetching Leaves:", error);
            throw error;
        }
    },

    /**
     * Crea una nueva solicitud de permiso/vacaciones.
     * Endpoint: POST /api/solicitudes-ausencia/
     * @param data Datos de la solicitud
     */
    createLeave: async (data: SolicitudAusencia): Promise<SolicitudAusencia> => {
        try {
            // Si hay archivo, usar FormData
            if (data.adjunto instanceof File) {
                const form = new FormData();
                Object.entries(data).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        form.append(key, value as any);
                    }
                });
                const response = await api.post<SolicitudAusencia>('/solicitudes-ausencia/', form, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                return response.data;
            }

            const response = await api.post<SolicitudAusencia>('/solicitudes-ausencia/', data);
            return response.data;
        } catch (error) {
            console.error("Error creating Leave Request:", error);
            throw error;
        }
    },

    /** Lista de tipos de ausencia. */
    async getLeaveTypes(): Promise<TipoAusenciaItem[]> {
        const response = await api.get('/tipos-ausencia/');
        const data = Array.isArray(response.data?.results)
            ? response.data.results
            : Array.isArray(response.data)
            ? response.data
            : [];
        return data as TipoAusenciaItem[];
    },

    /** Lista breve de empleados para selects. */
    async getEmployeesLite(): Promise<EmpleadoLite[]> {
        const response = await api.get('/empleados/');
        const data = Array.isArray(response.data?.results)
            ? response.data.results
            : Array.isArray(response.data)
            ? response.data
            : [];
        return data.map((e: any) => ({ id: e.id, nombre_completo: e.nombre_completo || `${e.nombres || ''} ${e.apellidos || ''}`.trim() }));
    },

    /** Listado completo de empleados para HR. */
    async listEmployees(): Promise<EmployeeRow[]> {
        const response = await api.get('/empleados/');
        const data = Array.isArray(response.data?.results)
            ? response.data.results
            : Array.isArray(response.data)
            ? response.data
            : [];
        return data as EmployeeRow[];
    },

    /** Contratos (endpoint global: /api/contracts/) */
    async listContracts(): Promise<ContractItem[]> {
        const response = await rootApi.get('/contracts/');
        const data = Array.isArray(response.data?.results)
            ? response.data.results
            : Array.isArray(response.data)
            ? response.data
            : [];
        return data as ContractItem[];
    },

    /**
     * Obtiene los contratos de un empleado específico.
     * Endpoint: GET /api/contratos/?empleado={empleadoId}
     * @param empleadoId ID del empleado
     */
    getContracts: async (empleadoId: number): Promise<Contrato[]> => {
        try {
            const response = await api.get('/contratos/', {
                params: { empleado: empleadoId }
            });
            const data = Array.isArray(response.data?.results)
                ? response.data.results
                : Array.isArray(response.data)
                ? response.data
                : [];
            return data as Contrato[];
        } catch (error) {
            console.error(`Error fetching Contracts for employee ${empleadoId}:`, error);
            throw error;
        }
    },

    /**
     * Obtiene las tareas de onboarding de un empleado.
     * Endpoint: GET /api/onboarding/?employee={employeeId}
     */
    getOnboardingTasks: async (employeeId: number): Promise<OnboardingTask[]> => {
        try {
            const response = await api.get('/onboarding/', {
                params: { employee: employeeId }
            });
            const data = Array.isArray(response.data?.results)
                ? response.data.results
                : Array.isArray(response.data)
                ? response.data
                : [];
            return data as OnboardingTask[];
        } catch (error) {
            console.error(`Error fetching Onboarding Tasks for employee ${employeeId}:`, error);
            throw error;
        }
    },

    // ===== UPDATE/DELETE OPERATIONS =====
    
    async updateLeaveRequest(id: number, data: Partial<SolicitudAusencia>): Promise<SolicitudAusencia> {
        try {
            const response = await api.patch(`/solicitudes-ausencia/${id}/`, data);
            return response.data;
        } catch (error) {
            console.error(`Error updating leave request ${id}:`, error);
            throw error;
        }
    },

    async deleteLeaveRequest(id: number): Promise<void> {
        try {
            await api.delete(`/solicitudes-ausencia/${id}/`);
        } catch (error) {
            console.error(`Error deleting leave request ${id}:`, error);
            throw error;
        }
    },

    async approveLeave(id: number): Promise<SolicitudAusencia> {
        try {
            const response = await api.post(`/solicitudes-ausencia/${id}/aprobar/`);
            return response.data;
        } catch (error) {
            console.error(`Error approving leave ${id}:`, error);
            throw error;
        }
    },

    async rejectLeave(id: number, reason?: string): Promise<SolicitudAusencia> {
        try {
            const response = await api.post(`/solicitudes-ausencia/${id}/rechazar/`, {
                motivo: reason,
            });
            return response.data;
        } catch (error) {
            console.error(`Error rejecting leave ${id}:`, error);
            throw error;
        }
    },

    async updateContract(id: number, data: Partial<Contrato>): Promise<Contrato> {
        try {
            const response = await api.patch(`/contratos/${id}/`, data);
            return response.data;
        } catch (error) {
            console.error(`Error updating contract ${id}:`, error);
            throw error;
        }
    },

    async deleteContract(id: number): Promise<void> {
        try {
            await api.delete(`/contratos/${id}/`);
        } catch (error) {
            console.error(`Error deleting contract ${id}:`, error);
            throw error;
        }
    },

    async createContract(data: Omit<Contrato, 'id'>): Promise<Contrato> {
        try {
            const response = await api.post('/contratos/', data);
            return response.data;
        } catch (error) {
            console.error('Error creating contract:', error);
            throw error;
        }
    },

    async toggleOnboardingTask(id: number): Promise<OnboardingTask> {
        // El backend expone la acción 'complete'
        try {
            const response = await api.post(`/onboarding/${id}/complete/`);
            return response.data;
        } catch (error) {
            console.error(`Error toggling onboarding task ${id}:`, error);
            throw error;
        }
    },

    async createOnboardingTask(data: Omit<OnboardingTask, 'id'>): Promise<OnboardingTask> {
        try {
            const response = await api.post('/onboarding/', data);
            return response.data;
        } catch (error) {
            console.error('Error creating onboarding task:', error);
            throw error;
        }
    },

    async updateOnboardingTask(id: number, data: Partial<OnboardingTask>): Promise<OnboardingTask> {
        try {
            const response = await api.patch(`/onboarding/${id}/`, data);
            return response.data;
        } catch (error) {
            console.error(`Error updating onboarding task ${id}:`, error);
            throw error;
        }
    },

    async deleteOnboardingTask(id: number): Promise<void> {
        try {
            await api.delete(`/onboarding/${id}/`);
        } catch (error) {
            console.error(`Error deleting onboarding task ${id}:`, error);
            throw error;
        }
    },

    async getExpiringContracts(): Promise<Contrato[]> {
        // Endpoint no implementado en backend; devolvemos lista ordenada por end_date
        try {
            const response = await api.get('/contratos/', { params: { ordering: 'end_date' } });
            const data = Array.isArray(response.data?.results)
                ? response.data.results
                : Array.isArray(response.data)
                ? response.data
                : [];
            return data as Contrato[];
        } catch (error) {
            console.error('Error fetching expiring contracts:', error);
            throw error;
        }
    },

    async getPendingLeaves(): Promise<SolicitudAusencia[]> {
        try {
            const response = await api.get('/solicitudes-ausencia/', { params: { estado: 'pendiente' } });
            const data = Array.isArray(response.data?.results)
                ? response.data.results
                : Array.isArray(response.data)
                ? response.data
                : [];
            return data as SolicitudAusencia[];
        } catch (error) {
            console.error('Error fetching pending leaves:', error);
            throw error;
        }
    },

    async getPayrollPreview(params: { month?: number; year?: number }): Promise<PayrollPreviewResponse> {
        const response = await rootApi.get('/hr/payroll-preview/', { params });
        return response.data as PayrollPreviewResponse;
    },

    async saveContract(payload: ContractPayload): Promise<ContractItem> {
        if ((payload as any).id) {
            const { id, ...rest } = payload as any;
            const response = await rootApi.patch(`/contracts/${id}/`, rest);
            return response.data as ContractItem;
        }
        const response = await rootApi.post('/contracts/', payload);
        return response.data as ContractItem;
    },

    async listWorkShifts(): Promise<WorkShift[]> {
        const response = await rootApi.get('/shifts/');
        const data = Array.isArray(response.data?.results)
            ? response.data.results
            : Array.isArray(response.data)
            ? response.data
            : [];
        return data as WorkShift[];
    },

    async createWorkShift(payload: Omit<WorkShift, 'id'>): Promise<WorkShift> {
        const response = await rootApi.post('/shifts/', payload);
        return response.data as WorkShift;
    },

    async assignShift(employeeId: number, shiftId: number | null): Promise<EmployeeRow> {
        const response = await api.patch(`/empleados/${employeeId}/`, { current_shift: shiftId });
        return response.data as EmployeeRow;
    }
};

export default hrService;

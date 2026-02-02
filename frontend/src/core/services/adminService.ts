/**
 * Servicio centralizado para el módulo de administración.
 * Todas las interfaces se exportan explícitamente para evitar problemas de importación.
 */

import api from '../api/axiosConfig';

// ============================================================================
// TIPOS GENÉRICOS
// ============================================================================

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ============================================================================
// EMPRESA (COMPANY)
// ============================================================================

export interface CompanyData {
  id: number;
  razon_social: string;
  nombre_comercial?: string;
  ruc: string;
  direccion_fiscal?: string;
  telefono_contacto?: string;
  email_contacto?: string;
  sitio_web?: string;
  representante_legal?: string;
  pais: string;
  moneda: string;
  logo?: string;
  logo_url?: string;
  estado: string;
  creada_el: string;
  created_at: string;
  updated_at: string;
}

export type Company = CompanyData;

export interface CompanyUpdateData {
  razon_social?: string;
  nombre_comercial?: string;
  ruc?: string;
  direccion_fiscal?: string;
  telefono_contacto?: string;
  email_contacto?: string;
  sitio_web?: string;
  representante_legal?: string;
  pais?: string;
  moneda?: string;
  logo?: File;
  estado?: string;
}

export const companyService = {
  getCompany: async (): Promise<CompanyData> => {
    const response = await api.get('/api/empresa/');
    return response.data;
  },

  updateCompany: async (data: CompanyUpdateData): Promise<CompanyData> => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    const response = await api.put('/api/empresa/1/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

// ============================================================================
// USUARIOS (USERS)
// ============================================================================

export type UserRole = 'SUPERADMIN' | 'ADMIN_RRHH' | 'MANAGER' | 'EMPLOYEE';

export interface UserData {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  role_display: string;
  is_active: boolean;
  must_change_password: boolean;
  date_joined: string;
  last_login: string | null;
  empleado_nombre: string | null;
  empleado_id: number | null;
}

export type User = UserData;

export interface UserRoleUpdate {
  role?: UserRole;
  is_active?: boolean;
}

export type UserUpdateData = UserRoleUpdate;

export interface PasswordResetData {
  new_password: string;
}

export const userService = {
  getUsers: async (params?: {
    role?: string;
    is_active?: boolean;
    search?: string;
  }): Promise<UserData[]> => {
    const response = await api.get('/api/usuarios/', { params });
    return response.data;
  },

  getUser: async (id: number): Promise<UserData> => {
    const response = await api.get(`/api/usuarios/${id}/`);
    return response.data;
  },

  updateUser: async (id: number, data: UserRoleUpdate): Promise<UserData> => {
    const response = await api.patch(`/api/usuarios/${id}/`, data);
    return response.data;
  },

  toggleActive: async (id: number): Promise<{ detail: string; is_active: boolean }> => {
    const response = await api.post(`/api/usuarios/${id}/toggle_active/`);
    return response.data;
  },

  resetPassword: async (id: number, data: PasswordResetData): Promise<{ detail: string }> => {
    const response = await api.post(`/api/usuarios/${id}/reset_password/`, data);
    return response.data;
  },
};

// ============================================================================
// EMPLEADOS (EMPLOYEES)
// ============================================================================

export interface Employee {
  id: number;
  nombres: string;
  apellidos: string;
  documento: string;
  email: string;
  telefono: string;
  fecha_ingreso: string;
  fecha_nacimiento?: string;
  direccion?: string;
  estado: string;
  cargo?: { id: number; nombre: string };
  sucursal?: { id: number; nombre: string };
  empresa?: { id: number; nombre: string };
  user?: { id: number; username: string };
  created_at?: string;
  updated_at?: string;
}

export interface EmployeeCreateData {
  nombres: string;
  apellidos: string;
  documento: string;
  email: string;
  telefono: string;
  fecha_ingreso: string;
  fecha_nacimiento?: string;
  direccion?: string;
  cargo?: number;
  sucursal?: number;
  estado?: string;
}

export interface EmployeeUpdateData extends EmployeeCreateData {}

export const employeeService = {
  getEmployees: async (params?: { 
    search?: string; 
    estado?: string 
  }): Promise<PaginatedResponse<Employee>> => {
    const response = await api.get('/api/employees/api/empleados/', { params });
    return response.data;
  },

  getEmployee: async (id: number): Promise<Employee> => {
    const response = await api.get(`/api/employees/api/empleados/${id}/`);
    return response.data;
  },

  createEmployee: async (data: EmployeeCreateData): Promise<Employee> => {
    const response = await api.post('/api/employees/api/empleados/', data);
    return response.data;
  },

  updateEmployee: async (id: number, data: EmployeeUpdateData): Promise<Employee> => {
    const response = await api.patch(`/api/employees/api/empleados/${id}/`, data);
    return response.data;
  },

  deleteEmployee: async (id: number): Promise<{ detail: string }> => {
    const response = await api.delete(`/api/employees/api/empleados/${id}/`);
    return response.data;
  },
};

// ============================================================================
// SUCURSALES (BRANCHES)
// ============================================================================

export interface BranchData {
  id: number;
  nombre: string;
  direccion?: string;
  direccion_exacta?: string;
  ciudad?: string;
  telefono?: string;
  telefono_fijo?: string;
  capacidad_maxima?: number;
  tipo: string;
  empresa: number;
  gerente_encargado?: number | null;
  created_at?: string;
  updated_at?: string;
}

export type Branch = BranchData;

export interface BranchCreateData {
  nombre: string;
  direccion?: string;
  direccion_exacta?: string;
  ciudad?: string;
  telefono?: string;
  telefono_fijo?: string;
  capacidad_maxima?: number | string;
  tipo?: string;
  empresa?: number;
  gerente_encargado?: number | string | null;
}

export interface BranchUpdateData extends BranchCreateData {}

export const branchService = {
  getBranches: async (params?: { empresa?: number }): Promise<PaginatedResponse<BranchData>> => {
    const response = await api.get('/api/employees/api/sucursales/', { params });
    return response.data;
  },

  getBranch: async (id: number): Promise<BranchData> => {
    const response = await api.get(`/api/employees/api/sucursales/${id}/`);
    return response.data;
  },

  createBranch: async (data: BranchCreateData): Promise<BranchData> => {
    const response = await api.post('/api/employees/api/sucursales/', data);
    return response.data;
  },

  updateBranch: async (id: number, data: BranchUpdateData): Promise<BranchData> => {
    const response = await api.patch(`/api/employees/api/sucursales/${id}/`, data);
    return response.data;
  },

  deleteBranch: async (id: number): Promise<{ detail: string }> => {
    const response = await api.delete(`/api/employees/api/sucursales/${id}/`);
    return response.data;
  },
};

// ============================================================================
// CARGOS/PUESTOS (POSITIONS)
// ============================================================================

export interface PositionData {
  id: number;
  nombre: string;
  descripcion?: string;
  salario_base: number;
  nivel: string;
  salario_minimo?: number;
  salario_maximo?: number;
  departamento?: string;
  responsabilidades?: string;
  beneficios?: Record<string, unknown> | null;
  empresa?: number;
  created_at?: string;
  updated_at?: string;
}

export type Position = PositionData;

export interface PositionCreateData {
  nombre: string;
  descripcion?: string;
  salario_base?: number;
  nivel?: string;
}

export interface PositionUpdateData extends PositionCreateData {}

export const positionService = {
  getPositions: async (params?: { empresa?: number }): Promise<PaginatedResponse<PositionData>> => {
    const response = await api.get('/api/employees/api/cargos/', { params });
    return response.data;
  },

  getPosition: async (id: number): Promise<PositionData> => {
    const response = await api.get(`/api/employees/api/cargos/${id}/`);
    return response.data;
  },

  createPosition: async (data: PositionCreateData): Promise<PositionData> => {
    const response = await api.post('/api/employees/api/cargos/', data);
    return response.data;
  },

  updatePosition: async (id: number, data: PositionUpdateData): Promise<PositionData> => {
    const response = await api.patch(`/api/employees/api/cargos/${id}/`, data);
    return response.data;
  },

  deletePosition: async (id: number): Promise<{ detail: string }> => {
    const response = await api.delete(`/api/employees/api/cargos/${id}/`);
    return response.data;
  },
};

// ============================================================================
// EXPORTACIÓN CENTRALIZADA
// ============================================================================

export const adminService = {
  company: companyService,
  user: userService,
  employee: employeeService,
  branch: branchService,
  position: positionService,
};

export default adminService;

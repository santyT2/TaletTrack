import axios from 'axios';

const authApi = axios.create({
  baseURL: 'http://localhost:8000/api/auth',
  headers: { 'Content-Type': 'application/json' },
});

export interface LoginResponse {
  access: string;
  refresh?: string;
  user: {
    id: number;
    name: string;
    role: string;
    must_change_password: boolean;
    username: string;
  };
}

const authService = {
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await authApi.post<LoginResponse>('/login/', { username, password });
    return response.data;
  },

  async changePasswordInitial(newPassword: string, token: string): Promise<void> {
    await authApi.post(
      '/change-password-initial/',
      { new_password: newPassword },
      { headers: { Authorization: `Bearer ${token}` } },
    );
  },
};

export default authService;

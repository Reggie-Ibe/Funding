// client/src/services/ApiService.ts
import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },
  
  updateProfile: async (profileData: any) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },
  
  changePassword: async (passwordData: any) => {
    const response = await api.post('/auth/change-password', passwordData);
    return response.data;
  }
};

// Projects Services
export const projectService = {
  getAllProjects: async (filters = {}) => {
    const response = await api.get('/projects', { params: filters });
    return response.data;
  },
  
  getProjectById: async (id: string) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },
  
  createProject: async (projectData: any) => {
    const response = await api.post('/projects', projectData);
    return response.data;
  },
  
  updateProject: async (id: string, projectData: any) => {
    const response = await api.put(`/projects/${id}`, projectData);
    return response.data;
  },
  
  getProjectMilestones: async (projectId: string) => {
    const response = await api.get(`/projects/${projectId}/milestones`);
    return response.data;
  },
  
  submitMilestone: async (projectId: string, milestoneId: string, data: any) => {
    const response = await api.post(`/projects/${projectId}/milestones/${milestoneId}/submit`, data);
    return response.data;
  }
};

// Investment Services
export const investmentService = {
  investInProject: async (projectId: string, investmentData: any) => {
    const response = await api.post(`/investments/${projectId}`, investmentData);
    return response.data;
  },
  
  getUserInvestments: async () => {
    const response = await api.get('/investments/user');
    return response.data;
  },
  
  getProjectInvestments: async (projectId: string) => {
    const response = await api.get(`/investments/project/${projectId}`);
    return response.data;
  }
};

// Wallet Services
export const walletService = {
  getWalletBalance: async () => {
    const response = await api.get('/wallets/balance');
    return response.data;
  },
  
  depositFunds: async (amount: number, paymentInfo: any) => {
    const response = await api.post('/wallets/deposit', { amount, paymentInfo });
    return response.data;
  },
  
  withdrawFunds: async (amount: number, withdrawalInfo: any) => {
    const response = await api.post('/wallets/withdraw', { amount, withdrawalInfo });
    return response.data;
  },
  
  getTransactions: async (filters = {}) => {
    const response = await api.get('/wallets/transactions', { params: filters });
    return response.data;
  }
};

// Notification Services
export const notificationService = {
  getNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },
  
  markAsRead: async (notificationId: string) => {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  },
  
  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  }
};

// Admin Services
export const adminService = {
  getPendingUsers: async () => {
    const response = await api.get('/admin/users/pending');
    return response.data;
  },
  
  approveUser: async (userId: string) => {
    const response = await api.put(`/admin/users/${userId}/approve`);
    return response.data;
  },
  
  rejectUser: async (userId: string, reason: string) => {
    const response = await api.put(`/admin/users/${userId}/reject`, { reason });
    return response.data;
  },
  
  getPendingProjects: async () => {
    const response = await api.get('/admin/projects/pending');
    return response.data;
  },
  
  approveProject: async (projectId: string) => {
    const response = await api.put(`/admin/projects/${projectId}/approve`);
    return response.data;
  },
  
  rejectProject: async (projectId: string, reason: string) => {
    const response = await api.put(`/admin/projects/${projectId}/reject`, { reason });
    return response.data;
  },
  
  getPendingMilestones: async () => {
    const response = await api.get('/admin/milestones/pending');
    return response.data;
  },
  
  approveMilestone: async (milestoneId: string) => {
    const response = await api.put(`/admin/milestones/${milestoneId}/approve`);
    return response.data;
  },
  
  rejectMilestone: async (milestoneId: string, reason: string) => {
    const response = await api.put(`/admin/milestones/${milestoneId}/reject`, { reason });
    return response.data;
  }
};

export default {
  auth: authService,
  projects: projectService,
  investments: investmentService,
  wallet: walletService,
  notifications: notificationService,
  admin: adminService
};
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Get authentication token from localStorage
const getToken = () => localStorage.getItem('authToken');

// Axios instance with default config
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add auth token to requests automatically
apiClient.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Grievance API
export const grievanceAPI = {
    // Create new grievance
    create: async (data) => {
        const response = await apiClient.post('/grievances/create', data);
        return response.data;
    },

    // Get my grievances
    getMyGrievances: async () => {
        const response = await apiClient.get('/grievances/my-grievances');
        return response.data;
    },

    // Get grievance by ID
    getById: async (id) => {
        const response = await apiClient.get(`/grievances/${id}`);
        return response.data;
    },

    // Track by case ID (public - no auth required)
    trackByCaseId: async (caseId) => {
        const response = await axios.get(`${API_BASE_URL}/grievances/track/${caseId}`);
        return response.data;
    },

    // Get all grievances (officers only)
    getAll: async (filters = {}) => {
        const params = new URLSearchParams(filters);
        const response = await apiClient.get(`/grievances?${params}`);
        return response.data;
    },

    // Update grievance status (officers only)
    updateStatus: async (id, data) => {
        const response = await apiClient.patch(`/grievances/${id}/status`, data);
        return response.data;
    },

    // Add query to grievance (officers only)
    addQuery: async (grievanceId, queryData) => {
        const response = await apiClient.post(`/grievances/${grievanceId}/queries`, queryData);
        return response.data;
    },

    // Respond to query (victims only)
    respondToQuery: async (grievanceId, queryIndex, responseData) => {
        const response = await apiClient.patch(`/grievances/${grievanceId}/queries/${queryIndex}/respond`, responseData);
        return response.data;
    },

    // Resolve query (officers only)
    resolveQuery: async (grievanceId, queryIndex) => {
        const response = await apiClient.patch(`/grievances/${grievanceId}/queries/${queryIndex}/resolve`, {});
        return response.data;
    },

    // Save disbursements (officers only)
    saveDisbursements: async (grievanceId, disbursementData) => {
        const response = await apiClient.post(`/grievances/${grievanceId}/disbursements`, disbursementData);
        return response.data;
    },

    // Verify transaction (victims only)
    verifyTransaction: async (grievanceId, disbursementIndex, transactionId) => {
        const response = await apiClient.patch(`/grievances/${grievanceId}/disbursements/${disbursementIndex}/verify`, { transactionId });
        return response.data;
    }
};

// Document API
export const documentAPI = {
    // Upload document
    upload: async (file, grievanceId, documentType) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('grievanceId', grievanceId);
        formData.append('documentType', documentType);

        const response = await axios.post(`${API_BASE_URL}/documents/upload`, formData, {
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    // Verify document type (pre-submission check - before form is submitted)
    verifyType: async (file, expectedDocumentType) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('expectedDocumentType', expectedDocumentType);

        const response = await axios.post(`${API_BASE_URL}/documents/verify`, formData, {
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    // Get documents by grievance ID
    getByGrievance: async (grievanceId) => {
        const response = await apiClient.get(`/documents/grievance/${grievanceId}`);
        return response.data;
    },

    // Get document view URL
    getViewUrl: async (documentId) => {
        const response = await apiClient.get(`/documents/${documentId}/view`);
        return response.data;
    },

    // Download document
    download: async (documentId, fileName) => {
        const response = await axios.get(`${API_BASE_URL}/documents/${documentId}/download`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            },
            responseType: 'blob'
        });

        // For actual download, create download link
        if (fileName) {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        }

        // Return blob for View functionality
        return response.data;
    },

    // Get document stats
    getStats: async (grievanceId) => {
        const response = await apiClient.get(`/documents/grievance/${grievanceId}/stats`);
        return response.data;
    }
};

// Auth API  
export const authAPI = {
    login: async (email, password) => {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, {
            email,
            password
        });
        return response.data;
    },

    register: async (userData) => {
        const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
        return response.data;
    },

    getProfile: async () => {
        const response = await apiClient.get('/auth/profile');
        return response.data;
    }
};

// Ticket API (for grievance complaints/support tickets)
export const ticketAPI = {
    // Create new ticket (requires auth)
    create: async (data) => {
        const response = await apiClient.post('/tickets/create', data);
        return response.data;
    },

    // Get my tickets (victim's own tickets)
    getMyTickets: async () => {
        const response = await apiClient.get('/tickets/my-tickets');
        return response.data;
    },

    // Get all tickets (officers only)
    getAll: async (filters = {}) => {
        const params = new URLSearchParams(filters);
        const response = await apiClient.get(`/tickets?${params}`);
        return response.data;
    },

    // Get ticket by ID
    getById: async (id) => {
        const response = await apiClient.get(`/tickets/${id}`);
        return response.data;
    },

    // Track by ticket ID (public - no auth required)
    trackByTicketId: async (ticketId) => {
        const response = await axios.get(`${API_BASE_URL}/tickets/track/${ticketId}`);
        return response.data;
    },

    // Respond to ticket (officers only)
    respond: async (ticketId, message) => {
        const response = await apiClient.post(`/tickets/${ticketId}/respond`, { message });
        return response.data;
    },

    // Update ticket status (officers only)
    updateStatus: async (ticketId, status) => {
        const response = await apiClient.patch(`/tickets/${ticketId}/status`, { status });
        return response.data;
    }
};

// Intercaste Marriage API
export const intercasteAPI = {
    // Create new intercaste marriage application
    create: async (data) => {
        const response = await apiClient.post('/intercaste/create', data);
        return response.data;
    }
};

export default {
    grievanceAPI,
    documentAPI,
    authAPI,
    ticketAPI,
    intercasteAPI
};

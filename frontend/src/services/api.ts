import axios from 'axios';

// Define types
export interface UserInfo {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'support' | 'user';
  token?: string;
  createdAt: string;
}

interface Event {
  _id: string;
  name: string;
  coverImage: string;
  description: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  location: string;
  stateRegion?: string;
  locationType: 'onsite' | 'remote';
  address?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  meetingLink?: string;
  category: string;
  isFree: boolean;
  price?: number;
  organizer: string;
  maxAttendees: number;
  currentAttendees: number;
  status: 'pending' | 'completed' | 'deleted';
  additionalQuestions: Array<{
    questionText: string;
    required: boolean;
  }>;
  reviews?: Array<any>;
  rating: number;
  numReviews: number;
  user: {
    _id: string;
    name: string;
  };
}

interface EventResponse {
  events: Event[];
  page: number;
  pages: number;
  count: number;
}

interface MyEventsResponse {
  createdEvents: Event[];
  enrolledEvents: Event[];
}

// Create an axios instance with base URL and default headers
// Default to local backend server
const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding the auth token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = token; // token already includes 'Bearer '
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  response => response,
  error => {
    // Handle unauthorized errors (401)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('userInfo');
      localStorage.removeItem('userToken');
      // Redirect to login page if needed
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: async (email: string, password: string): Promise<UserInfo> => {
    const response = await api.post('/users/login', { email, password });
    if (response.data) {
      localStorage.setItem('userInfo', JSON.stringify(response.data));
      localStorage.setItem('userToken', `Bearer ${response.data.token}`);
    }
    return response.data;
  },
  register: async (name: string, email: string, password: string): Promise<UserInfo> => {
    const response = await api.post('/users/register', { name, email, password });
    if (response.data) {
      localStorage.setItem('userInfo', JSON.stringify(response.data));
      localStorage.setItem('userToken', `Bearer ${response.data.token}`);
    }
    return response.data;
  },
  logout: (): void => {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('userToken');
  },
  getUserProfile: async (): Promise<UserInfo> => {
    const response = await api.get('/users/profile');
    return response.data;
  },
  updateUserProfile: async (userData: Partial<UserInfo>): Promise<UserInfo> => {
    const response = await api.put('/users/profile', userData);
    return response.data;
  },
  // New admin user management functions
  getUsers: async (
    params: {
      pageNumber?: number;
      keyword?: string;
    } = {}
  ): Promise<{
    users: UserInfo[];
    page: number;
    pages: number;
    count: number;
  }> => {
    const response = await api.get('/users', { params });
    return response.data;
  },
  deleteUser: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
  updateUser: async (id: string, userData: Partial<UserInfo>): Promise<UserInfo> => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },
  createUser: async (userData: {
    name: string;
    email: string;
    password: string;
    isAdmin: boolean;
  }): Promise<UserInfo> => {
    const response = await api.post('/users', userData);
    return response.data;
  },
};

// Event services
export const eventService = {
  getAllEvents: async (
    params: {
      pageNumber?: number;
      keyword?: string;
      category?: string;
      location?: string;
      type?: string;
      status?: string;
      date?: string;
    } = {}
  ): Promise<EventResponse> => {
    const response = await api.get('/events', { params });
    return response.data;
  },
  getEventById: async (id: string): Promise<Event> => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },
  createEvent: async (eventData: Partial<Event>): Promise<Event> => {
    const response = await api.post('/events', eventData);
    return response.data;
  },
  updateEvent: async (id: string, eventData: Partial<Event>): Promise<Event> => {
    const response = await api.put(`/events/${id}`, eventData);
    return response.data;
  },
  deleteEvent: async (id: string): Promise<any> => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },
  createReview: async (id: string, reviewData: any): Promise<Event> => {
    const response = await api.post(`/events/${id}/reviews`, reviewData);
    return response.data;
  },
  enrollToEvent: async (id: string, additionalResponses: any[] = []): Promise<any> => {
    const response = await api.post(`/events/${id}/enroll`, { additionalResponses });
    return response.data;
  },
  getUserEvents: async (): Promise<MyEventsResponse> => {
    const response = await api.get('/events/myevents');
    return response.data;
  },
};

export default api;

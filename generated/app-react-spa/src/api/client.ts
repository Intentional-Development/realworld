import axios from 'axios';

const BASE_URL = 'https://api.realworld.io/api';

function getAuthHeaders() {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function setAuthToken(token: string) {
  localStorage.setItem('auth_token', token);
}

export function clearAuthToken() {
  localStorage.removeItem('auth_token');
}

export const api = {
  async login(data: any) {
    const response = await axios.post(`${BASE_URL}/users/login`, data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  async register(data: any) {
    const response = await axios.post(`${BASE_URL}/users`, data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  async getCurrentUser() {
    const response = await axios.get(`${BASE_URL}/user`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  async updateCurrentUser(data: any) {
    const response = await axios.put(`${BASE_URL}/user`, data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  async getProfile() {
    const response = await axios.get(`${BASE_URL}/profiles/{username}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  async followUser(data: any) {
    const response = await axios.post(`${BASE_URL}/profiles/{username}/follow`, data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  async unfollowUser() {
    const response = await axios.delete(`${BASE_URL}/profiles/{username}/follow`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  async createArticle(data: any) {
    const response = await axios.post(`${BASE_URL}/articles`, data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  async getArticle() {
    const response = await axios.get(`${BASE_URL}/articles/{slug}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  async updateArticle(data: any) {
    const response = await axios.put(`${BASE_URL}/articles/{slug}`, data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  async deleteArticle() {
    const response = await axios.delete(`${BASE_URL}/articles/{slug}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  async listArticles() {
    const response = await axios.get(`${BASE_URL}/articles`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  async getArticlesFeed() {
    const response = await axios.get(`${BASE_URL}/articles/feed`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  async addComment(data: any) {
    const response = await axios.post(`${BASE_URL}/articles/{slug}/comments`, data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  async getArticleComments() {
    const response = await axios.get(`${BASE_URL}/articles/{slug}/comments`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  async deleteComment() {
    const response = await axios.delete(`${BASE_URL}/articles/{slug}/comments/{id}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  async favoriteArticle(data: any) {
    const response = await axios.post(`${BASE_URL}/articles/{slug}/favorite`, data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  async unfavoriteArticle() {
    const response = await axios.delete(`${BASE_URL}/articles/{slug}/favorite`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  async getTags() {
    const response = await axios.get(`${BASE_URL}/tags`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },
};

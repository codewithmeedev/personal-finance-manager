import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import { User } from '../types/user';
// import { TokenPair } from '../types/auth';

interface JwtPayload {
  sub: string;
}

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function getCurrentUser(): Promise<User> {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    throw new Error('No access token found.');
  }
  const decoded = jwtDecode<JwtPayload>(accessToken);
  const userId = decoded.sub;
  const response = await axios.get<User>(`${BASE_URL}/users/${userId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
}

async function updateUser(userId: string, data: { username?: string; email?: string; password?: string }): Promise<User> {
  const accessToken = localStorage.getItem('accessToken') || '';
  const response = await axios.patch<User>(`${BASE_URL}/users/${userId}`, data, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
}

async function deleteUser(userId: string): Promise<{ message: string }> {
  const accessToken = localStorage.getItem('accessToken') || '';
  const response = await axios.delete<{ message: string }>(`${BASE_URL}/users/${userId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
}


export default {
  getCurrentUser,
  updateUser,
  deleteUser,
};

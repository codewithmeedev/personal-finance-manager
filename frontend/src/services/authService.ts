import axios from 'axios';
import { TokenPair } from '../types/auth';
import { ResetPasswordResponse } from '../types/auth';

const BASE_URL = 'http://localhost:8000';

async function signup(username: string, email: string, password: string): Promise<void> {
  const response = await axios.post<TokenPair>(`${BASE_URL}/users/signup`, { username, email, password });
  storeTokens(response.data);
}

async function signin(email: string, password: string): Promise<void> {
  const response = await axios.post<TokenPair>(`${BASE_URL}/users/signin`, { email, password });
  storeTokens(response.data);
}

function storeTokens(data: TokenPair) {
  localStorage.setItem('accessToken', data.access_token);
  localStorage.setItem('refreshToken', data.refresh_token);
}


async function forgotPassword(email: string) {
  try {
    const response = await axios.post(`${BASE_URL}/users/forgot-password`, { email });
    return response.data;
  } catch (error) {
    console.error("Failed to send reset link:", error);
    throw error;
  }
}
async function resetPassword(token: string, newPassword: string): Promise<ResetPasswordResponse> {
  const response = await axios.post<ResetPasswordResponse>(`${BASE_URL}/users/reset-password`, { token, new_password: newPassword });
  return response.data;
}
export default {
  signup,
  signin,
  forgotPassword,
  resetPassword,
};



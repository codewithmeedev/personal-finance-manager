export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
}
export interface ResetPasswordResponse {
  msg: string;
  access_token: string;
  refresh_token: string;
  token_type: string;
}
export interface Account {
  cuit: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  key: string;
}

export interface AccountLogin {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  refreshExpiresIn: number;
}

export interface Merchant {
  email: string;
  cuit: string;
}

export interface Subscription {
  email: string;
  key: string;
}

export interface ExternalServiceConfig {
  host: string;
  timeout?: number;
}

export interface AppConfig {
  port: number;
  merchantsService: {
    host: string;
    timeout: number;
  };
  clientsService: {
    host: string;
    timeout: number;
  };
  securityService: {
    host: string;
    timeout: number;
  };
}

export const appConfig = (): AppConfig => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  merchantsService: {
    host: process.env.MERCHANTS_SERVICE_HOST || 'http://localhost:1080/api/merchants',
    timeout: parseInt(process.env.MERCHANTS_SERVICE_TIMEOUT, 10) || 10000,
  },
  clientsService: {
    host: process.env.CLIENTS_SERVICE_HOST || 'http://localhost:8082/v1',
    timeout: parseInt(process.env.CLIENTS_SERVICE_TIMEOUT, 10) || 10000,
  },
  securityService: {
    host: process.env.SECURITY_SERVICE_HOST || 'http://localhost:8087/v1',
    timeout: parseInt(process.env.SECURITY_SERVICE_TIMEOUT, 10) || 10000,
  },
});

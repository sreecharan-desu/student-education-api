export interface AppConfig {
  port: number;
  host: string;
  nodeEnv: string;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  throttleTtl: number;
  throttleLimit: number;
}

export default (): AppConfig => ({
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'default-insecure-dev-secret-change-in-env',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  throttleTtl: parseInt(process.env.THROTTLE_TTL || '60000', 10),
  throttleLimit: parseInt(process.env.THROTTLE_LIMIT || '30', 10),
});

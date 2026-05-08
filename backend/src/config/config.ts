// Development environment configuration for socket.io, database, etc.

export const databaseConfig = {
  type: 'postgres',
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'commandcenter',
  password: process.env.DB_PASSWORD || 'CommandCenter2026',
  database: process.env.DB_NAME || 'commandcenter',
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
};

export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'secret-key',
  expiresIn: process.env.JWT_EXPIRATION || '7d',
};

export const corsConfig = {
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

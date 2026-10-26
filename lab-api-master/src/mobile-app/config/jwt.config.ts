import { JwtModuleOptions } from '@nestjs/jwt';

export const mobileAppJwtConfig: JwtModuleOptions = {
  secret: 'mobile-app-secret-key', // Consider using environment variable
  signOptions: {
    expiresIn: '30d', // 30 days token expiration
  },
};
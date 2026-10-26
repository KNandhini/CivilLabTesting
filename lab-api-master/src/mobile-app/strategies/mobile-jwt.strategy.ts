import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { mobileAppJwtConfig } from '../config/jwt.config';

@Injectable()
export class MobileJwtStrategy extends PassportStrategy(Strategy, 'mobile-jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: mobileAppJwtConfig.secret,
    });
  }

  async validate(payload: any) {
    if (!payload.isMobileApp) {
      throw new UnauthorizedException('Invalid token type');
    }
    return { userId: payload.userId, mobileNumber: payload.mobileNumber };
  }
}
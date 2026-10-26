import { Injectable, CanActivate, ExecutionContext, Inject, forwardRef } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MobileJwtAuthGuard } from './mobile-jwt-auth.guard';
import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';

@Injectable()
export class EitherJwtAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private mobileJwtAuthGuard: MobileJwtAuthGuard,
    private jwtAuthGuard: JwtAuthGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      // Try MobileJwtAuthGuard
      const mobileResult = await this.mobileJwtAuthGuard.canActivate(context);
      if (mobileResult) return true;
    } catch (e) {}

    try {
      // Try JwtAuthGuard
      const jwtResult = await this.jwtAuthGuard.canActivate(context);
      if (jwtResult) return true;
    } catch (e) {}

    return false;
  }
}
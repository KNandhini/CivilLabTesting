import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppQuotationLineItem } from './entities/app-quotation-line-item.entity';
import { MobileJwtAuthGuard } from '../guards/mobile-jwt-auth.guard';
import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';
import { EitherJwtAuthGuard } from '../guards/either-jwt-auth.guard';

@Module({
  imports: [TypeOrmModule.forFeature([AppQuotationLineItem])],
  exports: [TypeOrmModule],
  providers: [MobileJwtAuthGuard,
    JwtAuthGuard,
    EitherJwtAuthGuard],
})
export class AppQuotationLineItemModule {}
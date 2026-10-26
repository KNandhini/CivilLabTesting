import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppQuotation } from './entities/app-quotation.entity';
import { AppQuotationLineItem } from '../app-quotation-line-item/entities/app-quotation-line-item.entity';
import { AppQuotationService } from './app-quotation.service';
import { AppQuotationController } from './app-quotation.controller';
import { AppRequestsModule } from '../app-requests/app-requests.module';
import { MobileJwtAuthGuard } from '../guards/mobile-jwt-auth.guard';
import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';
import { EitherJwtAuthGuard } from '../guards/either-jwt-auth.guard';
import { SystemSettingsModule } from '../../system-settings/system-settings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AppQuotation, AppQuotationLineItem]),
    forwardRef(() => AppRequestsModule),
    SystemSettingsModule,
  ],
  controllers: [AppQuotationController],
  providers: [AppQuotationService,
    MobileJwtAuthGuard,
    JwtAuthGuard,
    EitherJwtAuthGuard
  ],
  exports: [AppQuotationService],
})
export class AppQuotationModule {}
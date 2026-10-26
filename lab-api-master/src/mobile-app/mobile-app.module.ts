import { Module } from '@nestjs/common';
import { AppUsersModule } from './app-users/app-users.module';
import { AppTestsModule } from './app-tests/app-tests.module';
import { AppRequestsModule } from './app-requests/app-requests.module';
import { AppRequestTestsMapModule } from './app-request-tests-map/app-request-tests-map.module';
import { MobileJwtStrategy } from './strategies/mobile-jwt.strategy';
import { AppQuotationModule } from './app-quotation/app-quotation.module';
import { AppQuotationLineItemModule } from './app-quotation-line-item/app-quotation-line-item.module';

@Module({
  imports: [
    AppUsersModule,
    AppTestsModule,
    AppRequestsModule,
    AppRequestTestsMapModule,
    AppQuotationModule,
    AppQuotationLineItemModule,
  ],
  providers: [MobileJwtStrategy],
  exports: [
    AppUsersModule,
    AppTestsModule,
    AppRequestsModule,
    AppRequestTestsMapModule
  ]
})
export class MobileAppModule {}
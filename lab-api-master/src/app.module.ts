import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { TestsModule } from './tests/tests.module';
import { Product } from './products/entities/product.entity';
import { Test } from './tests/entities/test.entity';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { Material } from './test-module/entities/material.entity';
import { TestType } from './test-module/entities/test-type.entity';
import { TestResult } from './test-module/entities/test-result.entity';
import { TestSchemaModule } from './test-schema/test-schema.module';
import { TestSchema } from './test-schema/entities/test-schema.entity';
import { TestSchemaMapping } from './test-schema/entities/test-schema-mapping.entity';
import { RequestsModule } from './requests/requests.module';
import { Request } from './requests/entities/request.entity';
import { ContractReviewModule } from './contract-review/contract-review.module';
import { ContractReview } from './contract-review/entities/contract-review.entity';
import { SampleCollectionModule } from './sample-collection/sample-collection.module';
import { SampleCollection } from './sample-collection/entities/sample-collection.entity';
import { ProductTestSampleMapping } from './sample-collection/entities/product-test-sample-mapping.entity';
import { Receipt } from './receipts/entities/receipt.entity';
import { ReceiptsModule } from './receipts/receipts.module';
import { ObservationEntryModule } from './observation-entry/observation-entry.module';
import { ObservationEntry } from './observation-entry/entities/observation-entry.entity';
import { AppUser } from './mobile-app/app-users/entities/app-user.entity';
import { AppTest } from './mobile-app/app-tests/entities/app-test.entity';
import { AppRequest } from './mobile-app/app-requests/entities/app-request.entity';
import { AppRequestTestsMap } from './mobile-app/app-request-tests-map/entities/app-request-tests-map.entity';
import { MobileAppModule } from './mobile-app/mobile-app.module';
import { EmailModule } from './common/email.module';
import { AppQuotationModule } from './mobile-app/app-quotation/app-quotation.module';
import { AppQuotationLineItemModule } from './mobile-app/app-quotation-line-item/app-quotation-line-item.module';
import { AppQuotation } from './mobile-app/app-quotation/entities/app-quotation.entity';
import { AppQuotationLineItem } from './mobile-app/app-quotation-line-item/entities/app-quotation-line-item.entity';
import { StatesModule } from './mobile-app/states/states.module';
import { State } from './mobile-app/states/entities/state.entity';
import { ReportsModule } from './reports/reports.module';
import { SystemSettings } from './system-settings/entities/system-settings.entity';
import { SystemSettingsModule } from './system-settings/system-settings.module';
import { ReportSchemaModule } from './report-schema/report-schema.module';
import { ReportSchema } from './report-schema/entities/report-schema.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({
      global: true,
      secret: '123456', // Using the same secret as in customer strategy
      signOptions: { expiresIn: '24h' },
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [
        User, Test, Product, Material, TestType, TestResult, 
        TestSchema, TestSchemaMapping, Request, ContractReview, 
        SampleCollection, ProductTestSampleMapping, Receipt, 
        ObservationEntry,
        // Mobile App Entities
        AppUser,
        AppTest,
        AppRequest,
        AppRequestTestsMap,
        AppQuotation,
        AppQuotationLineItem,
        State,
        SystemSettings,
        ReportSchema
      ],
      synchronize: true,
    }),
    ProductsModule,
    TestsModule,
    UsersModule,
    TestSchemaModule,
    RequestsModule,
    ContractReviewModule,
    SampleCollectionModule,
    ReceiptsModule,
    ObservationEntryModule,
    MobileAppModule,
    EmailModule,
    AppQuotationModule,
    AppQuotationLineItemModule,
    StatesModule,
    ReportsModule,
    SystemSettingsModule,
    ReportSchemaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

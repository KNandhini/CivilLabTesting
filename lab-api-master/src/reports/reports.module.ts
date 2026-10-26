import { TypeOrmModule } from '@nestjs/typeorm';
import { Request } from '../requests/entities/request.entity';
import { ReportNumbersService } from './report-numbers.service';
import { ReportNumbersController } from './report-numbers.controller';
import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { RequestsModule } from '../requests/requests.module';
import { SampleCollectionModule } from '../sample-collection/sample-collection.module';
import { ObservationEntryModule } from '../observation-entry/observation-entry.module';
import { SystemSettingsModule } from '../system-settings/system-settings.module';
import { ReportSchemaModule } from '../report-schema/report-schema.module';
import { ProductsModule } from 'src/products/products.module';
import { ProductsService } from 'src/products/products.service';
import { RequestsService } from 'src/requests/requests.service';
import { AppRequestsModule } from 'src/mobile-app/app-requests/app-requests.module';

@Module({
  imports: [TypeOrmModule.forFeature([Request]), RequestsModule, SampleCollectionModule, ObservationEntryModule, SystemSettingsModule, ReportSchemaModule, ProductsModule, AppRequestsModule],
  controllers: [ReportsController, ReportNumbersController],
  providers: [ReportsService, ReportNumbersService],
  exports: [ReportsService],
})
export class ReportsModule {} 
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObservationEntryController } from './observation-entry.controller';
import { ObservationEntryService } from './observation-entry.service';
import { ObservationEntry } from './entities/observation-entry.entity';
import { ProductTestSampleMapping } from '../sample-collection/entities/product-test-sample-mapping.entity';
import { TestSchema } from 'src/test-schema/entities/test-schema.entity';
import { RequestsModule } from '../requests/requests.module';
import { AppRequestsModule } from 'src/mobile-app/app-requests/app-requests.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ObservationEntry, TestSchema]),
    RequestsModule,
    AppRequestsModule
  ],
  controllers: [ObservationEntryController],
  providers: [ObservationEntryService],
  exports: [ObservationEntryService],
})
export class ObservationEntryModule {}
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestsModule } from '../requests/requests.module';
import { SampleCollectionController } from './sample-collection.controller';
import { SampleCollectionService } from './sample-collection.service';
import { SampleCollection } from './entities/sample-collection.entity';
import { ProductTestSampleMapping } from './entities/product-test-sample-mapping.entity';
import { ContractReviewModule } from '../contract-review/contract-review.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SampleCollection, ProductTestSampleMapping]),
    ContractReviewModule,
    RequestsModule  // Add this import
  ],
  controllers: [SampleCollectionController],
  providers: [SampleCollectionService],
  exports: [SampleCollectionService],
})
export class SampleCollectionModule {}
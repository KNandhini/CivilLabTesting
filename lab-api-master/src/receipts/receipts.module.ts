import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReceiptsController } from './receipts.controller';
import { ReceiptsService } from './receipts.service';
import { Receipt } from './entities/receipt.entity';
import { ProductTestSampleMapping } from '../sample-collection/entities/product-test-sample-mapping.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Receipt, ProductTestSampleMapping])],
  controllers: [ReceiptsController],
  providers: [ReceiptsService],
  exports: [ReceiptsService],
})
export class ReceiptsModule {}
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractReview } from './entities/contract-review.entity';
import { ContractReviewService } from './contract-review.service';
import { ContractReviewController } from './contract-review.controller';
import { RequestsModule } from '../requests/requests.module';
import { SystemSettingsModule } from '../system-settings/system-settings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContractReview]),
    RequestsModule,
    SystemSettingsModule,
  ],
  providers: [ContractReviewService],
  controllers: [ContractReviewController],
  exports: [ContractReviewService],
})
export class ContractReviewModule {}
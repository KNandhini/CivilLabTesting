import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportSchemaService } from './report-schema.service';
import { ReportSchemaController } from './report-schema.controller';
import { ReportSchema } from './entities/report-schema.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReportSchema])],
  controllers: [ReportSchemaController],
  providers: [ReportSchemaService],
  exports: [ReportSchemaService],
})
export class ReportSchemaModule {} 
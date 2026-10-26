import { IsBoolean, IsOptional, IsObject } from 'class-validator';
import { ReportSchemaDto } from './types';

export class CreateReportSchemaDto {
 
  @IsObject()
  @IsOptional()
  ObservationEntrySchema?: any;

  @IsObject()
  @IsOptional()
  TestReportSchema?: ReportSchemaDto;
} 
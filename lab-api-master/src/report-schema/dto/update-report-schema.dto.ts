import { PartialType } from '@nestjs/mapped-types';
import { CreateReportSchemaDto } from './create-report-schema.dto';

export class UpdateReportSchemaDto extends PartialType(CreateReportSchemaDto) {} 
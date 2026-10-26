import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString, IsOptional, IsArray } from 'class-validator';

export class DateRangeDto {
  @ApiProperty({ description: 'Start date for the report' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'End date for the report' })
  @IsDateString()
  endDate: string;
}

export class DetailedReportRequestDto extends DateRangeDto {
  @ApiProperty({ description: 'Type of report to generate' })
  @IsString()
  type: string;
}

export class CustomReportConfigDto {
  @ApiProperty({ description: 'Report configuration parameters' })
  @IsArray()
  @IsOptional()
  filters?: any[];

  @ApiProperty({ description: 'Report grouping parameters' })
  @IsArray()
  @IsOptional()
  groupBy?: string[];

  @ApiProperty({ description: 'Report sorting parameters' })
  @IsArray()
  @IsOptional()
  sortBy?: string[];
} 
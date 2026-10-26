import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsBoolean, IsNumber, IsDateString } from 'class-validator';

export class UpdateAdditionalInfoDto {
  @ApiProperty()
  @IsString()
  requestId: string;

  @ApiProperty()
  @IsString()
  productTestSampleMappingId: string;

  @ApiProperty()
  @IsString()
  schemaId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  receivedBy?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  condition?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  resources?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  verification?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  pertinentDiscussion?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  efficiency?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  conditionsCheck?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  testStartDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  testCompletionDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  statusOnTest?: string;


  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  staffId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  codeNo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  temperature?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  humidity?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  materialStatus?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sampleStorageCondition?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  gradeOfSteel?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  includeBendRebendTest?: boolean;

}
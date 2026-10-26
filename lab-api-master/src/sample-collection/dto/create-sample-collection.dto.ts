import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateSampleCollectionDto {
  @ApiProperty()
  @IsString()
  requestId: string;

  @ApiProperty()
  @IsString()
  sampleId: string;

  @ApiProperty()
  @IsString()
  sampleType: string;

  
  @ApiProperty({ required: false })
  @IsOptional()
  quantity?: number;

  @ApiProperty()
  @IsString()
  sampleAvailability: string;
}
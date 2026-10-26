import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateProductTestMappingDto {
  @ApiProperty()
  @IsString()
  requestId: string;

  @ApiProperty()
  @IsString()
  productId: string;

  @ApiProperty()
  @IsString()
  testId: string;

  @ApiProperty()
  @IsString()
  sampleId: string;
}
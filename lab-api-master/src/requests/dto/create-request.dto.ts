import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateRequestDto {
  @ApiProperty()
  @IsString()
  prefix: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  appRequestId?: string;

}
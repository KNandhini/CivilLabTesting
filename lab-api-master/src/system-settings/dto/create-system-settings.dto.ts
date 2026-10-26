import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional } from 'class-validator';

export class CreateSystemSettingsDto {
  @ApiProperty({ description: 'JSON data for system settings' })
  @IsObject()
  @IsOptional()
  data?: Record<string, any>;
} 
import { IsNotEmpty, IsUUID, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PerformTestDto {
  @ApiProperty()
  @IsUUID()
  materialId: string;

  @ApiProperty()
  @IsUUID()
  testTypeId: string;

  @ApiProperty()
  @IsObject()
  inputValues: Record<string, any>;

  @ApiProperty()
  @IsNotEmpty()
  remarks?: string;
}
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, IsNumber, Min, IsOptional, IsBoolean } from 'class-validator';

export class CreateTestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiProperty()
  @IsUUID()
  productId: string;

  @ApiProperty()
  @IsString()
  testingMethod: string;


  @ApiProperty()
  @IsString()
  @IsOptional()
  unit: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  minimumQuantityRequired: number;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isSiteTest: boolean;
}
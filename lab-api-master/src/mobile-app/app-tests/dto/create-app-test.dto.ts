import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateAppTestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  testName: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  price: number;
}
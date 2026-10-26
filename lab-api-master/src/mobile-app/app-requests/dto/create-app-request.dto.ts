import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsBoolean, IsOptional, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateAppRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  designation: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  organization: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  gstNumber?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  mobileNumber: string;

  @ApiProperty({ required: false })
  @IsEmail()
  @IsOptional()

  email?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  projectName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  siteLocation: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  testPoints: string;

  @ApiProperty()
  @IsBoolean()
  immediate: boolean;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  specificDate?: Date;

  @ApiProperty()
  @IsBoolean()
  confirmed: boolean;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiProperty({ type: [String], description: 'Array of selected test IDs' })
  @IsString({ each: true })
  @IsNotEmpty()
  selectedTests: string[];

}
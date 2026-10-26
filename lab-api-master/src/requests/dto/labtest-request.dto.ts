import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';


export class LabTestQueryDto {
  
    @ApiProperty({ default: 1 })
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page: number = 1;
  
    @ApiProperty({ default: 10 })
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    limit: number = 10;

    @ApiProperty()
    @IsOptional()
    @IsString()
    formId?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    mobileNo?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    emailId?: string;
    
  }
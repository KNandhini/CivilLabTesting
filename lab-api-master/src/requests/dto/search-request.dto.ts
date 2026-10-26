import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class SearchRequestDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  formId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mobileNo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;
}
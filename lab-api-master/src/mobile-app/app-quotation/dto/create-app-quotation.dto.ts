import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateAppQuotationLineItemDto } from '../../app-quotation-line-item/dto/create-app-quotation-line-item.dto';

export class CreateAppQuotationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  requestId: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  totalAmount?: string;

  @ApiProperty({ type: [CreateAppQuotationLineItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAppQuotationLineItemDto)
  lineItems: CreateAppQuotationLineItemDto[];
}
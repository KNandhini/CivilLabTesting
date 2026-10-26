import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsDateString } from 'class-validator';

export class CreateReceiptDto {
  @ApiProperty()
  @IsString()
  requestId: string;

  @ApiProperty()
  @IsNumber()
  totalAmount: number;

  @ApiProperty()
  @IsNumber()
  gst: number;

  @ApiProperty()
  @IsDateString()
  receiptDate: Date;
}
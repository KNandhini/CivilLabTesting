import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../users/guards/jwt-auth.guard';
import { ReceiptsService } from './receipts.service';
import { CreateReceiptDto } from './dto/create-receipt.dto';

@ApiTags('receipts')
@Controller('receipts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReceiptsController {
  constructor(private readonly receiptsService: ReceiptsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new receipt' })
  create(@Body() createReceiptDto: CreateReceiptDto) {
    return this.receiptsService.create(createReceiptDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all receipts' })
  findAll() {
    return this.receiptsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get receipt by id' })
  findOne(@Param('id') id: string) {
    return this.receiptsService.findOne(id);
  }

  @Get('request/:requestId')
  @ApiOperation({ summary: 'Get receipts by request ID' })
  findByRequestId(@Param('requestId') requestId: string) {
    return this.receiptsService.findByRequestId(requestId);
  }
}
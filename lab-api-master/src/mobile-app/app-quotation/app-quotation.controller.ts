import { Controller, Post, Body, Get, Param,Res, NotFoundException, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppQuotationService } from './app-quotation.service';
import { CreateAppQuotationDto } from './dto/create-app-quotation.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { EitherJwtAuthGuard } from '../guards/either-jwt-auth.guard';
import { Response } from 'express';

@ApiTags('mobile-app/app-quotation')
@Controller('mobile-app/app-quotation')
@UseGuards(EitherJwtAuthGuard)
export class AppQuotationController {
  constructor(private readonly appQuotationService: AppQuotationService) {}

  @Post()
  @ApiOperation({ summary: 'Create new quotation with line items' })
  create(@Body() createDto: CreateAppQuotationDto, @CurrentUser() user: any) {
    return this.appQuotationService.create(createDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all quotations for user' })
  findAll(@CurrentUser() user: any) {
    return this.appQuotationService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get quotation by id' })
  findOne(@Param('id') id: string) {
    return this.appQuotationService.findOne(id);
  }

  @Get('by-request/:requestId')
  @ApiOperation({ summary: 'Get quotation by requestId with line items' })
  getByRequestId(@Param('requestId') requestId: string) {
    return this.appQuotationService.findByRequestId(requestId);
  }

  @Get(':id/invoice')
  @ApiOperation({ summary: 'Generate and download invoice PDF' })
  async downloadInvoice(@Param('id') id: string, @Res() res: Response) {
    try {
      const pdfBuffer = await this.appQuotationService.generateInvoicePdf(id);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${id}-invoice.pdf"`,
        'Content-Length': pdfBuffer.length,
      });

      res.end(pdfBuffer);
    } catch (error) {
      throw new NotFoundException('Invoice not found');
    }
  }
}
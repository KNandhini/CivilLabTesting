import { Injectable, Inject, forwardRef, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { AppQuotation } from './entities/app-quotation.entity';
import { CreateAppQuotationDto } from './dto/create-app-quotation.dto';
import { AppQuotationLineItem } from '../app-quotation-line-item/entities/app-quotation-line-item.entity';
import { AppRequestsService } from '../app-requests/app-requests.service';
import * as PDFDocument from 'pdfkit'
import { createInvoice } from './invoice-generate';
import { readFileSync } from 'fs';
import { join } from 'path';
import { SystemSettingsService } from '../../system-settings/system-settings.service';

@Injectable()
export class AppQuotationService {
  constructor(
    @InjectRepository(AppQuotation)
    private quotationRepo: Repository<AppQuotation>,
    @InjectRepository(AppQuotationLineItem)
    private lineItemRepo: Repository<AppQuotationLineItem>,
    @Inject(forwardRef(() => AppRequestsService))
    private appRequestsService: AppRequestsService,
    private systemSettingsService: SystemSettingsService,
  ) {}

  async create(createDto: CreateAppQuotationDto, user: any) {
    // Step 1: Save the quotation without line items
    const { lineItems, ...quotationData } = createDto;
// Generate invoice number in format A1/CTC/XX/YYYY-YY
const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const nextYear = currentYear + 1;
const financialYear = `${currentYear}-${nextYear.toString().slice(-2)}`;

// Get the latest invoice number for the current financial year
const latestQuotation = await this.quotationRepo.findOne({
  where: {
    invoiceNo: Like(`A1/CTC/%/${financialYear}`)
  },
  order: { invoiceNo: 'DESC' }
});

let sequenceNumber = 1;
if (latestQuotation && latestQuotation.invoiceNo) {
  // Extract sequence number from A1/CTC/XX/YYYY-YY format
  // The pattern matches A1/CTC/ followed by digits, then / and the financial year
  const match = latestQuotation.invoiceNo.match(/A1\/CTC\/(\d+)\/\d{4}-\d{2}$/);
  if (match && match[1]) {
    sequenceNumber = parseInt(match[1]) + 1;
  }
}

// Format the invoice number with leading zeros (2 digits)
const formattedSequence = String(sequenceNumber).padStart(2, '0');
const invoiceNo = `A1/CTC/${formattedSequence}/${financialYear}`;
    const quotation = this.quotationRepo.create({
      ...quotationData,
      invoiceNo: invoiceNo,
      totalAmount: quotationData.totalAmount ? Math.round(Number(quotationData.totalAmount)) : undefined,
      createdBy: user.userId,
      createdDateTime: new Date()
    });
    const savedQuotation = await this.quotationRepo.save(quotation);

    // Step 2: Map and save line items with the saved quotation's ID
    const mappedLineItems = lineItems.map(item => ({
      description: item.description,
      quantity: item.quantity,
      quotationId: savedQuotation.id,
      unit: item.unit,
      price: item.rate ?? item.price // support both 'rate' and 'price'
    }));
    await this.lineItemRepo.save(mappedLineItems);

    // Step 3: Call AppRequestsService.updateStatus if requestId is present
    if (quotationData.requestId) {
      await this.appRequestsService.updateStatus(quotationData.requestId, 'Payment Initiated');
    }

    // Step 4: Optionally, return the quotation with its line items and creator
    return await this.quotationRepo.findOne({
      where: { id: savedQuotation.id },
      relations: ['lineItems', 'creator']
    });
  }

  async findAll() {
    return await this.quotationRepo.find({
      relations: ['lineItems', 'creator'],
      order: { createdDateTime: 'DESC' }
    });
  }

  async findOne(id: string) {
    return await this.quotationRepo.findOne({
      where: { id },
      relations: ['lineItems', 'creator']
    });
  }

  async findByRequestId(requestId: string) {
    return await this.quotationRepo.findOne({
      where: { requestId },
      relations: ['lineItems', 'request', 'request.appUser','request.appState', 'creator']
    });
  }

  async generateInvoicePdf(requestId: string): Promise<Buffer> {
    const quotation = await this.quotationRepo.findOne({
      where: { requestId: requestId },
      relations: ['lineItems', 'request', 'request.appState', 'creator']
    });

    if (!quotation) {
      throw new NotFoundException('Quotation not found');
    }

    // Get system settings
    const systemSettings = await this.systemSettingsService.getSettings();

    const doc = createInvoice(quotation, systemSettings.data);
    const buffers: Buffer[] = [];

    doc.on('data', (chunk) => buffers.push(chunk));

    return new Promise((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);
    });
  }
}
  
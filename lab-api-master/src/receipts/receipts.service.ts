import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { Receipt } from './entities/receipt.entity';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { ProductTestSampleMapping } from '../sample-collection/entities/product-test-sample-mapping.entity';

@Injectable()
export class ReceiptsService {
  constructor(
    @InjectRepository(Receipt)
    private receiptRepository: Repository<Receipt>,
    @InjectRepository(ProductTestSampleMapping)
    private mappingRepository: Repository<ProductTestSampleMapping>,
  ) {}

  private async generateReceiptNumber(): Promise<string> {
    const lastReceipt = await this.receiptRepository.findOne({
        where: { receiptDate: LessThan(new Date()) },
      order: { receiptNo: 'DESC' },
    });

    let nextNumber = 1;
    if (lastReceipt) {
      const lastNumber = parseInt(lastReceipt.receiptNo.split('-')[1]);
      nextNumber = lastNumber + 1;
    }

    return `REC-${nextNumber.toString().padStart(5, '0')}`;
  }

  async create(createReceiptDto: CreateReceiptDto) {
    // Get all test mappings for the request
    const testMappings = await this.mappingRepository.find({
      where: { requestId: createReceiptDto.requestId },
      relations: ['test']
    });

    if (!testMappings.length) {
      throw new NotFoundException('No tests found for this request');
    }

    // Calculate total amount from test prices
const totalAmount = testMappings.reduce((sum, mapping) => {
  // Convert price to number and handle null/undefined cases
  const price = Number(mapping.test.price) || 0;
  return sum + price;
}, 0);
    const gst = (totalAmount * createReceiptDto.gst) / 100;

    const receiptNo = await this.generateReceiptNumber();
    
    // Check if receipt exists for the request
    console.log(createReceiptDto.requestId);
    const existingReceipt = await this.receiptRepository.findOne({
      where: { requestId: createReceiptDto.requestId }
    });

    let receipt;
    if (existingReceipt) {
      // Update existing receipt without creating a new one
      await this.receiptRepository.update(existingReceipt.id, {
        ...createReceiptDto,
        totalAmount,
        gst
      });
      receipt = await this.receiptRepository.findOne({
        where: { id: existingReceipt.id }
      });
    } else {
      // Create new receipt only if one doesn't exist
      receipt = this.receiptRepository.create({
        ...createReceiptDto,
        receiptNo,
        totalAmount,
        gst
      });
      receipt = await this.receiptRepository.save(receipt);
    }

    return {
      receipt: receipt,
      tests: testMappings.map(mapping => ({
        testId: mapping.testId,
        testName: mapping.test.name,
        price: mapping.test.price
      }))
    };
  }

  async findAll() {
    return await this.receiptRepository.find({
      relations: ['request']
    });
  }

  async findOne(id: string) {
    const receipt = await this.receiptRepository.findOne({
      where: { id },
      relations: ['request']
    });

    if (!receipt) {
      throw new NotFoundException('Receipt not found');
    }

    return receipt;
  }

  async findByRequestId(requestId: string) {
    return await this.receiptRepository.find({
      where: { requestId },
      relations: ['request']
    });
  }
}
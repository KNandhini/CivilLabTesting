import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { SystemSettingsService } from 'src/system-settings/system-settings.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private systemSettingsService: SystemSettingsService,
  ) {}

  create(createProductDto: CreateProductDto) {
    const product = this.productRepository.create(createProductDto);
    return this.productRepository.save(product);
  }

  findAll() {
    return this.productRepository.find({
      relations: ['tests'],
    });
  }

  async findOne(id: string) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['tests'],
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.findOne(id);
    this.productRepository.merge(product, updateProductDto);
    return this.productRepository.save(product);
  }

  async updateReportNo(id: string, reportNo: number, reportType: string = 'NABL') {
    const product = await this.findOne(id);
    if (reportType === 'NON-NABL') {
      product.reportNoNonNabl = reportNo;
    } else {
      product.reportNo = reportNo;
    }
    return this.productRepository.save(product);
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    return this.productRepository.remove(product);
  }

getTotalReportNoSum(): Promise<number> {
  return this.productRepository
    .createQueryBuilder('product')
    .select('SUM(product.reportNo)', 'sum')
    .getRawOne()
    .then(result => Number(result.sum) || 0);
}

async resetAllReportNo(): Promise<{ message: string; updatedCount: number }> {
  const result = await this.productRepository
    .createQueryBuilder()
    .update(Product)
    .set({ reportNo: 0, reportNoNonNabl: 0 })
    .execute();

    await this.systemSettingsService.resetUlrNo();
  
  return {
    message: 'All product reportNo values have been reset to 0',
    updatedCount: result.affected || 0
  };
}
}
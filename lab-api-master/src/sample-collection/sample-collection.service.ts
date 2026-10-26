import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SampleCollection } from './entities/sample-collection.entity';
import { ProductTestSampleMapping } from './entities/product-test-sample-mapping.entity';
import { CreateSampleCollectionDto } from './dto/create-sample-collection.dto';
import { CreateProductTestMappingDto } from './dto/create-product-test-mapping.dto';
import { ContractReviewService } from '../contract-review/contract-review.service';
import { RequestStatus } from '../requests/enums/request-status.enum';
import { RequestsService } from '../requests/requests.service';
import { UpdateUserMappingDto } from './dto/update-user-mapping.dto';

@Injectable()
export class SampleCollectionService {
  constructor(
    @InjectRepository(SampleCollection)
    private sampleCollectionRepository: Repository<SampleCollection>,
    @InjectRepository(ProductTestSampleMapping)
    private mappingRepository: Repository<ProductTestSampleMapping>,
    private contractReviewService: ContractReviewService,
    private requestsService: RequestsService  // Add this injection
  ) {}

  async createSample(createDto: CreateSampleCollectionDto,userId: string) {
    const contractReview = await this.contractReviewService.findByRequestId(createDto.requestId);

    if (!contractReview) {
      throw new NotFoundException('Contract review not found');
    }

    // const serialNo = await this.getNextSerialNumber(createDto.requestId);
    // const dateOfCasting = new Date(contractReview.dateOfCasting).toISOString().split('T')[0];
    
    // const sampleId = `${contractReview.request.formId}-${contractReview.gradeOfConcrete}-${dateOfCasting}-${serialNo}`;

    const sample = this.sampleCollectionRepository.create({
      ...createDto,
    });

    const savedSample = await this.sampleCollectionRepository.save(sample);

    // Check if this is the first sample for this request
    const existingSamples = await this.sampleCollectionRepository.find({
      where: { requestId: createDto.requestId }
    });

    // Update request status based on sample count
    const status = existingSamples.length === 1 
      ? RequestStatus.CONTRACT_REVIEW_CREATED 
      : RequestStatus.SAMPLE_COLLECTED;

    await this.requestsService.update(createDto.requestId, { status }, userId);

    return savedSample;
  }

  async createMapping(createDto: CreateProductTestMappingDto) {
    const existingMapping = await this.mappingRepository.findOne({
      where: {
        productId: createDto.productId,
        testId: createDto.testId,
        sampleId: createDto.sampleId
      }
    });

    if (existingMapping) {
      throw new BadRequestException('A mapping with this product, test, and sample combination already exists');
    }

    const mapping = this.mappingRepository.create(createDto);
    return await this.mappingRepository.save(mapping);
  }

  async findAllSamples() {
    return await this.sampleCollectionRepository.find({
      relations: ['request', 'productTestMappings']
    });
  }

  async findAllMappings() {
    return await this.mappingRepository.find({
      relations: ['request', 'product', 'test', 'sample']
    });
  }

  private async getNextSerialNumber(requestId: string): Promise<number> {
    const samples = await this.sampleCollectionRepository.find({
      where: { requestId },
      order: { sampleId: 'DESC' },
    });

    return samples.length + 1;
  }

  async findByRequestId(requestId: string) {
    const samples = await this.sampleCollectionRepository.find({
      where: { requestId },
      relations: ['request'],
      order: { sampleId: 'ASC' }
    });

    const mappings = await this.mappingRepository.find({
      where: { requestId },
      relations: ['product', 'test', 'sample']
    });

    return {
      samples,
      mappings
    };
  }

  async findMappingsByRequestId(requestId: string, userId?: string) {
    const mappings = await this.mappingRepository.find({
      where: userId ? { requestId, userId } : { requestId },
      relations: [
        'request',
        'product',
        'test',
        'sample',
        'request.contractReview',
        'test.schemaMappings',
        'test.schemaMappings.schema', // Add schema relation for observation entries
      ]
    });

    if (!mappings.length) {
      throw new NotFoundException(`No mappings found for request ID ${requestId}`);
    }

    return mappings;
  }


async deleteSample(id: string) {
    const sample = await this.sampleCollectionRepository.findOne({
      where: { id }
    });

    if (!sample) {
      throw new NotFoundException('Sample collection not found');
    }

    // Delete related mappings first
    await this.mappingRepository.delete({ sampleId: id });
    
    // Delete the sample
    await this.sampleCollectionRepository.delete(id);

    return { message: 'Sample and related mappings deleted successfully' };
  }

  async updateSample(id: string, updateDto: Partial<CreateSampleCollectionDto>) {
    const sample = await this.sampleCollectionRepository.findOne({
      where: { id }
    });

    if (!sample) {
      throw new NotFoundException('Sample collection not found');
    }

    await this.sampleCollectionRepository.update(id, updateDto);

    return this.sampleCollectionRepository.findOne({
      where: { id },
      relations: ['request']
    });
  }

  async updateMapping(id: string, updateDto: Partial<CreateProductTestMappingDto>) {
    const mapping = await this.mappingRepository.findOne({
      where: { id }
    });

    if (!mapping) {
      throw new NotFoundException('Product test sample mapping not found');
    }

    await this.mappingRepository.update(id, updateDto);

    return this.mappingRepository.findOne({
      where: { id },
      relations: ['request', 'product', 'test', 'sample']
    });
}

  async deleteMapping(id: string) {
      const mapping = await this.mappingRepository.findOne({
        where: { id }
      });
  
      if (!mapping) {
        throw new NotFoundException('Product test sample mapping not found');
      }
  
      await this.mappingRepository.delete(id);
      return { message: 'Product test sample mapping deleted successfully' };
    }
  

  async assignUserToMapping(id: string, updateUserMappingDto: UpdateUserMappingDto) {
      const mapping = await this.mappingRepository.findOne({
        where: { id },
        relations: ['user']
      });
  
      if (!mapping) {
        throw new NotFoundException('Product test sample mapping not found');
      }
  
      await this.mappingRepository.update(id, {
        userId: updateUserMappingDto.userId,
        createdAt: new Date()
      });
  
      return this.mappingRepository.findOne({
        where: { id },
        relations: ['user', 'test', 'sample', 'product']
      });
    }
}

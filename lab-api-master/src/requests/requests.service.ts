import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from './entities/request.entity';
import { SearchRequestDto } from './dto/search-request.dto';
import { CreateRequestDto } from './dto/create-request.dto';
import { reportItem } from './dto/types';
import { LabTestQueryDto } from './dto/labtest-request.dto';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private requestRepository: Repository<Request>,
  ) {}

  async findAll(searchRequestDto: SearchRequestDto) {
    const { page = 1, limit = 10, formId, customerName, mobileNo, status } = searchRequestDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.requestRepository
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.contractReview', 'contractReview')
      .leftJoinAndSelect('request.productTestSampleMappings', 'mappings')
      .leftJoinAndSelect('mappings.test', 'test')
      .leftJoinAndSelect('mappings.product', 'product')
      .orderBy('request.createdDate', 'DESC');

    if (formId) {
      queryBuilder.andWhere('request.formId ILIKE :formId', { formId: `%${formId}%` });
    }

    if (customerName) {
      queryBuilder.andWhere('contractReview.customerName ILIKE :customerName', { customerName: `%${customerName}%` });
    }

    if (mobileNo) {
      queryBuilder.andWhere('contractReview.mobileNo ILIKE :mobileNo', { mobileNo: `%${mobileNo}%` });
    }

    if (status) {
      queryBuilder.andWhere('request.status = :status', { status });
    }

    const [requests, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: requests,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async create(createRequestDto: CreateRequestDto, userId: string) {
    // Get the last request to generate next formId
    const lastRequest = await this.requestRepository
      .createQueryBuilder('request')
      .orderBy('request.formId', 'DESC')
      .getOne();

    let nextNumber = 1;
    if (lastRequest) {
      const lastNumber = parseInt(lastRequest.formId.split('-').pop() || '0');
      nextNumber = lastNumber + 1;
    }

    const formId = `${createRequestDto.prefix}-${nextNumber}`;

    const request = this.requestRepository.create({
      formId,
      appRequestId: createRequestDto.appRequestId,
      createdUserId: userId
    });

    return await this.requestRepository.save(request);
  }

  async findOne(id: string) {
    return await this.requestRepository.findOne({
      where: { id },
      relations: ['createdUser', 'modifiedUser', 'contractReview']
    });
  }

  async update(id: string, updateData: any, userId: string) {
    await this.requestRepository.update(id, {
      ...updateData,
      modifiedUserId: userId
    });
    return this.findOne(id);
  }

  async updateReportNo(id:string, reportNo:reportItem[]){
    const request = await this.findOne(id);
    if(request){
      request.reportNo = reportNo
      this.requestRepository.save(request)
    }
  }

  async remove(id: string) {
    await this.requestRepository.delete(id);
    return { deleted: true };
  }


  async getRequestsByLabUser(userId: string, query: LabTestQueryDto) {
    // Calculate offset for pagination
    const { page, limit, formId, name, mobileNo, emailId } = query;
    const skip = (page - 1) * limit;

    

    // Build a query with search params for formId, name, mobileNo, emailId in ContractReview if not empty
    const qb = this.requestRepository
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.contractReview', 'contractReview')
      .leftJoinAndSelect('request.productTestSampleMappings', 'mapping')
      .leftJoinAndSelect('mapping.test', 'test')
      .leftJoinAndSelect('mapping.sample', 'sample')
      .leftJoinAndSelect('mapping.product', 'product')
      .where('mapping.userId = :userId', { userId });

    // Add search filters if provided
    if (formId) {
      qb.andWhere('request.formId ILIKE :formId', { formId: `%${formId}%` });
    }
    if (name) {
      qb.andWhere('contractReview.customerName ILIKE :name', { name: `%${name}%` });
    }
    if (mobileNo) {
      qb.andWhere('contractReview.mobileNo ILIKE :mobileNo', { mobileNo: `%${mobileNo}%` });
    }
    if (emailId) {
      qb.andWhere('contractReview.emailId ILIKE :emailId', { emailId: `%${emailId}%` });
    }

    const requests = await qb.getMany();

    // Sort requests in-memory by latest mapping.createdAt (as before)
    requests.sort((a, b) => {
      // Find the latest createdAt date in b
      const bLatest = b.productTestSampleMappings && b.productTestSampleMappings.length
        ? b.productTestSampleMappings
            .map(m => m?.createdAt ? new Date(m.createdAt).getTime() : 0)
            .reduce((max, curr) => Math.max(max, curr), 0)
        : 0;
      // Find the latest createdAt date in a
      const aLatest = a.productTestSampleMappings && a.productTestSampleMappings.length
        ? a.productTestSampleMappings
            .map(m => m?.createdAt ? new Date(m.createdAt).getTime() : 0)
            .reduce((max, curr) => Math.max(max, curr), 0)
        : 0;
      // Sort descending: latest first
      return bLatest - aLatest;
    });

    const paginatedRequests = requests.slice(skip, skip + Number(limit));

    // Return paginated result with meta
    return {
      data: paginatedRequests,
      meta: {
        total: requests.length,
        page,
        limit,
        pageCount: Math.ceil(requests.length / limit),
      },
    };
  }
    
}
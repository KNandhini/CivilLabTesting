import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { AppRequest } from './entities/app-request.entity';
import { CreateAppRequestDto } from './dto/create-app-request.dto';
import { AppRequestTestsMap } from '../app-request-tests-map/entities/app-request-tests-map.entity';
import { Test } from '../../tests/entities/test.entity';
import { SearchAppRequestDto } from './dto/search-app-request.dto';

@Injectable()
export class AppRequestsService {
  constructor(
    @InjectRepository(AppRequest)
    private appRequestRepository: Repository<AppRequest>,
    @InjectRepository(AppRequestTestsMap)
    private appRequestTestsMapRepository: Repository<AppRequestTestsMap>,
    @InjectRepository(Test) // Inject Test repository
    private testRepository: Repository<Test>,
  ) {}

  async create(createAppRequestDto: CreateAppRequestDto, userId: string) {
    // Create and save the app request
    const request = this.appRequestRepository.create({
      ...createAppRequestDto,
      appUserId: userId,
    });
    const savedRequest = await this.appRequestRepository.save(request);

    // If selected tests exist, create test mapping records
    if (createAppRequestDto.selectedTests?.length > 0) {
      // Get test details including prices from Test entity
      const tests = await this.testRepository.findByIds(createAppRequestDto.selectedTests);
      
      const testMappings = tests.map(test => ({
        requestId: savedRequest.id,
        testId: test.id,
        price: test.price
      }));
      
      await this.appRequestTestsMapRepository.save(testMappings);
    }

    return savedRequest;
  }

  async findByUser(userId: string) {
    return await this.appRequestRepository.find({
      where: { appUserId: userId },
      relations: ['appUser'],
      order: { createdDateTime: 'DESC' }
    });
  }

  async findAll(query: SearchAppRequestDto) {
    const { page = 1, limit = 10, name, mobileNo, emailId } = query;
    const skip = (page - 1) * limit;

    const qb = this.appRequestRepository
      .createQueryBuilder('appRequest')
      .leftJoinAndSelect('appRequest.appUser', 'appUser')
      .leftJoinAndSelect('appRequest.requestTests', 'requestTests')
      .leftJoinAndSelect('requestTests.test', 'test')
      .leftJoinAndSelect('test.product', 'product')
      .orderBy('appRequest.createdDateTime', 'DESC')
      .skip(skip)
      .take(limit);

    if (name) {
      qb.andWhere('appRequest.name ILIKE :name', { name: `%${name}%` });
    }
    if (mobileNo) {
      qb.andWhere('appRequest.mobileNumber ILIKE :mobileNumber', { mobileNumber: `%${mobileNo}%` });
    }
    if (emailId) {
      qb.andWhere('appRequest.email ILIKE :email', { email: `%${emailId}%` });
    }

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string, userId: string) {
    const appRequest = await this.appRequestRepository
    .createQueryBuilder('appRequest')
    .leftJoinAndSelect('appRequest.appState', 'appState')
    .where('appRequest.id = :id', { id })
    .getOne();

    if (!appRequest) {
      throw new NotFoundException('Request not found');
    }

    return appRequest;
  }

  async update(id: string, updateAppRequestDto: Partial<CreateAppRequestDto>, userId: string) {
    const request = await this.findOne(id, userId);
    await this.appRequestRepository.update(id, updateAppRequestDto);
    return this.findOne(id, userId);
  }

  async remove(id: string, userId: string) {
    const request = await this.findOne(id, userId);
    await this.appRequestRepository.remove(request);
    return { message: 'Request deleted successfully' };
  }

  async getRequestStats(userId: string) {
    const [total, pending, completed] = await Promise.all([
      this.appRequestRepository.count({ where: { appUserId: userId } }),
      this.appRequestRepository.count({ where: { appUserId: userId, status: 'Pending' } }),
      this.appRequestRepository.count({ where: { appUserId: userId, status: 'Completed' } })
    ]);

    return {
      total,
      pending,
      completed
    };
  }

  async getRecentActivity(userId: string) {
    return await this.appRequestRepository.find({
      where: { appUserId: userId },
      relations: ['requestTests', 'requestTests.test'],
      order: { createdDateTime: 'DESC' },
      take: 10 // Limit to 10 recent activities
    });
  }

  async getRequestHistory(userId: string) {
      const requests = await this.appRequestRepository.find({
        where: { appUserId: userId },
        relations: ['appUser'],
        order: { createdDateTime: 'DESC' },
        select: {
          id: true,
          projectName: true,
          siteLocation: true,
          organization: true,
          status: true,
          createdDateTime: true,
          appUser: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      });

      // Get test mappings and test details
      const requestIds = requests.map(request => request.id);
      const testMappings = await this.appRequestTestsMapRepository.find({
        where: { requestId: In(requestIds) },
        relations: ['test']
      });

      // Group test mappings by request ID
      const testMappingsByRequest = testMappings.reduce((acc, mapping) => {
        if (!acc[mapping.requestId]) {
          acc[mapping.requestId] = [];
        }
        acc[mapping.requestId].push({
          testName: mapping.test.name
        });
        return acc;
      }, {});

      // Combine requests with their tests
      return requests.map(request => ({
        ...request,
        requestTests: testMappingsByRequest[request.id] || []
      }));
    }
  
  async updateStatus(id: string, status: string) {
    const request = await this.appRequestRepository.findOne({
      where: { id },
    });
    if (!request) {
      throw new NotFoundException('Request not found');
    }
    request.status = status;
    await this.appRequestRepository.save(request);
    return { message: 'Status updated successfully', status };
  }
  
  async updatePayment(
    id: string,
    paymentStatus: string,
    paymentReferenceNo: string,
  ) {
    const request = await this.appRequestRepository.findOne({
      where: { id },
    });
    if (!request) {
      throw new NotFoundException('Request not found'); 
    }
    request.status = 'Payment Completed'
    request.paymentStatus = paymentStatus;
    request.paymentRefereceNo = paymentReferenceNo;
    await this.appRequestRepository.save(request);
    return { message: 'Payment details updated successfully', id, paymentStatus, paymentReferenceNo };
  }

  async updateReport(id: string) {
    const request = await this.appRequestRepository.findOne({ where: { id } });
    if (!request) {
      throw new NotFoundException('Request not found');
    }
    request.status = 'Completed';

    
    await this.appRequestRepository.save(request);
    return { message: 'Report updated successfully', id };
  }

  async getReport(id: string): Promise<Buffer | null> {

    const appRequest = await this.appRequestRepository
  .createQueryBuilder('appRequest')
  .leftJoinAndSelect('appRequest.requestTests', 'requestTests')
  .leftJoinAndSelect('requestTests.test', 'test')
  .where('appRequest.id = :id', { id })
  .getOne();
    // const request = await this.appRequestRepository.findOne({
    //   where: { id },
    //   select: ['report'],
    // });
    return appRequest?.report || null;
  }

 
}
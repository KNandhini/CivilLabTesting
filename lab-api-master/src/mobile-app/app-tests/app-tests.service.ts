import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppTest } from './entities/app-test.entity';
import { AppRequestTestsMap } from '../app-request-tests-map/entities/app-request-tests-map.entity';
import { CreateAppTestDto } from './dto/create-app-test.dto';

@Injectable()
export class AppTestsService {
  constructor(
    @InjectRepository(AppTest)
    private appTestRepository: Repository<AppTest>,
    @InjectRepository(AppRequestTestsMap)
    private appRequestTestsMapRepository: Repository<AppRequestTestsMap>,
  ) {}

  async create(createAppTestDto: CreateAppTestDto) {
    const test = this.appTestRepository.create(createAppTestDto);
    return await this.appTestRepository.save(test);
  }

  async findAll() {
    return await this.appTestRepository.find({
      order: { createdDateTime: 'DESC' }
    });
  }

  async findOne(id: string) {
    const test = await this.appTestRepository.findOne({ where: { id } });
    if (!test) {
      throw new NotFoundException('Test not found');
    }
    return test;
  }

  async update(id: string, updateAppTestDto: Partial<CreateAppTestDto>) {
    const test = await this.findOne(id);
    await this.appTestRepository.update(id, updateAppTestDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    const test = await this.findOne(id);
    await this.appTestRepository.remove(test);
    return { message: 'Test deleted successfully' };
  }

async findByRequestId(requestId: string) {
  const mappings = await this.appRequestTestsMapRepository.find({
    where: { requestId },
    relations: ['test', 'test.product'],
  });
  return mappings.map(m => m.test);
}
}
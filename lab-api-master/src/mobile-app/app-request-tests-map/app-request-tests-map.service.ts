import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppRequestTestsMap } from './entities/app-request-tests-map.entity';
import { CreateAppRequestTestsMapDto } from './dto/create-app-request-tests-map.dto';

@Injectable()
export class AppRequestTestsMapService {
  constructor(
    @InjectRepository(AppRequestTestsMap)
    private mappingRepository: Repository<AppRequestTestsMap>,
  ) {}

  async create(createDto: CreateAppRequestTestsMapDto) {
    const mapping = this.mappingRepository.create(createDto);
    return await this.mappingRepository.save(mapping);
  }

  async findByRequestId(requestId: string) {
    return await this.mappingRepository.find({
      where: { requestId },
      relations: ['test']
    });
  }

  async remove(id: string) {
    const mapping = await this.mappingRepository.findOne({ where: { id } });
    if (!mapping) {
      throw new NotFoundException('Mapping not found');
    }
    await this.mappingRepository.remove(mapping);
    return { message: 'Test mapping removed successfully' };
  }
}
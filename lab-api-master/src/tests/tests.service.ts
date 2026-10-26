import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Test } from './entities/test.entity';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';

@Injectable()
export class TestsService {
  constructor(
    @InjectRepository(Test)
    private testRepository: Repository<Test>,
  ) {}

  create(createTestDto: CreateTestDto) {
    const test = this.testRepository.create(createTestDto);
    return this.testRepository.save(test);
  }

  findAll() {
    return this.testRepository.find({
      relations: ['product'],
    });
  }

  async findOne(id: string) {
    const test = await this.testRepository.findOne({
      where: { id },
      relations: ['product'],
    });
    if (!test) {
      throw new NotFoundException(`Test with ID ${id} not found`);
    }
    return test;
  }

  async update(id: string, updateTestDto: UpdateTestDto) {
    const test = await this.findOne(id);
    this.testRepository.merge(test, updateTestDto);
    return this.testRepository.save(test);
  }

  async remove(id: string) {
    const test = await this.findOne(id);
    return this.testRepository.remove(test);
  }

  findByProduct(productId: string) {
    return this.testRepository.find({
      where: { productId },
      relations: ['product'],
    });
  }
}
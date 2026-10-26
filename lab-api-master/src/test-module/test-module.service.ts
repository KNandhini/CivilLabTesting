import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Material } from './entities/material.entity';
import { TestType } from './entities/test-type.entity';
import { TestResult } from './entities/test-result.entity';
import { PerformTestDto } from './dto/perform-test.dto';
import { TestCalculationService } from './test-calculation.service';

@Injectable()
export class TestModuleService {
  constructor(
    @InjectRepository(Material)
    private materialRepository: Repository<Material>,
    @InjectRepository(TestType)
    private testTypeRepository: Repository<TestType>,
    @InjectRepository(TestResult)
    private testResultRepository: Repository<TestResult>,
    private testCalculationService: TestCalculationService,
  ) {}

  async performTest(performTestDto: PerformTestDto): Promise<TestResult> {
    const material = await this.materialRepository.findOne({
      where: { id: performTestDto.materialId },
    });
    if (!material) {
      throw new NotFoundException('Material not found');
    }

    const testType = await this.testTypeRepository.findOne({
      where: { id: performTestDto.testTypeId },
    });
    if (!testType) {
      throw new NotFoundException('Test type not found');
    }

    const results = await this.testCalculationService.calculateResults(
      testType,
      performTestDto.inputValues
    );

    const testResult = this.testResultRepository.create({
      material,
      testType,
      inputValues: performTestDto.inputValues,
      results,
      status: 'COMPLETED',
      remarks: performTestDto.remarks,
    });

    return this.testResultRepository.save(testResult);
  }

  async getMaterialTests(materialId: string): Promise<TestType[]> {
    const material = await this.materialRepository.findOne({
      where: { id: materialId },
    });
    if (!material) {
      throw new NotFoundException('Material not found');
    }

    return this.testTypeRepository.find({
      where: { materialCategory: material.category },
    });
  }

  async getTestResults(materialId: string): Promise<TestResult[]> {
    return this.testResultRepository.find({
      where: { material: { id: materialId } },
      relations: ['material', 'testType'],
    });
  }
}
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestSchema } from './entities/test-schema.entity';
import { CreateTestSchemaDto } from './dto/create-test-schema.dto';
import { TestSchemaMapping } from './entities/test-schema-mapping.entity';

@Injectable()
export class TestSchemaService {
  constructor(
    @InjectRepository(TestSchema)
    private testSchemaRepository: Repository<TestSchema>,
    @InjectRepository(TestSchemaMapping)
    private testSchemaMappingRepository: Repository<TestSchemaMapping>,
  ) {}

  async create(createTestSchemaDto: CreateTestSchemaDto) {
const schemaData = createTestSchemaDto;
    
    // Create the test schema record
    const schema = this.testSchemaRepository.create(schemaData);
    const savedSchema = await this.testSchemaRepository.save(schema);

    // Create mappings for selected tests
    if (createTestSchemaDto.testIds && createTestSchemaDto.testIds.length > 0) {
      const mappings = createTestSchemaDto.testIds.map(testId => ({
        testId,
        schemaId: savedSchema.id
      }));
      await this.testSchemaMappingRepository.save(mappings);
    }

    return savedSchema;
  }

  async findAll() {
    return await this.testSchemaRepository.find({
      relations: ['testMappings', 'testMappings.test']
    });
  }

async findOne(id: string, includeProducts: boolean = true) {
  const schema = await this.testSchemaRepository.findOne({
    where: { id },
    relations: {
      testMappings: {
        test: {
          product: true
        }
      }
    }
  });

  if (!schema) {
    throw new Error(`Test schema with id ${id} not found`);
  }

  // Transform the response to include nested product data
  if (schema.testMappings) {
    schema.testMappings = schema.testMappings.map(mapping => ({
      ...mapping,
      test: {
        ...mapping.test,
        product: mapping.test?.product
      }
    }));
  }

  return schema;
}
   

async update(id: string, updateTestSchemaDto: any) {
  // Get the existing test schema
  const existingSchema = await this.testSchemaRepository.findOne({
    where: { id }
  });

  if (!existingSchema) {
    throw new Error(`Test schema with id ${id} not found`);
  }

  // Remove items to update from DTO
  const { testIds, ...updateData } = updateTestSchemaDto;

  // Update the entity with the new data
  existingSchema.schema = updateTestSchemaDto;
  // Object.assign(existingSchema, updateData);

  // Save the updated entity
  await this.testSchemaRepository.save(existingSchema);

  // Return the updated schema with all relations
  return this.findOne(id);
}

async remove(id: string) {
  // Delete all related test schema mappings first
  await this.testSchemaMappingRepository.delete({ schemaId: id });
  
  // Then delete the test schema
  await this.testSchemaRepository.delete(id);
  
  return { deleted: true };
}
}
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObservationEntry } from './entities/observation-entry.entity';
import { CreateObservationEntryDto } from './dto/create-observation-entry.dto';
import { ProductTestSampleMapping } from '../sample-collection/entities/product-test-sample-mapping.entity';
import { TestSchema } from 'src/test-schema/entities/test-schema.entity';
import { UpdateAdditionalInfoDto } from './dto/update-additional-info.dto';
import { RequestStatus } from '../requests/enums/request-status.enum';
import { RequestsService } from '../requests/requests.service';
import { AppRequestsService } from 'src/mobile-app/app-requests/app-requests.service';

@Injectable()
export class ObservationEntryService {
  constructor(
    @InjectRepository(ObservationEntry)
    private observationEntryRepository: Repository<ObservationEntry>,
    @InjectRepository(TestSchema)
    private testSchemaRepository: Repository<TestSchema>,
    private requestsService: RequestsService,
    private appRequestService:AppRequestsService
  ) {}

  async create(createDto: CreateObservationEntryDto) {
    const mapping = await this.testSchemaRepository.findOne({
      where: { id: createDto.schemaId },
    });

    if (!mapping) {
      throw new NotFoundException('Product test sample mapping not found');
    }

    const result = [ ...createDto.result ];
    const schemas = mapping.schema

    // Find and process formula fields
    const formulaFields = schemas.filter(schema => schema.type === 'formula');

    for (const formulaField of formulaFields) {
      try {
        let formulaExpression = formulaField.value;

        // Replace field placeholders with actual values
        schemas.forEach(schema => {
            const fieldValue = result.find(field => field.field === schema.field)?.value;
            if (fieldValue === undefined) {
              throw new BadRequestException(`Missing value for field: ${schema.field}`);
            }
            formulaExpression = formulaExpression.replace(
              new RegExp(`{${schema.field}}`, 'g'),
              fieldValue.toString()
            );
        });

        // Remove any remaining curly braces
        formulaExpression = formulaExpression.replace(/{|}/g, '');

        // Evaluate the formula
        const calculatedValue = eval(formulaExpression);
        
        // Add the calculated value to the result

         const resultField = result.find(field => field.field === formulaField.field);
        if (resultField) {
          resultField.value = calculatedValue;  
        }
        // result[formulaField.field] = calculatedValue;
      } catch (error) {
        throw new BadRequestException(
          `Error calculating formula for ${formulaField.field}: ${error.message}`
        );
      }
    }

    // Check if entry already exists with the same IDs
    // Check for existing entry with unique constraint
    const existingEntry = await this.observationEntryRepository.findOne({
      where: {
        schemaId: createDto.schemaId,
        productTestSampleMappingId: createDto.productTestSampleMappingId,
        requestId: createDto.requestId
      }
    });

    // If entry exists, update it. Otherwise create new entry
    const entry = existingEntry 
      ? await this.observationEntryRepository.save({
          ...existingEntry,
          result: result
        })
      : await this.observationEntryRepository.save({
          schemaId: createDto.schemaId,
          productTestSampleMappingId: createDto.productTestSampleMappingId, 
          requestId: createDto.requestId,
          result
        });

    return entry;
  }

  async findAll() {
    return await this.observationEntryRepository.find({
      relations: ['productTestSampleMapping', 'productTestSampleMapping.test', 'productTestSampleMapping.sample']
    });
  }

  async findOne(id: string) {
    const entry = await this.observationEntryRepository.findOne({
      where: { id },
      relations: ['productTestSampleMapping', 'productTestSampleMapping.test', 'productTestSampleMapping.sample']
    });

    if (!entry) {
      throw new NotFoundException('Observation entry not found');
    }

    return entry;
  }

  async findByMappingId(mappingId: string) {
    return await this.observationEntryRepository.find({
      where: { schemaId: mappingId },
      relations: ['productTestSampleMapping', 'productTestSampleMapping.test', 'productTestSampleMapping.sample']
    });
  }

  async findByRequestId(requestId: string, userId?:string) {
      const entries = await this.observationEntryRepository.find({
        relations: [
          'productTestSampleMapping',
          'productTestSampleMapping.sample',
          'productTestSampleMapping.test',
          'productTestSampleMapping.product',
          'productTestSampleMapping.request',
          "productTestSampleMapping.user"
        ],
        where: {
          productTestSampleMapping: {
            requestId: requestId,
            ...(userId && { userId })
          }
        }
      });
  
      if (!entries.length) {
        throw new NotFoundException(`No observation entries found for request ID ${requestId}`);
      }
  
      return entries;
    }

  async findByMultipleIds(
      productTestSampleMappingId: string,
      requestId: string,
    ) {
      const entry = await this.observationEntryRepository.findOne({
        where: {
          productTestSampleMappingId,
          requestId,
        },
        relations: [
          'productTestSampleMapping',
          'productTestSampleMapping.test',
          'productTestSampleMapping.sample',
          'productTestSampleMapping.product',
          'schema'
        ]
      });
  
      if (!entry) {
        throw new NotFoundException('Observation entry not found');
      }
  
      return entry;
    }

  async update(id: string, updateDto: Partial<CreateObservationEntryDto>) {
    const entry = await this.findOne(id);
    await this.observationEntryRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    const entry = await this.findOne(id);
    await this.observationEntryRepository.remove(entry);
    return { message: 'Observation entry deleted successfully' };
  }

  async updateAdditionalInfo(updateDto: UpdateAdditionalInfoDto) {
      const entry = await this.observationEntryRepository.findOne({
        where: {
          requestId: updateDto.requestId,
          productTestSampleMappingId: updateDto.productTestSampleMappingId,
          schemaId: updateDto.schemaId,
        }
      });
  
      if (!entry) {
        throw new NotFoundException('Observation entry not found');
      }
  
      // Update only the provided fields
      const updateData = {
        ...(updateDto.receivedBy && { receivedBy: updateDto.receivedBy }),
        ...(updateDto.condition && { condition: updateDto.condition }),
        ...(updateDto.remarks && { remarks: updateDto.remarks }),
        ...(updateDto.resources !== undefined && { resources: updateDto.resources }),
        ...(updateDto.verification !== undefined && { verification: updateDto.verification }),
        ...(updateDto.pertinentDiscussion !== undefined && { pertinentDiscussion: updateDto.pertinentDiscussion }),
        ...(updateDto.efficiency !== undefined && { efficiency: updateDto.efficiency }),
        ...(updateDto.conditionsCheck !== undefined && { conditionsCheck: updateDto.conditionsCheck }),
        ...(updateDto.testStartDate && { testStartDate: updateDto.testStartDate }),
        ...(updateDto.testCompletionDate && { testCompletionDate: updateDto.testCompletionDate }),
        ...(updateDto.statusOnTest && { statusOnTest: updateDto.statusOnTest }),
        ...(updateDto.userId !== undefined && { userId: updateDto.userId }),
        ...(updateDto.staffId !== undefined && { staffId: updateDto.staffId }),
        ...(updateDto.codeNo !== undefined && { codeNo: updateDto.codeNo }),
        ...(updateDto.temperature !== undefined && { temperature: updateDto.temperature }),
        ...(updateDto.humidity !== undefined && { humidity: updateDto.humidity }),
        ...(updateDto.materialStatus !== undefined && { materialStatus: updateDto.materialStatus }),
        ...(updateDto.sampleStorageCondition !== undefined && { sampleStorageCondition: updateDto.sampleStorageCondition }),
        ...(updateDto.gradeOfSteel !== undefined && { gradeOfSteel: updateDto.gradeOfSteel }),
      };
  
      await this.observationEntryRepository.update(entry.id, updateData);

// Update the status of ProductTestSampleMapping
await this.observationEntryRepository.manager.update(ProductTestSampleMapping,
  updateDto.productTestSampleMappingId,
  { status: updateDto.statusOnTest }
);
    // Check all ProductTestSampleMappings for this request
    const allMappings = await this.observationEntryRepository.manager.find(ProductTestSampleMapping, {
      where: { requestId: updateDto.requestId }
    });

    const allCompleted = allMappings.every(mapping => mapping.status === 'Completed');

    // Update request status based on ProductTestSampleMapping status
    await this.requestsService.update(
      updateDto.requestId, 
      { 
        status: allCompleted ? RequestStatus.TEST_COMPLETED : RequestStatus.TEST_IN_PROGRESS 
      },
      updateDto.userId || '00000000-0000-0000-0000-000000000000'
    );

    const request = await this.requestsService.findOne(updateDto.requestId);
    if(request && request.appRequestId && allCompleted){
      this.appRequestService.updateReport(request.appRequestId)
    }



    return this.findOne(entry.id);
  }
}
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TestSchemaService } from './test-schema.service';
import { CreateTestSchemaDto } from './dto/create-test-schema.dto';

@ApiTags('test-schemas')
@Controller('test-schemas')
export class TestSchemaController {
  constructor(private readonly testSchemaService: TestSchemaService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new test schema' })
  @ApiResponse({ status: 201, description: 'Test schema created successfully' })
  create(@Body() createTestSchemaDto: CreateTestSchemaDto) {
    return this.testSchemaService.create(createTestSchemaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all test schemas' })
  findAll() {
    return this.testSchemaService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a test schema by id' })
  findOne(@Param('id') id: string) {
    return this.testSchemaService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a test schema' })
  update(@Param('id') id: string, @Body() updateTestSchemaDto: any) {
    return this.testSchemaService.update(id, updateTestSchemaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a test schema' })
  remove(@Param('id') id: string) {
    return this.testSchemaService.remove(id);
  }
}
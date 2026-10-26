import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TestsService } from './tests.service';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';

@ApiTags('tests')
@Controller('tests')
export class TestsController {
  constructor(private readonly testsService: TestsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new test' })
  @ApiResponse({ status: 201, description: 'Test successfully created' })
  create(@Body() createTestDto: CreateTestDto) {
    return this.testsService.create(createTestDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tests' })
  findAll() {
    return this.testsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a test by id' })
  findOne(@Param('id') id: string) {
    return this.testsService.findOne(id);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get tests by product id' })
  findByProduct(@Param('productId') productId: string) {
    return this.testsService.findByProduct(productId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a test' })
  update(@Param('id') id: string, @Body() updateTestDto: UpdateTestDto) {
    return this.testsService.update(id, updateTestDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a test' })
  remove(@Param('id') id: string) {
    return this.testsService.remove(id);
  }
}
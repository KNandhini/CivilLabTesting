import { Controller, Get, Post, Body, UseGuards, Param, Delete, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../users/guards/jwt-auth.guard';
import { SampleCollectionService } from './sample-collection.service';
import { CreateSampleCollectionDto } from './dto/create-sample-collection.dto';
import { CreateProductTestMappingDto } from './dto/create-product-test-mapping.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UpdateUserMappingDto } from './dto/update-user-mapping.dto';

@ApiTags('sample-collection')
@Controller('sample-collection')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SampleCollectionController {
  constructor(private readonly sampleCollectionService: SampleCollectionService) {}

  @Post('samples')
  @ApiOperation({ summary: 'Create a new sample collection' })
  createSample(@Body() createDto: CreateSampleCollectionDto, @CurrentUser() user: any) {
    return this.sampleCollectionService.createSample(createDto, user.userId);
  }

  @Post('mappings')
  @ApiOperation({ summary: 'Create a new product-test-sample mapping' })
  createMapping(@Body() createDto: CreateProductTestMappingDto) {
    return this.sampleCollectionService.createMapping(createDto);
  }

  @Get('samples')
  @ApiOperation({ summary: 'Get all sample collections' })
  findAllSamples() {
    return this.sampleCollectionService.findAllSamples();
  }

  @Get('mappings')
  @ApiOperation({ summary: 'Get all product-test-sample mappings' })
  findAllMappings() {
    return this.sampleCollectionService.findAllMappings();
  }

  @Get('request/:requestId')
  @ApiOperation({ summary: 'Get sample collections and mappings by request ID' })
  findByRequestId(@Param('requestId') requestId: string) {
    return this.sampleCollectionService.findByRequestId(requestId);
  }

  @Get('mappings/request/user/:requestId')
  @ApiOperation({ summary: 'Get product test sample mappings by request ID with all relations' })
  findUserMappingsByRequestId(@Param('requestId') requestId: string, @CurrentUser() user: any) {
    return this.sampleCollectionService.findMappingsByRequestId(requestId, user.userId);
  }

  
  @Get('mappings/request/:requestId')
  @ApiOperation({ summary: 'Get product test sample mappings by request ID with all relations' })
  findMappingsByRequestId(@Param('requestId') requestId: string) {
    return this.sampleCollectionService.findMappingsByRequestId(requestId);
  }

  @Delete('samples/:id')
  @ApiOperation({ summary: 'Delete sample collection and related mappings' })
  deleteSample(@Param('id') id: string) {
    return this.sampleCollectionService.deleteSample(id);
  }

  @Patch('samples/:id')
  @ApiOperation({ summary: 'Update sample collection' })
  updateSample(
    @Param('id') id: string,
    @Body() updateDto: Partial<CreateSampleCollectionDto>
  ) {
    return this.sampleCollectionService.updateSample(id, updateDto);
  }

  @Patch('mappings/:id')
  @ApiOperation({ summary: 'Update product test sample mapping' })
  updateMapping(
    @Param('id') id: string,
    @Body() updateDto: Partial<CreateProductTestMappingDto>
  ) {
    return this.sampleCollectionService.updateMapping(id, updateDto);
  }

  @Patch('mapping/:id/assign-user')
  @ApiOperation({ summary: 'Assign user to product test sample mapping' })
  assignUserToMapping(
    @Param('id') id: string,
    @Body() updateUserMappingDto: UpdateUserMappingDto
  ) {
    return this.sampleCollectionService.assignUserToMapping(id, updateUserMappingDto);
  }

  @Delete('mappings/:id')
  @ApiOperation({ summary: 'Delete a product test sample mapping' })
  deleteMapping(@Param('id') id: string) {
    return this.sampleCollectionService.deleteMapping(id);
  }
}
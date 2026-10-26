import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../users/guards/jwt-auth.guard';
import { ObservationEntryService } from './observation-entry.service';
import { CreateObservationEntryDto } from './dto/create-observation-entry.dto';
import { UpdateAdditionalInfoDto } from './dto/update-additional-info.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@ApiTags('observation-entry')
@Controller('observation-entry')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ObservationEntryController {
  constructor(private readonly observationEntryService: ObservationEntryService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new observation entry' })
  create(@Body() createDto: CreateObservationEntryDto) {
    return this.observationEntryService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all observation entries' })
  findAll() {
    return this.observationEntryService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get observation entry by id' })
  findOne(@Param('id') id: string) {
    return this.observationEntryService.findOne(id);
  }

  @Get('mapping/:mappingId')
  @ApiOperation({ summary: 'Get observation entries by mapping ID' })
  findByMappingId(@Param('mappingId') mappingId: string) {
    return this.observationEntryService.findByMappingId(mappingId);
  }

  @Get('request/:requestId')
  @ApiOperation({ summary: 'Get observation entries by request ID' })
  findByRequestId(@Param('requestId') requestId: string) {
    return this.observationEntryService.findByRequestId(requestId);
  }

  @Get('request/user/:requestId')
  @ApiOperation({ summary: 'Get observation entries by request ID' })
  findByUserAndRequestId(@Param('requestId') requestId: string, @CurrentUser() user: any) {
    return this.observationEntryService.findByRequestId(requestId, user.userId);
  }

  @Get('find')
  @ApiOperation({ summary: 'Get observation entry by multiple IDs' })
  findByMultipleIds(
    @Query('requestId') productTestSampleMappingId: string,
    @Query('requestId') requestId: string,
  ) {
    return this.observationEntryService.findByMultipleIds(
      productTestSampleMappingId,
      requestId,
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update observation entry' })
  update(@Param('id') id: string, @Body() updateDto: Partial<CreateObservationEntryDto>) {
    return this.observationEntryService.update(id, updateDto);
  }

  @Patch('additional-info/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update observation entry additional info' })
  updateAdditionalInfo(
    @Body() updateDto: UpdateAdditionalInfoDto,
    @CurrentUser() user: any,
    @Param('id') id?: string,

  ) {
    updateDto.userId = user.userId;
    return this.observationEntryService.updateAdditionalInfo(updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete observation entry' })
  remove(@Param('id') id: string) {
    return this.observationEntryService.remove(id);
  }
}
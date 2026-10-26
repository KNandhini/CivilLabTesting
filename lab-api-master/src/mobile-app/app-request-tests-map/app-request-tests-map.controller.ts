import { Controller, Post, Body, Get, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppRequestTestsMapService } from './app-request-tests-map.service';
import { CreateAppRequestTestsMapDto } from './dto/create-app-request-tests-map.dto';
import { JwtAuthGuard } from '../../users/guards/jwt-auth.guard';

@ApiTags('mobile-app/app-request-tests-map')
@Controller('mobile-app/app-request-tests-map')
@UseGuards(JwtAuthGuard)
export class AppRequestTestsMapController {
  constructor(private readonly mappingService: AppRequestTestsMapService) {}

  @Post()
  @ApiOperation({ summary: 'Create new test mapping' })
  create(@Body() createDto: CreateAppRequestTestsMapDto) {
    return this.mappingService.create(createDto);
  }

  @Get('request/:requestId')
  @ApiOperation({ summary: 'Get all tests for a request' })
  findByRequestId(@Param('requestId') requestId: string) {
    return this.mappingService.findByRequestId(requestId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove test mapping' })
  remove(@Param('id') id: string) {
    return this.mappingService.remove(id);
  }
}
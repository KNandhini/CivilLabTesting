import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppTestsService } from './app-tests.service';
import { CreateAppTestDto } from './dto/create-app-test.dto';
import { EitherJwtAuthGuard } from '../guards/either-jwt-auth.guard';

@ApiTags('mobile-app/app-tests')
@Controller('mobile-app/app-tests')
@UseGuards(EitherJwtAuthGuard)
export class AppTestsController {
  constructor(private readonly appTestsService: AppTestsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new test' })
  create(@Body() createAppTestDto: CreateAppTestDto) {
    return this.appTestsService.create(createAppTestDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tests' })
  findAll() {
    return this.appTestsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get test by id' })
  findOne(@Param('id') id: string) {
    return this.appTestsService.findOne(id);
  }

  @Get('by-request/:requestId')
  @ApiOperation({ summary: 'Get all tests by requestId' })
  findByRequestId(@Param('requestId') requestId: string) {
    return this.appTestsService.findByRequestId(requestId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update test' })
  update(@Param('id') id: string, @Body() updateAppTestDto: Partial<CreateAppTestDto>) {
    return this.appTestsService.update(id, updateAppTestDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete test' })
  remove(@Param('id') id: string) {
    return this.appTestsService.remove(id);
  }
}
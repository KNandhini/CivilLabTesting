import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TestModuleService } from './test-module.service';
import { PerformTestDto } from './dto/perform-test.dto';

@ApiTags('tests')
@Controller('tests')
export class TestModuleController {
  constructor(private readonly testModuleService: TestModuleService) {}

  @Post('perform')
  @ApiOperation({ summary: 'Perform a new test' })
  performTest(@Body() performTestDto: PerformTestDto) {
    return this.testModuleService.performTest(performTestDto);
  }

  @Get('material/:materialId')
  @ApiOperation({ summary: 'Get available tests for a material' })
  getMaterialTests(@Param('materialId') materialId: string) {
    return this.testModuleService.getMaterialTests(materialId);
  }

  @Get('results/:materialId')
  @ApiOperation({ summary: 'Get test results for a material' })
  getTestResults(@Param('materialId') materialId: string) {
    return this.testModuleService.getTestResults(materialId);
  }
}
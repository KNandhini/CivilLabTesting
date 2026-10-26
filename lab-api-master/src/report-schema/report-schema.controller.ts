import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ReportSchemaService } from './report-schema.service';
import { CreateReportSchemaDto } from './dto/create-report-schema.dto';
import { UpdateReportSchemaDto } from './dto/update-report-schema.dto';

@Controller('report-schema')
export class ReportSchemaController {
  constructor(private readonly reportSchemaService: ReportSchemaService) {}

  @Post()
  create(@Body() createReportSchemaDto: CreateReportSchemaDto) {
    return this.reportSchemaService.create(createReportSchemaDto);
  }

  @Get()
  findAll() {
    return this.reportSchemaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reportSchemaService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReportSchemaDto: UpdateReportSchemaDto) {
    return this.reportSchemaService.update(id, updateReportSchemaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reportSchemaService.remove(id);
  }
} 
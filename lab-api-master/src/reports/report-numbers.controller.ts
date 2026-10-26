import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../users/guards/jwt-auth.guard';
import { EditableReportNumber, ReportNumbersService } from './report-numbers.service';

@Controller('report-numbers')
@UseGuards(JwtAuthGuard)
export class ReportNumbersController {
  constructor(private readonly numbers: ReportNumbersService) {}
  @Get(':requestId')
  preview(@Param('requestId') requestId: string) { return this.numbers.preview(requestId); }
  @Patch(':requestId')
  save(@Param('requestId') requestId: string, @Body() body: { reports: EditableReportNumber[] }) {
    return this.numbers.save(requestId, body.reports);
  }
}
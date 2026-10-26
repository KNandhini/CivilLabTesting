import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Res, UploadedFile, UseInterceptors, BadRequestException, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppRequestsService } from './app-requests.service';
import { CreateAppRequestDto } from './dto/create-app-request.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { EitherJwtAuthGuard } from '../guards/either-jwt-auth.guard';
import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';
import { Response } from 'express';
import { Buffer } from 'buffer';
import { FileInterceptor } from '@nestjs/platform-express';
import { SearchAppRequestDto } from './dto/search-app-request.dto';

@ApiTags('mobile-app/app-requests')
@Controller('mobile-app/app-requests')
@UseGuards(EitherJwtAuthGuard)
export class AppRequestsController {
  constructor(
    private readonly appRequestsService: AppRequestsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create new request' })
  create(@Body() createAppRequestDto: CreateAppRequestDto, @CurrentUser() user: any) {
    return this.appRequestsService.create(createAppRequestDto, user.userId);
  }

  // @Get()
  // @ApiOperation({ summary: 'Get all requests by user' })
  // findAllByUser(@CurrentUser() user: any) {
  //   return this.appRequestsService.findByUser(user.userId);
  // }

  @Get()
  @ApiOperation({ summary: 'Get all requests' })
  findAll(@Query() query: SearchAppRequestDto) {
    return this.appRequestsService.findAll(query);
  }

  // @Get(':id')
  // @ApiOperation({ summary: 'Get request by id' })
  // findOne(@Param('id') id: string, @CurrentUser() user: any) {
  //   return this.appRequestsService.findOne(id, user.userId);
  // }

  @Get('getById/:id')
  @ApiOperation({ summary: 'Get request by id' })
  getById(@Param('id') id: string, @CurrentUser() user: any) {
    return this.appRequestsService.findOne(id, user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update request' })
  update(
    @Param('id') id: string,
    @Body() updateAppRequestDto: Partial<CreateAppRequestDto>,
    @CurrentUser() user: any
  ) {
    return this.appRequestsService.update(id, updateAppRequestDto, user.userId);
  }

  @Patch('updateStatus/:id/status')
  @ApiOperation({ summary: 'Update request status by id' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.appRequestsService.updateStatus(id, status);
  }

  @Patch(':id/payment')
  @ApiOperation({ summary: 'Update payment status and reference number by request id' })
  updatePayment(
    @Param('id') id: string,
    @Body('paymentStatus') paymentStatus: string,
    @Body('paymentReferenceNo') paymentReferenceNo: string,
  ) {
    return this.appRequestsService.updatePayment(id, paymentStatus, paymentReferenceNo);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete request' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.appRequestsService.remove(id, user.userId);
  }

  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Get request statistics' })
  getRequestStats(@CurrentUser() user: any) {
    return this.appRequestsService.getRequestStats(user.userId);
  }

  @Get('dashboard/recent-activity')
  @ApiOperation({ summary: 'Get recent request activities' })
  getRecentActivity(@CurrentUser() user: any) {
    return this.appRequestsService.getRecentActivity(user.userId);
  }

  @Get('dashboard/history')
  @ApiOperation({ summary: 'Get user request history' })
  getRequestHistory(@CurrentUser() user: any) {
    return this.appRequestsService.getRequestHistory(user.userId);
  }

  @Patch(':id/report')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Update report column with buffer data' })
  async updateReport(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const bufferData = file.buffer;
    return this.appRequestsService.updateReport(id);
  }

  @Get(':id/report')
  @ApiOperation({ summary: 'Get report file for a request' })
  async getReport(
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const reportBuffer = await this.appRequestsService.getReport(id);
    if (!reportBuffer) {
      throw new NotFoundException('Report not found');
    }

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${id}-report.pdf"`,
      'Content-Length': reportBuffer.length,
    });

    res.end(reportBuffer);
  }
}
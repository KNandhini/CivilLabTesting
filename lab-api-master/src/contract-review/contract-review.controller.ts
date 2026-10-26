import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ContractReviewService } from './contract-review.service';
import { CreateContractReviewDto } from './dto/create-contract-review.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';

@ApiTags('contract-review')
@Controller('contract-review')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ContractReviewController {
  constructor(private readonly contractReviewService: ContractReviewService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new contract review' })
  @ApiResponse({ status: 201, description: 'Contract review created successfully' })
  create(
    @Body() createContractReviewDto: CreateContractReviewDto,
    @CurrentUser() user: any
  ) {
    return this.contractReviewService.create(createContractReviewDto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all contract reviews' })
  findAll() {
    return this.contractReviewService.findAll();
  }

  @Get('next-trf-number')
  @ApiOperation({ summary: 'Preview next TRF number without incrementing counter' })
  getNextTRFNumber(@Query('reportType') reportType: string = 'NABL') {
    return this.contractReviewService.peekNextTRFNumber(reportType);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a contract review by id' })
  findOne(@Param('id') id: string) {
    return this.contractReviewService.findOne(id);
  }

  @Get('request/:requestId')
  @ApiOperation({ summary: 'Get contract review by request ID' })
  @ApiResponse({ status: 200, description: 'Returns contract review for the specified request' })
  findByRequestId(@Param('requestId') requestId: string) {
    return this.contractReviewService.findByRequestId(requestId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a contract review' })
  update(@Param('id') id: string, @Body() updateData: Partial<CreateContractReviewDto>) {
    return this.contractReviewService.update(id, updateData);
  }

  @Patch('request/:requestId')
  @ApiOperation({ summary: 'Update a contract review by request ID' })
  @ApiResponse({ status: 200, description: 'Contract review updated successfully' })
  updateByRequestId(
    @Param('requestId') requestId: string,
    @Body() updateData: Partial<CreateContractReviewDto>
  ) {
    return this.contractReviewService.updateByRequestId(requestId, updateData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a contract review' })
  remove(@Param('id') id: string) {
    return this.contractReviewService.remove(id);
  }
}
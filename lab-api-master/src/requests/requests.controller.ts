import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards,UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../users/guards/jwt-auth.guard';
import { SearchRequestDto } from './dto/search-request.dto';
import { RequestStatus } from './enums/request-status.enum';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { LabTestQueryDto } from './dto/labtest-request.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
@ApiTags('requests')
@Controller('requests')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new request' })
  @ApiResponse({ status: 201, description: 'Request created successfully' })
  create(@Body() createRequestDto: CreateRequestDto, @CurrentUser() user: any) {
    return this.requestsService.create(createRequestDto,user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all requests with pagination and search' })
  findAll(@Query() searchRequestDto: SearchRequestDto) {
    return this.requestsService.findAll(searchRequestDto);
  }

  @Get('statuses') // Move this BEFORE the :id route
  @ApiOperation({ summary: 'Get all request statuses' })
  getRequestStatuses() {
    return Object.values(RequestStatus);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a request by id' })
  findOne(@Param('id') id: string) {
    return this.requestsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a request' })
  update(@Param('id') id: string, @Body() updateData: any, @CurrentUser() user: any) {
    return this.requestsService.update(id, updateData, user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a request' })
  remove(@Param('id') id: string) {
    return this.requestsService.remove(id);
  }

  @Get('getRequestsByLabUser/:id')
  @ApiOperation({ summary: 'Get requests assigned to lab user' })
  getRequestsByLabUser(@Query() query: LabTestQueryDto, @CurrentUser() user: any) {
    return this.requestsService.getRequestsByLabUser(user.userId, query);
  }
   @Post('upload-pdf')
    @UseInterceptors(FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/pdfs', // Ensure this folder exists
        filename: (req, file, cb) => {
          // Use requestId from body to name the file
          const requestId = req.body.requestId;
          cb(null, `contract_${requestId}.pdf`);
        }
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
          cb(null, true);
        } else {
          cb(new Error('Only PDF files are allowed'), false);
        }
      }
    }))
    async uploadPdf(@UploadedFile() file: Express.Multer.File, @Body('requestId') requestId: string) {
      // Optionally, save file info to DB using requestsService if needed
      // The file will be replaced automatically if a new one is uploaded for the same contract
      return { message: 'Report uploaded successfully', filePath: file.path, requestId };
    }
}

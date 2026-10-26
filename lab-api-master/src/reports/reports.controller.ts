import { Controller, Get, Post, Body, Query, Res, Param } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { generateReport } from './generate-report';
import { ProductsService } from 'src/products/products.service';
import { RequestsService } from 'src/requests/requests.service';
import { AppRequestsService } from 'src/mobile-app/app-requests/app-requests.service';
import { SystemSettingsService } from 'src/system-settings/system-settings.service';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService,
    private readonly productService: ProductsService,
    private readonly requestSerive: RequestsService,
    private readonly appRequestService: AppRequestsService,
    private readonly systemSettingsService: SystemSettingsService
  ) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get summary report' })
  @ApiResponse({ status: 200, description: 'Returns the summary report' })
  async getSummaryReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.generateSummaryReport(startDate, endDate);
  }

  @Get('detailed')
  @ApiOperation({ summary: 'Get detailed report' })
  @ApiResponse({ status: 200, description: 'Returns the detailed report' })
  async getDetailedReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('type') type: string,
  ) {
    return this.reportsService.generateDetailedReport(startDate, endDate, type);
  }

  @Post('custom')
  @ApiOperation({ summary: 'Generate custom report' })
  @ApiResponse({ status: 201, description: 'Returns the custom report' })
  async generateCustomReport(@Body() reportConfig: any) {
    return this.reportsService.generateCustomReport(reportConfig);
  }

  @Get('test-request-form')
  async downloadTestRequestForm(@Res() res: Response) {
    const mockData = {
      trfNo: '013',
      date: '7.1.2025',
      customerName: 'M/s: K.G. Trader',
      address: 'No:328, Omalur main road, Managaram Bus stop, Salem-636302.',
      contactPerson: 'Karuppannan',
      phone: '94433 38048',
      customerLetterNoDate: '7.1.2025',
      workName: 'Balaji Texs Elampillai',
      location: "Column Concrete", // as mentioned by addressee
      dateOfCasting: '09.12.2024',
      conformityRequired: true,
      deviationFromTestMethods: false,
      isMethodInappropriate: 'NA',
      witnessRequest: false,
      testRequest: '',
      modeOfDelivery: 'In Person',
      simplifiedWay: true,
      addressedToOtherOrg: false,
      gradeOfConcrete: 'M35',
    };
    //TestRequestForm(mockData, res);
  }

  @Get('test-report/:requestId')
  @ApiOperation({ summary: 'Open only the Test Report pages from a QR code' })
  async openTestReport(
    @Param('requestId') requestId: string,
    @Res() res: Response
  ) {
    // Generate from report data so an uploaded full contract PDF is never returned.
    const formData = await this.reportsService.generateTestRequestFormByRequestId(requestId);
    res.setHeader('Cache-Control', 'no-store');
    await generateReport(
      formData as any, res, this.productService, this.requestSerive,
      this.appRequestService, true, '', this.systemSettingsService, true
    );
  }
  @Get('test-request-form-by-request')
  async downloadTestRequestFormByRequestId(
    @Query('requestId') requestId: string,
    @Query('mobileRequest') mobileRequest:boolean,
    @Res() res: Response
  ) {
    if(mobileRequest){
      try{
      const requestByApp = await this.reportsService.getApprequest(requestId);
      requestId = requestByApp.id;
      }
      catch(error){
        console.log(error);
      }
    }
    const filePath = join(process.cwd(), 'uploads', 'pdfs', `contract_${requestId}.pdf`);
    if (existsSync(filePath)) {
      // If uploaded PDF exists, return it directly
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="contract_${requestId}.pdf"`);
      const fileStream = createReadStream(filePath);
      fileStream.pipe(res);
      return;
    }

    const referrer = Array.isArray(res.req?.headers?.referer) ? res.req.headers.referer[0] :
                    Array.isArray(res.req?.headers?.referrer) ? res.req.headers.referrer[0] :
                    (res.req?.headers?.referer || res.req?.headers?.referrer || '');
    try {
      const formData = await this.reportsService.generateTestRequestFormByRequestId(requestId);
      await generateReport(formData as any, res, this.productService, this.requestSerive, this.appRequestService, mobileRequest, referrer, this.systemSettingsService);
    } catch (error: any) {
      console.error('[ReportsController] Error generating report:', error?.message || error, error?.stack);
      if (!res.headersSent) {
        res.status(500).json({ message: error?.message || 'Failed to generate report', stack: error?.stack });
      }
    }
  }


  
@Get('mobile/test-request-form/:requestId')
@ApiOperation({ summary: 'Mobile-optimized endpoint for downloading test request form' })
@ApiResponse({ status: 200, description: 'Returns the test request form PDF optimized for mobile download' })
async downloadTestRequestFormMobile(
  @Param('requestId') requestId: string,
  @Res() res: Response
) {
  const filePath = join(process.cwd(), 'uploads', 'pdfs', `contract_${requestId}.pdf`);
  if (existsSync(filePath)) {
    // If uploaded PDF exists, return it for download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="contract_${requestId}.pdf"`);
    const fileStream = createReadStream(filePath);
    fileStream.pipe(res);
    return;
  }
  // If not, generate and return the system report optimized for mobile download
  const referrer = Array.isArray(res.req?.headers?.referer) ? res.req.headers.referer[0] : 
                  Array.isArray(res.req?.headers?.referrer) ? res.req.headers.referrer[0] :
                  (res.req?.headers?.referer || res.req?.headers?.referrer || '');
  const formData = await this.reportsService.generateTestRequestFormByRequestId(requestId);
  
  // Detect mobile user agent for additional optimizations
  const userAgent = res.req?.headers['user-agent'] || '';
  const isMobile = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
  // Set mobile-optimized headers for automatic download
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="test-request-form.pdf"');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  // Add mobile-specific headers for better compatibility
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Additional headers for mobile devices
  if (isMobile) {
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Connection', 'keep-alive');
  }
  
  await generateReport(formData as any, res, this.productService, this.requestSerive, this.appRequestService, true, referrer, this.systemSettingsService);
}
}

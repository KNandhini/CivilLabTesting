import { ReportNumbersService } from './report-numbers.service';
import { Injectable } from '@nestjs/common';
import { RequestsService } from '../requests/requests.service';
import { SampleCollectionService } from '../sample-collection/sample-collection.service';
import { ObservationEntryService } from '../observation-entry/observation-entry.service';
import { SystemSettingsService } from '../system-settings/system-settings.service';
import configuration from '../configuration.json';
import { SystemSettings } from 'src/system-settings/entities/system-settings.entity';
import { SystemSettingsDataDto } from 'src/system-settings/dto/system-settings.dto';
import { ReportSchemaService } from '../report-schema/report-schema.service';
import { ProductsService } from 'src/products/products.service';

// Helper function to format dates as dd/mm/yyyy
function formatDateDMY(dateStr?: string | Date): string {
  if (!dateStr) return '';
  const str = String(dateStr).trim();
  // Pure date "YYYY-MM-DD" — extract directly, no timezone shift needed
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const [yyyy, mm, dd] = str.split('-');
    return `${dd}.${mm}.${yyyy}`;
  }
  const date = new Date(str);
  if (isNaN(date.getTime())) return '';
  // Convert to IST (UTC+5:30) so timestamps stored in UTC show the correct Indian date
  const istDate = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
  const day = String(istDate.getUTCDate()).padStart(2, '0');
  const month = String(istDate.getUTCMonth() + 1).padStart(2, '0');
  const year = istDate.getUTCFullYear();
  return `${day}.${month}.${year}`;
}

@Injectable()
export class ReportsService {
  constructor(private readonly reportNumbers: ReportNumbersService, 
    private readonly requestsService: RequestsService,
    private readonly sampleCollectionService: SampleCollectionService,
    private readonly observationEntryService: ObservationEntryService,
    private readonly systemSettingsService: SystemSettingsService,
    private readonly reportSchemaService: ReportSchemaService,
    private readonly productService: ProductsService
  ) {}

  async generateSummaryReport(startDate: string, endDate: string) {
    // TODO: Implement summary report generation
    return {
      startDate,
      endDate,
      totalTests: 0,
      completedTests: 0,
      pendingTests: 0,
      revenue: 0,
    };
  }

  async generateDetailedReport(startDate: string, endDate: string, type: string) {
    // TODO: Implement detailed report generation
    return {
      startDate,
      endDate,
      type,
      details: [],
    };
  }

  async generateCustomReport(reportConfig: any) {
    // TODO: Implement custom report generation
    return {
      config: reportConfig,
      data: [],
    };
  }

  async generateTestRequestFormByRequestId(requestId: string) {
    let request = await this.requestsService.findOne(requestId);

    if (!request) {
      // Try to find request by appRequestId
      const requestByAppId = await this.requestsService['requestRepository']
        .findOne({ where: { appRequestId: requestId },
          relations: ['createdUser', 'modifiedUser', 'contractReview'] })
      
      if (!requestByAppId) {
        throw new Error('Request not found');
      }
      request = requestByAppId;
      requestId = request.id;
    }

    const products = await this.productService.findAll()

    // // Ensure reportNo is set
    // if (!request.reportNo) {
    //   // Get the last request with a reportNo
    //   const lastRequest = await this.requestsService['requestRepository']
    //     .createQueryBuilder('request')
    //     .where('request.reportNo IS NOT NULL')
    //     .orderBy('request.reportNo', 'DESC')
    //     .getOne();
    //   let nextNumber = 1;
    //   if (lastRequest && lastRequest.reportNo) {
    //     // Extract the numeric part from the last reportNo
    //     const match = lastRequest.reportNo.match(/(\d{5})$/);
    //     if (match) {
    //       nextNumber = parseInt(match[1], 10) + 1;
    //     }
    //   }
    //   const prefix = configuration.numberPrefixes.testReport;
    //   const paddedNumber = String(nextNumber).padStart(5, '0');
    //   const newReportNo = `${prefix}${paddedNumber}`;
    //   // Update the request with the new reportNo
    //   await this.requestsService.update(requestId, { reportNo: newReportNo }, request.createdUserId || '');
    //   request.reportNo = newReportNo;
    // await this.requestsService['requestRepository'].save(request);
    // }

    // Get sample collection data
    const mappings = await this.sampleCollectionService.findByRequestId(requestId);
    
    // Get observation entries
    const observationEntries = await this.observationEntryService.findByRequestId(requestId);

    // Get system settings
    const systemSettings = await this.systemSettingsService.getSettings();
    const settings:SystemSettingsDataDto = systemSettings.data

    const numbered = await this.reportNumbers.ensure(requestId);
    request.reportNo = numbered.reports;
    // Get all report schemas
    const reportSchemas = await this.reportSchemaService.findAll();

    // Prepare the data for TestRequestForm
    const contract = request.contractReview || {};
    const contractData = {
      trfNo: request.formId || '',
      date: request.createdDate ? formatDateDMY(request.createdDate) : '',
      customerName: contract.customerName || '',
      address: contract.address || '',
      contactPerson: contract.contactPerson || '',
      phone: contract.mobileNo || '',
      customerLetterNoDate: [contract.customerLetterNo?.trim(), contract.customerLetterDate ? formatDateDMY(contract.customerLetterDate) : ''].filter(Boolean).join(' - '),
      workName: contract.nameOfWork || '',
      location: contract.location || '',
      conformityRequired: contract.isStatementOfConformityRequired === 'Yes',
      deviationFromTestMethods: contract.deviationFromTestMethods === 'Yes',
      isMethodInappropriate: contract.isMethodInappropriate || '',
      witnessRequest: contract.witnessRequest === 'Yes',
      testRequest: contract.miscellaneous || '',
      modeOfDelivery: contract.modeOfDelivery || '',
      simplifiedWay: contract.isSimplifiedReport === 'Yes',
      addressedToOtherOrg: contract.isOtherOrgAddress === 'Yes',
      otherOrgDetails: contract.otherOrgDetails || '',
      dateOfCastingAndGradeOfConcrete: contract.dateOfCastingAndGradeOfConcrete || '',
      decisionRule: contract.decisionRule ||'',
      witnessName: contract.witnessName || '',
      witnessDesignation: contract.witnessDesignation || '',
      witnessDetails: contract.witnessDetails || '',
      witnessEmailId: contract.witnessEmailId || '',
      witnessContactNo: contract.witnessContactNo || '',
      revisionNo: contract.revisionNo || '',
      revisionDate: contract.revisionDate ? formatDateDMY(contract.revisionDate) : '',
      issueNo: contract.issueNo || '',
      issueDate: contract.issueDate ? formatDateDMY(contract.issueDate) : '',
      email: contract.emailId || '',
      TOCR: contract.TOCRNo || '',
      TRFNo: contract.TRFNo || '',
      reportNo: request.reportNo,
      createdDate: request.createdDate ? formatDateDMY(request.createdDate) : '',
      sizeOfMetal: contract.sizeOfMetal || '',
      shapeOfBlock: contract.shapeOfBlock || '',
      source: contract.source || '',
      sampleReceivedBy: contract.sampleReceivedBy || '',
      sampleCondition: contract.sampleCondition || '',
      remarks: contract.remarks || '',
      resourcesAvailable: contract.resourcesAvailable,
      testMethodVerified: contract.testMethodVerified,
      pertinentDiscussion: contract.pertinentDiscussion,
      sampleEfficiency: contract.sampleEfficiency,
      sampleConditionReceived: contract.sampleConditionReceived,
      brandName: contract.brandName,
      environmentCondition: contract.environmentCondition,
      humidity: contract.humidity
        ? contract.humidity.includes('%')
          ? contract.humidity
          : `${contract.humidity}%`
        : '',
      requestId,
      appRequestId: request.appRequestId,
      products,
      temperature: contract.temperature
        ? contract.temperature.includes('°C')
          ? contract.temperature
          : `${contract.temperature}°C`
        : '',
      detailsOfMachine:contract.detailsOfMachine,
      dateOfCalibration:contract.dateOfCalibration ? formatDateDMY(contract.dateOfCalibration) : '',
      loadingRange:contract.loadingRange,
      curingCondition:contract.curingCondition,
      sampleReceivedDate:contract.sampleReceivedDate ? formatDateDMY(contract.sampleReceivedDate) : '',
      reportType:contract.reportType,
      authorisedSignatory:contract.authorisedSignatory

    };

    return {
      contractData,
      mappings: {
        samples: mappings.samples,
        mappings: mappings.mappings
      },
      observationEntries,
      systemSettings:settings,
      reportSchemas // Attach all report schemas to the response
    };
  }

  async getApprequest(requestId:string){
    const requestByApp = await this.requestsService['requestRepository']
        .findOne({ where: { appRequestId: requestId },
          relations: ['createdUser', 'modifiedUser', 'contractReview'] })
      
      if (!requestByApp) {
        throw new Error('Request not found');
      }

      return requestByApp;
  }
} 
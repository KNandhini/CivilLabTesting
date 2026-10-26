import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from '../requests/entities/request.entity';
import { Product } from '../products/entities/product.entity';
import { ProductTestSampleMapping } from '../sample-collection/entities/product-test-sample-mapping.entity';
import { ReportSchema } from '../report-schema/entities/report-schema.entity';
import { SystemSettings } from '../system-settings/entities/system-settings.entity';
import { reportItem } from '../requests/dto/types';

export interface EditableReportNumber extends reportItem { name?: string; }

@Injectable()
export class ReportNumbersService {
  constructor(@InjectRepository(Request) private readonly requests: Repository<Request>) {}

  preview(requestId: string) { return this.run(requestId, false); }
  ensure(requestId: string) { return this.run(requestId, true); }
  save(requestId: string, reports: EditableReportNumber[]) {
    if (!Array.isArray(reports)) throw new BadRequestException('Report numbers are required');
    return this.run(requestId, true, reports);
  }

  private async run(requestId: string, persist: boolean, submitted?: EditableReportNumber[]) {
    return this.requests.manager.transaction(async manager => {
      // Share one lock with every number-saving path, including PDF generation.
      await manager.query('SELECT pg_advisory_xact_lock($1)', [73124002]);
      const repository = manager.getRepository(Request);
      const request = await repository.findOne({ where: [{ id: requestId }, { appRequestId: requestId }], relations: ['contractReview'] });
      if (!request) throw new NotFoundException('Request not found');
      const isNabl = request.contractReview?.reportType === 'NABL';
      const settingsRepo = manager.getRepository(SystemSettings);
      let settings = await settingsRepo.findOne({ where: {} });
      if (!settings) settings = settingsRepo.create({ id: 'default', data: {}, ulrNo: 0 });
      const products = await manager.getRepository(Product).find();
      const mappings = await manager.getRepository(ProductTestSampleMapping).find({ where: { requestId: request.id } });
      const schemas = await manager.getRepository(ReportSchema).find();
      // Older Observation Table schemas can use obs-1 while row values use 1
      // (or vice versa). Match either representation instead of hiding fields.
      const rowMatchesTest = (table: any, testId: string) =>
        Array.isArray(table?.rows) && table.rows.some(row => {
          const values = row.values || {};
          const columnId = table.columns?.[0]?.id;
          return (values[columnId] ?? values['1'] ?? values['obs-1']) === testId;
        });
      const definitions = schemas.filter(schema => {
        const config: any = schema.TestReportSchema;
        if (!config) return false;
        if (request.reportNo?.some(item => item.reportSchemaId === schema.id)) return true;
        return [config.TestReportSchema, config.ObservationEntrySchema].some(table =>
          mappings.some(mapping => (!config.productId || config.productId === mapping.productId) && rowMatchesTest(table, mapping.testId)));
      }).map(schema => {
        const config: any = schema.TestReportSchema;
        const product = products.find(product => product.id === config.productId) || products.find(product => mappings.some(mapping =>
          mapping.productId === product.id && [config.TestReportSchema, config.ObservationEntrySchema].some(table => rowMatchesTest(table, mapping.testId))));
        return { id: schema.id, name: config.name || product?.name || 'Test Report', product };
      });      const previous = request.reportNo || [];
      const allRequests = await repository.find({ select: { id: true, reportNo: true } });
      const normalize = (value: string) => value.trim().toLowerCase();
      const external = allRequests.filter(other => other.id !== request.id).flatMap(other => other.reportNo || []);
      const usedReport = new Set([...external, ...previous].map(item => normalize(item.reportNo || '')).filter(Boolean));
      const usedUlr = new Set([...external, ...previous].map(item => normalize(item.ulrno || '')).filter(Boolean));
      const errors: Record<string, string> = {};
      const submittedIds = new Set<string>();
      for (const item of submitted || []) {
        if (!item || typeof item.reportSchemaId !== 'string' || submittedIds.has(item.reportSchemaId) || !definitions.some(def => def.id === item.reportSchemaId)) {
          throw new BadRequestException('Invalid or duplicate report schema');
        }
        submittedIds.add(item.reportSchemaId);
      }
      const reports: EditableReportNumber[] = [];
      let ulrCounter = Number(settings.ulrNo) || 0;
      const year = new Date().getFullYear();
      const prefix = String(settings.data?.numberPrefixes?.testReport || 'TPT/CCTC/Test').replace(/\/$/, '');
      const ulrPrefix = settings.data?.numberPrefixes?.ulr || 'TC11613';
      for (const definition of definitions) {
        const existing = previous.find(item => item.reportSchemaId === definition.id);
        const input = submitted?.find(item => item.reportSchemaId === definition.id);
        let reportNo = input ? (typeof input.reportNo === 'string' ? input.reportNo.trim() : '') : existing?.reportNo?.trim() || '';
        let ulrno = isNabl ? (input ? (typeof input.ulrno === 'string' ? input.ulrno.trim() : '') : existing?.ulrno?.trim() || '') : '';
        const product = definition.product;
        const counterField = isNabl ? 'reportNo' : 'reportNoNonNabl';
        let counter = Number(product?.[counterField]) || 0;
        if (!input && !reportNo) {
          do { counter++; reportNo = `${prefix}/${product?.productShortForm || 'TEST'}/${String(counter).padStart(3, '0')}`; }
          while (usedReport.has(normalize(reportNo)));
        }
        if (isNabl && !input && !ulrno) {
          do { ulrCounter++; ulrno = `${ulrPrefix}${year}${String(ulrCounter).padStart(9, '0')}F`; }
          while (usedUlr.has(normalize(ulrno)));
        }
        for (const [field, value] of [['reportNo', reportNo], ['ulrno', ulrno]] as const) {
          if (field === 'ulrno' && !isNabl) continue;
          const key = `${definition.id}.${field}`;
          if (!value) errors[key] = 'This field is required';
          else if (external.some(item => normalize(item[field] || '') === normalize(value)) || previous.some(item => item.reportSchemaId !== definition.id && !definitions.some(def => def.id === item.reportSchemaId) && normalize(item[field] || '') === normalize(value)) || reports.some(item => normalize(item[field] || '') === normalize(value))) {
            errors[key] = 'This no already exists. Please give another no.';
          }
        }
        reports.push({ reportSchemaId: definition.id, name: definition.name, reportNo, ulrno });
        usedReport.add(normalize(reportNo));
        if (ulrno) usedUlr.add(normalize(ulrno));
        if (product) {
          const suffix = Number(reportNo.startsWith(`${prefix}/${product.productShortForm}/`) ? reportNo.split('/').pop() : NaN);
          product[counterField] = Math.max(counter, Number.isSafeInteger(suffix) ? suffix : 0);
        }
      }
      if (submitted && Object.keys(errors).length) throw new ConflictException({ message: 'Please correct the report numbers.', errors });
      if (persist) {
        // Retain saved numbers for report schemas no longer present in the current mapping.
        const values = [...previous.filter(item => !reports.some(report => report.reportSchemaId === item.reportSchemaId)),
          ...reports.map(({ reportSchemaId, reportNo, ulrno }) => ({ reportSchemaId, reportNo, ulrno }))];
        await repository.update(request.id, { reportNo: values });
        for (const product of products.filter(product => definitions.some(def => def.product?.id === product.id))) {
          await manager.getRepository(Product).update(product.id, isNabl ? { reportNo: product.reportNo } : { reportNoNonNabl: product.reportNoNonNabl });
        }
        settings.ulrNo = ulrCounter;
        await settingsRepo.save(settings);
      }
      return { isNabl, reports };
    });
  }
}
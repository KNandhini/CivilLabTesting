import { ConflictException } from '@nestjs/common';
import { ReportNumbersService } from './report-numbers.service';

jest.mock('../requests/entities/request.entity', () => ({ Request: class Request {} }));
jest.mock('../products/entities/product.entity', () => ({ Product: class Product {} }));
jest.mock('../sample-collection/entities/product-test-sample-mapping.entity', () => ({ ProductTestSampleMapping: class ProductTestSampleMapping {} }));
jest.mock('../report-schema/entities/report-schema.entity', () => ({ ReportSchema: class ReportSchema {} }));
jest.mock('../system-settings/entities/system-settings.entity', () => ({ SystemSettings: class SystemSettings {} }));

describe('Editable Test Report and ULR numbers', () => {
  let service: ReportNumbersService;
  let request: any;
  let other: any;
  let schemas: any[];
  let requests: any;
  let products: any;
  let settings: any;
  let manager: any;
  const schema = (id = 'schema-1') => ({ id, TestReportSchema: {
    name: `Concrete ${id}`, productId: 'product-1', TestReportSchema: {
      columns: [{ id: 'test' }, { id: 'testSchema' }],
      rows: [{ values: { test: 'test-1', testSchema: 'test-schema-1' } }],
    },
  } });
  beforeEach(() => {
    request = { id: 'request-1', reportNo: null, contractReview: { reportType: 'NABL' } };
    other = { id: 'request-2', reportNo: [] };
    schemas = [schema()];
    requests = {
      findOne: jest.fn(async () => request),
      find: jest.fn(async () => [request, other]),
      update: jest.fn(async (_id, data) => Object.assign(request, data)),
    };
    products = { find: jest.fn(async () => [{ id: 'product-1', productShortForm: 'CC', reportNo: 4, reportNoNonNabl: 8 }]), update: jest.fn() };
    settings = {
      findOne: jest.fn(async () => ({ id: 'default', data: { numberPrefixes: { testReport: 'TPT/CCTC/Test/', ulr: 'TC11613' } }, ulrNo: 10 })),
      save: jest.fn(), create: jest.fn(data => data),
    };
    const repositories: any = { Request: requests, Product: products, SystemSettings: settings,
      ProductTestSampleMapping: { find: async () => [{ requestId: 'request-1', productId: 'product-1', testId: 'test-1' }] },
      ReportSchema: { find: async () => schemas },
    };
    manager = { query: jest.fn(), getRepository: entity => repositories[entity.name], transaction: async callback => callback(manager) };
    requests.manager = manager;
    service = new ReportNumbersService(requests);
  });
  const values = (reportNo = 'CUSTOM/REPORT/42', ulrno = 'CUSTOM-ULR-42') => [{ reportSchemaId: 'schema-1', reportNo, ulrno }];
  it('prefills numbers without saving or consuming counters', async () => {
    const result = await service.preview('request-1');
    expect(result.isNabl).toBe(true);
    expect(result.reports[0].reportNo).toBe('TPT/CCTC/Test/CC/005');
    expect(result.reports[0].ulrno).toMatch(/^TC11613\d{4}000000011F$/);
    expect(requests.update).not.toHaveBeenCalled();
    expect(products.update).not.toHaveBeenCalled();
    expect(settings.save).not.toHaveBeenCalled();
  });
  it('saves edits and reuses them when generating a PDF', async () => {
    await service.save('request-1', values(' CUSTOM/REPORT/42 ', ' CUSTOM-ULR-42 '));
    const result = await service.ensure('request-1');
    expect(result.reports[0]).toMatchObject({ reportNo: 'CUSTOM/REPORT/42', ulrno: 'CUSTOM-ULR-42' });
  });
  it('does not allocate or store a ULR for NON-NABL contracts', async () => {
    request.contractReview.reportType = 'NON-NABL';
    const result = await service.preview('request-1');
    expect(result.isNabl).toBe(false);
    expect(result.reports[0]).toMatchObject({ reportNo: 'TPT/CCTC/Test/CC/009', ulrno: '' });
    await service.save('request-1', values());
    expect(request.reportNo[0].ulrno).toBe('');
  });
  it.each(['reportNo', 'ulrno'])('rejects duplicate %s with an inline field error', async field => {
    other.reportNo = [{ ...values()[0], [field]: field === 'reportNo' ? 'custom/report/42' : 'custom-ulr-42' }];
    const error = await service.save('request-1', values()).catch(error => error);
    expect(error).toBeInstanceOf(ConflictException);
    expect(error.getResponse().errors[`schema-1.${field}`]).toBe('This no already exists. Please give another no.');
    expect(requests.update).not.toHaveBeenCalled();
  });
  it('allows saving the same numbers on the same report schema', async () => {
    request.reportNo = values();
    await expect(service.save('request-1', values())).resolves.toMatchObject({ reports: values().map(value => ({ ...value, name: 'Concrete schema-1' })) });
  });
  it('generates distinct sequential defaults for multiple schemas', async () => {
    schemas.push(schema('schema-2'));
    const result = await service.ensure('request-1');
    expect(result.reports.map(item => item.reportNo)).toEqual(['TPT/CCTC/Test/CC/005', 'TPT/CCTC/Test/CC/006']);
    expect(new Set(result.reports.map(item => item.ulrno)).size).toBe(2);
  });
  it('preserves old numbers when a new report schema is added', async () => {
    request.reportNo = values();
    schemas.push(schema('schema-2'));
    await service.ensure('request-1');
    expect(request.reportNo).toHaveLength(2);
    expect(request.reportNo[0]).toEqual(values()[0]);
  });
  it('rejects duplicate numbers between schemas in the same request', async () => {
    schemas.push(schema('schema-2'));
    await expect(service.save('request-1', [...values(), { ...values()[0], reportSchemaId: 'schema-2' }])).rejects.toBeInstanceOf(ConflictException);
  });
  it('skips default numbers already used by another request', async () => {
    other.reportNo = [{ reportSchemaId: 'other', reportNo: 'TPT/CCTC/Test/CC/005', ulrno: `TC11613${new Date().getFullYear()}000000011F` }];
    const result = await service.preview('request-1');
    expect(result.reports[0].reportNo).toBe('TPT/CCTC/Test/CC/006');
    expect(result.reports[0].ulrno).toMatch(/000000012F$/);
  });
  it('shows numbers for legacy Observation Table column IDs', async () => {
    schemas = [{ id: 'schema-1', TestReportSchema: { productId: 'product-1', ObservationEntrySchema: {
      columns: [{ id: 'obs-1' }, { id: 'obs-2' }], rows: [{ values: { '1': 'test-1', '2': 'test-schema-1' } }]
    } } }];
    const result = await service.preview('request-1');
    expect(result.reports).toHaveLength(1);
    expect(result.reports[0].reportSchemaId).toBe('schema-1');
  });
  it('still displays saved numbers when the report schema mapping has changed', async () => {
    request.reportNo = values();
    schemas[0].TestReportSchema.TestReportSchema.rows = [];
    const result = await service.preview('request-1');
    expect(result.reports[0]).toMatchObject(values()[0]);
  });  it('rejects empty required numbers', async () => {
    await expect(service.save('request-1', values('', ''))).rejects.toBeInstanceOf(ConflictException);
  });
});
import { ConflictException } from '@nestjs/common';
import { ContractReviewService } from './contract-review.service';

jest.mock('./entities/contract-review.entity', () => ({ ContractReview: class ContractReview {} }));
jest.mock('../requests/requests.service', () => ({ RequestsService: class RequestsService {} }));
jest.mock('../system-settings/system-settings.service', () => ({ SystemSettingsService: class SystemSettingsService {} }));

describe('Editable contract numbers', () => {
  let service: ContractReviewService;
  let records: any[];
  let repository: any;
  let manager: any;
  let requests: any;
  let settings: any;
  beforeEach(() => {
    records = [];
    const matches = (record: any, where: any) => Object.entries(where).every(([key, value]: [string, any]) => {
      if (value?.type === 'raw') return String(record[key] || '').trim().toLowerCase() === value.objectLiteralParameters.number.toLowerCase();
      if (value?.type === 'not') return record[key] !== value.value;
      return record[key] === value;
    });
    repository = {
      findOne: jest.fn(async ({ where }: any) => records.find(record => (Array.isArray(where) ? where : [where]).some(condition => matches(record, condition))) || null),
      create: jest.fn(data => data),
      save: jest.fn(async data => { const saved = { id: 'new-contract', ...data }; records.push(saved); return saved; }),
      update: jest.fn(async (id, data) => Object.assign(records.find(record => record.id === id), data)),
    };
    manager = { query: jest.fn().mockResolvedValue([]), getRepository: () => repository,
      transaction: jest.fn(async callback => callback(manager)) };
    repository.manager = manager;
    requests = { create: jest.fn().mockResolvedValue({ id: 'request-1' }) };
    settings = { getTrfNo: jest.fn().mockResolvedValue(0), updateTrfNo: jest.fn().mockResolvedValue({}) };
    service = new ContractReviewService(repository, requests, settings);
  });
  const dto = (values = {}) => ({ customerName: 'Customer', ...values } as any);
  it('preserves custom numbers and trims surrounding spaces', async () => {
    const result = await service.create(dto({ TRFNo: ' CUSTOM/TRF-42 ', TOCRNo: ' ORDER-42 ' }), 'user');
    expect(result).toMatchObject({ TRFNo: 'CUSTOM/TRF-42', TOCRNo: 'ORDER-42' });
    expect(manager.query).toHaveBeenCalledWith('SELECT pg_advisory_xact_lock($1)', [73124001]);
  });
  it('supplies defaults when no custom numbers were provided', async () => {
    const result = await service.create(dto(), 'user');
    expect(result.TRFNo).toMatch(/\/TRF-001$/);
    expect(result.TOCRNo).toBe('001');
  });
  it.each(['TRFNo', 'TOCRNo'])('rejects a duplicate %s with an inline field error before creating a request', async field => {
    records.push({ id: 'other', [field]: 'Taken-No' });
    const error = await service.create(dto({ [field]: ' taken-no ' }), 'user').catch(e => e);
    expect(error).toBeInstanceOf(ConflictException);
    expect(error.getResponse().errors[field]).toBe('This no already exists. Please give another no.');
    expect(requests.create).not.toHaveBeenCalled();
    expect(repository.save).not.toHaveBeenCalled();
  });
  it('allows the same contract to retain its numbers', async () => {
    records.push({ id: 'own', requestId: 'r1', TRFNo: 'TRF-42', TOCRNo: '42' });
    const result = await service.updateByRequestId('r1', { TRFNo: 'TRF-42', TOCRNo: '42' });
    expect(result).toMatchObject({ TRFNo: 'TRF-42', TOCRNo: '42' });
  });
  it('rejects changing TOCR to a number used by another contract', async () => {
    records.push({ id: 'own', requestId: 'r1', TRFNo: 'TRF-42', TOCRNo: '42' }, { id: 'other', TOCRNo: '43' });
    await expect(service.updateByRequestId('r1', { TOCRNo: '43' })).rejects.toBeInstanceOf(ConflictException);
    expect(repository.update).not.toHaveBeenCalled();
  });
  it('also checks duplicates through the update-by-contract-ID endpoint', async () => {
    records.push({ id: 'own', TRFNo: 'TRF-42' }, { id: 'other', TRFNo: 'TRF-43' });
    await expect(service.update('own', { TRFNo: 'TRF-43' })).rejects.toBeInstanceOf(ConflictException);
  });
  it('saves an edited TOCR without changing the TRF number', async () => {
    records.push({ id: 'own', requestId: 'r1', TRFNo: 'TRF-42', TOCRNo: '42' });
    const result = await service.updateByRequestId('r1', { TOCRNo: 'CUSTOM-99' });
    expect(result).toMatchObject({ TRFNo: 'TRF-42', TOCRNo: 'CUSTOM-99' });
  });
  it('skips already-used TOCR numbers when suggesting defaults', async () => {
    records.push({ id: 'old', TOCRNo: '001' });
    expect(await service.peekNextTRFNumber('NABL')).toMatch(/\/TRF-002$/);
    expect(settings.updateTrfNo).not.toHaveBeenCalled();
  });
});
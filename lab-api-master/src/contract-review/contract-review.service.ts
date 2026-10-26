import { Injectable, BadRequestException, NotFoundException, ConflictException, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, Raw } from 'typeorm';
import { ContractReview } from './entities/contract-review.entity';
import { CreateContractReviewDto } from './dto/create-contract-review.dto';
import { RequestsService } from '../requests/requests.service';
import { RequestStatus } from '../requests/enums/request-status.enum';
import { SystemSettingsService } from '../system-settings/system-settings.service';

@Injectable()
export class ContractReviewService {
  constructor(
    @InjectRepository(ContractReview)
    private contractReviewRepository: Repository<ContractReview>,
    private readonly requestsService: RequestsService,
    private readonly systemSettingsService: SystemSettingsService,
  ) {}

  async create(createContractReviewDto: CreateContractReviewDto, userId: string) {
    try {
      return await this.contractReviewRepository.manager.transaction(async manager => {
        // Serialize contract-number checks and writes across create/update requests.
        await manager.query('SELECT pg_advisory_xact_lock($1)', [73124001]);
        const repository = manager.getRepository(ContractReview);
        const reportType = createContractReviewDto.reportType || 'NABL';
        const generated = await this.nextAvailableNumbers(reportType, repository);
        const numbers = {
          TRFNo: createContractReviewDto.TRFNo?.trim() || generated.TRFNo,
          TOCRNo: createContractReviewDto.TOCRNo?.trim() || generated.TOCRNo,
        };
        await this.validateNumbers(repository, numbers);
        const request = await this.requestsService.create(
          { prefix: 'TPT/NABL/F7', appRequestId: createContractReviewDto.appRequestId }, userId
        );
        const contract = repository.create({ ...createContractReviewDto, ...numbers, requestId: request.id });
        const saved = await repository.save(contract);
        const prefix = this.buildTRFPrefix(reportType);
        const sequence = numbers.TRFNo.startsWith(prefix) ? Number(numbers.TRFNo.slice(prefix.length)) : NaN;
        const current = await this.systemSettingsService.getTrfNo(reportType);
        await this.systemSettingsService.updateTrfNo(reportType,
          Math.max(current, generated.sequence, Number.isInteger(sequence) ? sequence : 0));
        return saved;
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new BadRequestException(`Failed to create contract review: ${error.message}`);
    }
  }

  private async validateNumbers(repository: Repository<ContractReview>, data: Partial<CreateContractReviewDto>, id?: string) {
    const errors: Record<string, string> = {};
    for (const field of ['TRFNo', 'TOCRNo'] as const) {
      if (data[field] === undefined) continue;
      const value = data[field]?.trim();
      if (!value) { errors[field] = 'This field is required'; continue; }
      const existing = await repository.findOne({ where: {
        [field]: Raw(alias => `LOWER(BTRIM(${alias})) = LOWER(:number)`, { number: value }),
        ...(id ? { id: Not(id) } : {}),
      } });
      if (existing) errors[field] = 'This no already exists. Please give another no.';
    }
    if (Object.keys(errors).length) {
      throw new ConflictException({ message: 'Please correct the contract numbers.', errors });
    }
  }
  async findAll() {
    return await this.contractReviewRepository.find({
      relations: ['request']
    });
  }

  async findOne(id: string) {
    return await this.contractReviewRepository.findOne({
      where: { id },
      relations: ['request']
    });
  }

  async findByRequestId(requestId: string) {
    return await this.contractReviewRepository.findOne({
      where: { requestId },
      relations: ['request']
    });
  }

  async update(id: string, updateData: Partial<CreateContractReviewDto>) {
    return this.saveUpdate({ id }, updateData);
  }

  async updateByRequestId(requestId: string, updateData: Partial<CreateContractReviewDto>) {
    return this.saveUpdate({ requestId }, updateData);
  }

  private async saveUpdate(where: { id: string } | { requestId: string }, updateData: Partial<CreateContractReviewDto>) {
    return this.contractReviewRepository.manager.transaction(async manager => {
      await manager.query('SELECT pg_advisory_xact_lock($1)', [73124001]);
      const repository = manager.getRepository(ContractReview);
      const contract = await repository.findOne({ where });
      if (!contract) throw new NotFoundException('Contract review not found');
      const data = { ...updateData };
      if (data.TRFNo !== undefined) data.TRFNo = data.TRFNo.trim();
      if (data.TOCRNo !== undefined) data.TOCRNo = data.TOCRNo.trim();
      const changedNumbers: Partial<CreateContractReviewDto> = {};
      for (const field of ['TRFNo', 'TOCRNo'] as const) {
        if (data[field] !== undefined && data[field] !== contract[field]?.trim()) changedNumbers[field] = data[field];
      }
      await this.validateNumbers(repository, changedNumbers, contract.id);
      await repository.update(contract.id, data);
      return repository.findOne({ where: { id: contract.id }, relations: ['request'] });
    });
  }
  async remove(id: string) {
    await this.contractReviewRepository.delete(id);
    return { deleted: true };
  }

  private buildTRFPrefix(reportType: string): string {
    const year = new Date().getFullYear();
    const nextYear = year + 1;
    return reportType === 'NON-NABL'
      ? `TPT/${year}/TRF-`
      : `TPT/${year}-${nextYear}/TRF-`;
  }

  private async nextAvailableNumbers(reportType: string, repository = this.contractReviewRepository) {
    const prefix = this.buildTRFPrefix(reportType);
    let sequence = (await this.systemSettingsService.getTrfNo(reportType)) + 1;
    while (true) {
      const TOCRNo = String(sequence).padStart(3, '0');
      const TRFNo = `${prefix}${TOCRNo}`;
      const existing = await repository.findOne({ where: [{ TRFNo }, { TOCRNo }] });
      if (!existing) return { TRFNo, TOCRNo, sequence };
      sequence++;
    }
  }

  async peekNextTRFNumber(reportType: string): Promise<string> {
    return (await this.nextAvailableNumbers(reportType)).TRFNo;
  }
}
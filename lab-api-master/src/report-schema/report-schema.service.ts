import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportSchema } from './entities/report-schema.entity';
import { CreateReportSchemaDto } from './dto/create-report-schema.dto';
import { UpdateReportSchemaDto } from './dto/update-report-schema.dto';

@Injectable()
export class ReportSchemaService {
  constructor(
    @InjectRepository(ReportSchema)
    private reportSchemaRepository: Repository<ReportSchema>,
  ) {}

  create(createReportSchemaDto: CreateReportSchemaDto) {
    const reportSchema = this.reportSchemaRepository.create(createReportSchemaDto);
    return this.reportSchemaRepository.save(reportSchema);
  }

  findAll() {
    return this.reportSchemaRepository.find();
  }

  findOne(id: string) {
    return this.reportSchemaRepository.findOne({ where: { id } });
  }

  update(id: string, updateReportSchemaDto: UpdateReportSchemaDto) {
    return this.reportSchemaRepository.update(id, updateReportSchemaDto);
  }

  remove(id: string) {
    return this.reportSchemaRepository.delete(id);
  }
} 
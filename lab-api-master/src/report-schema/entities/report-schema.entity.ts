import { Product } from 'src/products/entities/product.entity';
import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne } from 'typeorm';
import { ReportSchemaDto } from '../dto/types';

@Entity('report_schema')
export class ReportSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'jsonb', nullable: true })
  ObservationEntrySchema: any;

  @Column({ type: 'jsonb', nullable: true })
  TestReportSchema: ReportSchemaDto;
} 
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AppQuotation } from '../../app-quotation/entities/app-quotation.entity';

@Entity('app_quotation_line_items')
export class AppQuotationLineItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  quotationId: string;

  @ManyToOne(() => AppQuotation, quotation => quotation.lineItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quotationId' })
  quotation: AppQuotation;

  @Column()
  description: string;

  @Column()
  quantity: number;

  @Column({ nullable: true})
  unit: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;
}
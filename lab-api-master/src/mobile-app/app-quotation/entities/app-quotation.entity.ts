import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { AppUser } from '../../app-users/entities/app-user.entity';
import { AppQuotationLineItem } from '../../app-quotation-line-item/entities/app-quotation-line-item.entity';
import { AppRequest } from 'src/mobile-app/app-requests/entities/app-request.entity';
import { User } from '../../../users/entities/user.entity';

@Entity('app_quotations')
export class AppQuotation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({nullable: true})
  requestId: string;

  @ManyToOne(() => AppRequest, { nullable: true })
  @JoinColumn({ name: 'requestId' })
  request: AppRequest;

  @Column({ nullable: true })
  status: string; // pending, approved, rejected, invoiced, paid, completed, cancelled, expired, onhold, draft, quot

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  totalAmount: number;

  // Add new column for InvoiceNo
  @Column({ nullable: true })
  invoiceNo: string;

  // Add new columns for taxes
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  CGST: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  SGST: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  IGST: number;

  @OneToMany(() => AppQuotationLineItem, item => item.quotation, { cascade: true })
  lineItems: AppQuotationLineItem[];

  @CreateDateColumn()
  createdDateTime: Date;

  @Column({ nullable: true })
  createdBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdBy' })
  creator: User;
}
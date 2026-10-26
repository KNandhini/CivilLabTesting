import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Request } from '../../requests/entities/request.entity';

@Entity('receipts')
export class Receipt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  receiptNo: string;

  @Column()
  requestId: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  receiptDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  gst: number;

  @ManyToOne(() => Request, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requestId' })
  request: Request;
}
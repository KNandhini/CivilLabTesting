import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Request } from '../../requests/entities/request.entity';
import { Product } from '../../products/entities/product.entity';
import { Test } from '../../tests/entities/test.entity';
import { SampleCollection } from './sample-collection.entity';
import { User } from '../../users/entities/user.entity';
import { RequestStatus } from 'src/requests/enums/request-status.enum';

@Entity('product_test_sample_mappings')
export class ProductTestSampleMapping {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  requestId: string;

  @Column()
  productId: string;

  @Column()
  testId: string;

  @Column()
  sampleId: string;

  @Column({ nullable: true })
  userId: string;

  @Column({default: RequestStatus.TEST_PENDING, nullable: true})
  status: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Request, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requestId' })
  request: Request;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @ManyToOne(() => Test)
  @JoinColumn({ name: 'testId' })
  test: Test;

  @ManyToOne(() => SampleCollection)
  @JoinColumn({ name: 'sampleId' })
  sample: SampleCollection;

  @Column({ nullable: true })
  createdAt?: Date;


}
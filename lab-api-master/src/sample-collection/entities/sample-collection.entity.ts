import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Request } from '../../requests/entities/request.entity';
import { ProductTestSampleMapping } from './product-test-sample-mapping.entity';

@Entity('sample_collections')
export class SampleCollection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sampleId: string;

  @Column()
  requestId: string;

  @Column()
  sampleType: string;

  @Column({ nullable: true })
  quantity?: number;

  @Column()
  sampleAvailability: string;

@ManyToOne(() => Request, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requestId' })
  request: Request;

  @OneToMany(() => ProductTestSampleMapping, mapping => mapping.sample)
  productTestMappings: ProductTestSampleMapping[];
}
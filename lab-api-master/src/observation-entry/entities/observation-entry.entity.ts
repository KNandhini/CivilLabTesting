import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ProductTestSampleMapping } from '../../sample-collection/entities/product-test-sample-mapping.entity';
import { User } from '../../users/entities/user.entity';
import { SchemaField } from 'src/test-schema/entities/test-schema.entity';
import { TestSchema } from 'src/test-schema/entities/test-schema.entity';

@Entity('observation_entries')
export class ObservationEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  schemaId: string;

  @Column()
  productTestSampleMappingId: string;

  @Column()
  requestId: string;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  receivedBy: string;

  @Column({ nullable: true })
  condition: string;

  @Column({ nullable: true })
  remarks: string;

  @Column({ nullable: true })
  resources: boolean;

  @Column({ nullable: true })
  verification: boolean;

  @Column({ nullable: true })
  pertinentDiscussion: boolean;

  @Column({ nullable: true })
  efficiency: boolean;

  @Column({ nullable: true })
  conditionsCheck: boolean;

  @Column({ type: 'date', nullable: true })
  testStartDate: Date;

  @Column({ type: 'date', nullable: true })
  testCompletionDate: Date;

  @Column({ nullable: true })
  statusOnTest: string;

  @Column({ nullable: true })
  staffId: string;
  
  @Column({ nullable: true })
  codeNo: string;

  @Column({ nullable: true })
  temperature: string;

  @Column({ nullable: true })
  humidity: string;

  @Column({ nullable: true })
  materialStatus: string;

  @Column({ nullable: true })
  sampleStorageCondition: string;

  @Column({ nullable: true })
  gradeOfSteel: string;

  @Column({ nullable: true })
  includeBendRebendTest: boolean;

  @Column({ type: 'jsonb' })
  result: SchemaField[];


  @ManyToOne(() => ProductTestSampleMapping, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'productTestSampleMappingId' })
  productTestSampleMapping: ProductTestSampleMapping;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => TestSchema)
  @JoinColumn({ name: 'schemaId' })
  schema: TestSchema;
}
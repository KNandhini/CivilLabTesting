import { Entity, Column, PrimaryGeneratedColumn, OneToOne, OneToMany, CreateDateColumn, JoinColumn, ManyToOne, UpdateDateColumn } from 'typeorm';
import { ContractReview } from '../../contract-review/entities/contract-review.entity';
import { ProductTestSampleMapping } from '../../sample-collection/entities/product-test-sample-mapping.entity';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/users/entities/user.entity';
import { RequestStatus } from '../enums/request-status.enum';
import { reportItem } from '../dto/types';

@Entity('requests')
export class Request {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  formId: string;

  @ApiProperty()
  @Column({ default: 1 })
  revisionNo: number;

  @ApiProperty()
  @CreateDateColumn()
  revisionDate: Date;

  @ApiProperty()
  @Column({ default: 1 })
  issueNo: number;

  @ApiProperty()
  @CreateDateColumn()
  issueDate: Date;

  @ApiProperty()
  @Column()
  createdUserId: string;

  @ApiProperty()
  @CreateDateColumn()
  createdDate: Date;

  @ApiProperty({ required: false })
  @UpdateDateColumn({ nullable: true })
  modifiedDate: Date;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  modifiedUserId: string;

  @ApiProperty({ enum: RequestStatus, default: RequestStatus.CONTRACT_REVIEW_CREATED })
  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.CONTRACT_REVIEW_CREATED
  })
  status: RequestStatus;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdUserId' })
  createdUser: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'modifiedUserId' })
  modifiedUser: User;

  @OneToOne(() => ContractReview, contractReview => contractReview.request)
  contractReview: ContractReview;

  @OneToMany(() => ProductTestSampleMapping, mapping => mapping.request)
  productTestSampleMappings: ProductTestSampleMapping[];

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  appRequestId: string;

  @ApiProperty({ required: false })
  @Column({ type:'jsonb', nullable: true })
  reportNo?: reportItem[]
}
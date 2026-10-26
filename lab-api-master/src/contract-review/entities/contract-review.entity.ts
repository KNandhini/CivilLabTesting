import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Request } from '../../requests/entities/request.entity';
import { RequestStatus } from '../../requests/enums/request-status.enum';
import { IsOptional } from 'class-validator';

@Entity('contract_reviews')
export class ContractReview {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  requestId: string;

  @ApiProperty()
  @Column()
  customerName: string;

  @ApiProperty()
  @Column({ nullable: true })
  address: string;

  @ApiProperty()
  @Column()
  contactPerson: string;

  @ApiProperty()
  @Column()
  mobileNo: string;

  @ApiProperty()
  @Column({ nullable: true })
  @IsOptional()
  emailId?: string;

  @ApiProperty()
  @Column({ nullable: true })
  nameOfWork: string;

  @ApiProperty()
  @Column()
  location: string;


  @ApiProperty()
  @Column({ nullable: true })
  dateOfCastingAndGradeOfConcrete: string;

  @ApiProperty()
  @Column()
  isStatementOfConformityRequired: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  decisionRule: string;

  @ApiProperty()
  @Column()
  deviationFromTestMethods: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  isMethodInappropriate: string;

  @ApiProperty()
  @Column()
  witnessRequest: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  witnessDetails: string;

  @ApiProperty()
  @Column({ nullable: true })
  witnessName: string;

  @ApiProperty()
  @Column({ nullable: true })
  witnessDesignation: string;

  @ApiProperty()
  @Column()
  modeOfDelivery: string;

  @ApiProperty()
  @Column()
  isSimplifiedReport: string;

  @ApiProperty()
  @Column()
  isOtherOrgAddress: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  otherOrgDetails: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ nullable: true })
  updatedAt: Date;

  @ApiProperty()
  @Column({ default: 'Pending' })
  @ApiProperty({ enum: RequestStatus, default: RequestStatus.CONTRACT_REVIEW_CREATED })
  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.CONTRACT_REVIEW_CREATED
  })
  status: RequestStatus;

  @ManyToOne(() => Request, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requestId' })
  request: Request;

  @ApiProperty()
  @Column({ nullable: true })
  customerLetterNo: string;

  @ApiProperty()
  @Column({ type: 'date', nullable: true })
  customerLetterDate?: Date;

  @ApiProperty()
  @Column({ nullable: true })
  witnessContactNo: string;

  @ApiProperty()

  @Column({ nullable: true })
  witnessEmailId?: string;

  @ApiProperty()
  @Column({ nullable: true })
  miscellaneous: string;

  @ApiProperty()
  @Column({ nullable: true })
  TRFNo: string;

  @ApiProperty()
  @Column({ nullable: true })
  TOCRNo: string;

  @ApiProperty()
  @Column({ nullable: true })
  issueNo: string;

  @ApiProperty()
  @Column({ type: 'date', nullable: true })
  issueDate?: Date;

  @ApiProperty()
  @Column({ nullable: true })
  revisionNo: string;

  @ApiProperty()
  @Column({ type: 'date', nullable: true })
  revisionDate?: Date;

  @ApiProperty()
  @Column({ nullable: true })
  sizeOfMetal: string;

  @ApiProperty()
  @Column({ nullable: true })
  shapeOfBlock: string;

  @ApiProperty()
  @Column({ nullable: true })
  source: string;

  @ApiProperty()
  @Column({ nullable: true })
  sampleReceivedBy: string;

  @ApiProperty()
  @Column({ nullable: true })
  sampleCondition: string;

  @ApiProperty()
  @Column({ nullable: true })
  remarks: string;

  @ApiProperty()
  @Column({ nullable: true })
  resourcesAvailable: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  testMethodVerified: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  pertinentDiscussion: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  sampleEfficiency: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  sampleConditionReceived: boolean;

  @ApiProperty()
  @Column({nullable:true})
  brandName:string
  
  @ApiProperty()
  @Column({nullable:true})
  environmentCondition: string;

  @ApiProperty()
  @Column({nullable:true})
  humidity:string;

  @ApiProperty()
  @Column({nullable:true})
  temperature?:string;

  @ApiProperty()
  @Column({nullable:true})
  detailsOfMachine?:string;

  @ApiProperty()
  @Column({nullable:true})
  dateOfCalibration?:string;

  @ApiProperty()
  @Column({nullable:true})
  loadingRange?:string;

  @ApiProperty()
  @Column({nullable:true})
  curingCondition?:string;

  @ApiProperty()
  @Column({nullable:true})
  sampleReceivedDate?:string;

  @ApiProperty()
  @Column({nullable:true, default: 'NABL'})
  reportType?:string;

  @ApiProperty({ required: false, description: 'Authorised signatory for the contract' })
  @Column({ nullable: true })
  authorisedSignatory?: string;
  
}
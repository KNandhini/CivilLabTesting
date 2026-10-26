import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsEmail, IsDateString, IsOptional, IsUUID, ValidateIf, isString } from 'class-validator';
import { Transform } from 'class-transformer';
import { PrimaryGeneratedColumn } from 'typeorm';

export class CreateContractReviewDto {
  
  @ApiProperty()
  @IsUUID()
  @IsOptional()
  requestId?: string;

  @ApiProperty()
  @IsString()
  customerName: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty()
  @IsString()
  contactPerson: string;

  @ApiProperty()
  @IsString()
  mobileNo: string;

  @ApiProperty()
  @IsOptional()
  emailId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  nameOfWork?: string;

  @ApiProperty()
  @IsString()
  location: string;


  @ApiProperty()
  @IsString()
  dateOfCastingAndGradeOfConcrete: string;

  @ApiProperty()
  @IsString()
  isStatementOfConformityRequired: string;  // Changed from string to boolean

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  decisionRule?: string;

  @ApiProperty()
  @IsString()
  deviationFromTestMethods: string;  // Changed from string to boolean

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  isMethodInappropriate?: string;

  @ApiProperty()
  @IsString()
  witnessRequest: string;  // Changed from string to boolean

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  witnessDetails?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  witnessName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  witnessDesignation?: string;

  @ApiProperty()
  @IsString()
  modeOfDelivery: string;

  @ApiProperty()
  @IsString()
  isSimplifiedReport: string;  // Changed from string to boolean

  @ApiProperty()
  @IsString()
  isOtherOrgAddress: string;  // Changed from string to boolean

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  otherOrgDetails?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  appRequestId?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  customerLetterNo?: string;

  @ApiProperty()
  @ValidateIf((o) => o.customerLetterDate !== '' && o.customerLetterDate != null)
  @IsDateString()
  @IsOptional()
  customerLetterDate?: Date;

  @ApiProperty()
  @IsString()
  @IsOptional()
  witnessContactNo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail({}, { message: 'witnessEmailId must be an email' })
  witnessEmailId?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  miscellaneous?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  TRFNo?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  TOCRNo?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  issueNo?: string;

  @ApiProperty()
  @IsDateString()
  @IsOptional()
  issueDate?: Date;

  @ApiProperty()
  @IsString()
  @IsOptional()
  revisionNo?: string;

  @ApiProperty()
  @IsDateString()
  @IsOptional()
  revisionDate?: Date;

  @ApiProperty()
  @IsString()
  @IsOptional()
  sizeOfMetal?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  shapeOfBlock?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  source?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  sampleReceivedBy?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  sampleCondition?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  remarks?: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  resourcesAvailable?: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  testMethodVerified?: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  pertinentDiscussion?: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  sampleEfficiency?: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  sampleConditionReceived?: boolean;

  @ApiProperty()
  @IsString()
  @IsOptional()
  brandName?:string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  EnvironmentCondition?:string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  humidity?:string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  temperature?:string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  detailsOfMachine?:string;

  @ApiProperty()
  @IsDateString()
  @IsOptional()
  dateOfCalibration?:string;

  @ApiProperty()
  @IsString()
  @IsOptional() 
  loadingRange?:string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  curingCondition?:string;

  @ApiProperty()
  @IsDateString()
  @IsOptional()
  sampleReceivedDate?:string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  reportType?:string;

  @ApiProperty({ required: false, description: 'Authorised signatory for the contract' })
  @IsString()
  @IsOptional()
  authorisedSignatory?: string;

}
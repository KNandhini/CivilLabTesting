import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString, IsBoolean, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ConsultancyDetailsDto {
  @ApiProperty({ description: 'Consultancy name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Consultancy address' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ description: 'Consultancy logo' })
  @IsString()
  @IsOptional()
  logo?: string;

  @ApiProperty({ description: 'NABL logo' })
  @IsString()
  @IsOptional()
  nablLogo?: string;

  @ApiProperty({ description: 'NON-NABL logo' })
  @IsString()
  @IsOptional()
  nonNablLogo?: string;

  @ApiProperty({ description: 'Footer banner' })
  @IsString()
  @IsOptional()
  footerBanner?: string;

  @ApiProperty({ description: 'GST number' })
  @IsString()
  @IsOptional()
  gstNo?: string;
}

export class BankDetailsDto {
  @ApiProperty({ description: 'Account name' })
  @IsString()
  @IsOptional()
  accountName?: string;

  @ApiProperty({ description: 'Account type' })
  @IsString()
  @IsOptional()
  accountType?: string;


  @ApiProperty({ description: 'Bank name' })
  @IsString()
  @IsOptional()
  bankName?: string;

  @ApiProperty({ description: 'Account number' })
  @IsString()
  @IsOptional()
  accountNumber?: string;

  @ApiProperty({ description: 'IFSC code' })
  @IsString()
  @IsOptional()
  ifscCode?: string;

  @ApiProperty({ description: 'Bank branch' })
  @IsString()
  @IsOptional()
  branch?: string;

  @ApiProperty({ description: 'PAN number' })
  @IsString()
  @IsOptional()
  pan?: string;

  @ApiProperty({ description: 'State code' })
  @IsString()
  @IsOptional()
  stateCode?: string;
}

export class FormNumbersDto {
  @ApiProperty({ description: 'Observation entry form number' })
  @IsString()
  @IsOptional()
  observationEntry?: string;

  @ApiProperty({ description: 'Test request form number' })
  @IsString()
  @IsOptional()
  testRequest?: string;

  @ApiProperty({ description: 'TOCR form number' })
  @IsString()
  @IsOptional()
  tocr?: string;

  @ApiProperty({ description: 'NABL form number' })
  @IsString()
  @IsOptional()
  nabl?: string;
}

export class NumberPrefixesDto {
  @ApiProperty({ description: 'Test report number prefix' })
  @IsString()
  @IsOptional()
  testReport?: string;

  @ApiProperty({ description: 'ULR number' })
  @IsString()
  @IsOptional()
  ulr?: string;

  @ApiProperty({ description: 'Annual test request prefix' })
  @IsString()
  @IsOptional()
  annualTestRequest?: string;
}

export class CodeFormatsDto {
  @ApiProperty({ description: 'Sample code format' })
  @IsString()
  @IsOptional()
  sample?: string;
}

export class SteelGradeStandardDto {
  @ApiProperty({ description: 'Yield stress minimum value' })
  @IsString()
  @IsOptional()
  yieldStress?: string;

  @ApiProperty({ description: 'Ultimate tensile stress minimum value' })
  @IsString()
  @IsOptional()
  ultimateTensileStress?: string;

  @ApiProperty({ description: 'Percentage of elongation minimum value' })
  @IsString()
  @IsOptional()
  elongation?: string;
}

export class SystemSettingsDataDto {
  @ApiProperty({ description: 'Consultancy details', type: ConsultancyDetailsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ConsultancyDetailsDto)
  consultancyDetails?: ConsultancyDetailsDto;

  @ApiProperty({ description: 'Bank details', type: BankDetailsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => BankDetailsDto)
  bankDetails?: BankDetailsDto;

  @ApiProperty({ description: 'Form numbers', type: FormNumbersDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => FormNumbersDto)
  formNumbers?: FormNumbersDto;

  @ApiProperty({ description: 'Number prefixes', type: NumberPrefixesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => NumberPrefixesDto)
  numberPrefixes?: NumberPrefixesDto;

  @ApiProperty({ description: 'Code formats', type: CodeFormatsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CodeFormatsDto)
  codeFormats?: CodeFormatsDto;

  @ApiProperty({ description: 'Steel grade standards keyed by grade name (e.g. "Fe 550D")' })
  @IsObject()
  @IsOptional()
  steelGradeStandards?: Record<string, SteelGradeStandardDto>;

  @ApiProperty({
    description: 'List of authorised signatory options for the dropdown',
    type: [String],
  })
  @IsArray()
  @IsOptional()
  authorisedSignatories?: string[];

  @ApiProperty({ description: 'Custom settings object' })
  @IsObject()
  @IsOptional()
  customSettings?: Record<string, any>;

  @ApiProperty({ description: 'Theme settings' })
  @IsObject()
  @IsOptional()
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    darkMode?: boolean;
  };

  @ApiProperty({ description: 'Notification settings' })
  @IsObject()
  @IsOptional()
  notifications?: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
  };

  @ApiProperty({ description: 'System preferences' })
  @IsObject()
  @IsOptional()
  preferences?: {
    language?: string;
    timezone?: string;
    dateFormat?: string;
    currency?: string;
  };
}

export class SystemSettingsDto {
  @ApiProperty({ description: 'System settings ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'System settings data', type: SystemSettingsDataDto })
  @IsObject()
  @ValidateNested()
  @Type(() => SystemSettingsDataDto)
  data: SystemSettingsDataDto;
}

export class UpdateSystemSettingsDataDto {
  @ApiProperty({ description: 'Consultancy details', type: ConsultancyDetailsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ConsultancyDetailsDto)
  consultancyDetails?: ConsultancyDetailsDto;

  @ApiProperty({ description: 'Bank details', type: BankDetailsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => BankDetailsDto)
  bankDetails?: BankDetailsDto;

  @ApiProperty({ description: 'Form numbers', type: FormNumbersDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => FormNumbersDto)
  formNumbers?: FormNumbersDto;

  @ApiProperty({ description: 'Number prefixes', type: NumberPrefixesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => NumberPrefixesDto)
  numberPrefixes?: NumberPrefixesDto;

  @ApiProperty({ description: 'Code formats', type: CodeFormatsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CodeFormatsDto)
  codeFormats?: CodeFormatsDto;

  @ApiProperty({
    description: 'List of authorised signatory options for the dropdown',
    type: [String],
  })
  @IsArray()
  @IsOptional()
  authorisedSignatories?: string[];

  @ApiProperty({ description: 'Custom settings object' })
  @IsObject()
  @IsOptional()
  customSettings?: Record<string, any>;

  @ApiProperty({ description: 'Theme settings' })
  @IsObject()
  @IsOptional()
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    darkMode?: boolean;
  };

  @ApiProperty({ description: 'Notification settings' })
  @IsObject()
  @IsOptional()
  notifications?: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
  };

  @ApiProperty({ description: 'System preferences' })
  @IsObject()
  @IsOptional()
  preferences?: {
    language?: string;
    timezone?: string;
    dateFormat?: string;
    currency?: string;
  };
}

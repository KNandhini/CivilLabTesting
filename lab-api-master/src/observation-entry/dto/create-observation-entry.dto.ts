import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsObject, IsArray, ValidateNested, IsUUID } from 'class-validator';
import { SchemaFieldDto } from 'src/test-schema/dto/schema-field.dto';

export class CreateObservationEntryDto {

@ApiProperty()
  @IsUUID()
  requestId: string;

  @ApiProperty()
  @IsUUID()
  schemaId: string;

  @ApiProperty()
  @IsUUID()
  productTestSampleMappingId: string;

  @ApiProperty({ type: [SchemaFieldDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SchemaFieldDto)
  result: SchemaFieldDto[];
}
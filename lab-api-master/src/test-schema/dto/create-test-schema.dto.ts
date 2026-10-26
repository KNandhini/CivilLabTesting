import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsUUID, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SchemaFieldDto } from './schema-field.dto';

export class CreateTestSchemaDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: [SchemaFieldDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SchemaFieldDto)
  schema: SchemaFieldDto[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  testIds: string[];
}
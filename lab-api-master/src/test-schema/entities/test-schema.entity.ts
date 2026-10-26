import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { TestSchemaMapping } from './test-schema-mapping.entity';

@Entity('test_schemas')
export class TestSchema {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column('jsonb')
  schema: SchemaField[];

  @OneToMany(() => TestSchemaMapping, mapping => mapping.schema)
  testMappings: TestSchemaMapping[];
}

export interface SchemaField {
  field: string;
  displayName: string;
  type: string;
  value: any;
}
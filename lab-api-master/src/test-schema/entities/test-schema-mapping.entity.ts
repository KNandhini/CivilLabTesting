import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Test } from '../../tests/entities/test.entity';
import { TestSchema } from './test-schema.entity';

@Entity('test_schema_mappings')
export class TestSchemaMapping {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  testId: string;

  @ApiProperty()
  @Column()
  schemaId: string;

  @ManyToOne(() => Test, test => test.schemaMappings)
  @JoinColumn({ name: 'testId' })
  test: Test;

  @ManyToOne(() => TestSchema, schema => schema.testMappings)
  @JoinColumn({ name: 'schemaId' })
  schema: TestSchema;
}
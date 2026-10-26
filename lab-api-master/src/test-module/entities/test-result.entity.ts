import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { Material } from './material.entity';
import { TestType } from './test-type.entity';

@Entity('test_results')
export class TestResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Material)
  material: Material;

  @ManyToOne(() => TestType)
  testType: TestType;

  @Column({ type: 'jsonb' })
  inputValues: Record<string, any>;

  @Column({ type: 'jsonb' })
  results: Record<string, any>;

  @Column()
  status: string;

  @CreateDateColumn()
  performedAt: Date;

  @Column({ nullable: true })
  remarks: string;
}
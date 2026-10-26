import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { TestResult } from './test-result.entity';

@Entity('materials')
export class Material {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  category: string;

  @OneToMany(() => TestResult, testResult => testResult.material)
  testResults: TestResult[];
}
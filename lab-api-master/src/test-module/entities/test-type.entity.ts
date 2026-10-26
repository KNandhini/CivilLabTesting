import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Material } from './material.entity';

@Entity('test_types')
export class TestType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  materialCategory: string;

  @Column({ type: 'jsonb', nullable: true })
  parameters: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  calculations: Record<string, any>;
}
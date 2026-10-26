import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('app_tests')
export class AppTest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  testName: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @CreateDateColumn()
  createdDateTime: Date;
}
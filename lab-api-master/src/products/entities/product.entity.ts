import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Test } from '../../tests/entities/test.entity';

@Entity('products')
export class Product {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column({ nullable: true })
  productShortForm: string;

  @ApiProperty()
  @Column({nullable:true, default:0})
  reportNo?:number;

  @ApiProperty()
  @Column({nullable:true, default:0})
  reportNoNonNabl?:number;

  @OneToMany(() => Test, test => test.product, { cascade: true })
  tests: Test[];

}
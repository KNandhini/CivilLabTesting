import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../../products/entities/product.entity';
import { TestSchema } from '../../test-schema/entities/test-schema.entity';
import { TestSchemaMapping } from '../../test-schema/entities/test-schema-mapping.entity';

@Entity('tests')
export class Test {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @ApiProperty()
  @Column()
  @ApiProperty({ required: false })
  @Column({ nullable: true })
  testingMethod: string;

  @ApiProperty()
  @Column()
  productId: string;

  @ManyToOne(() => Product, product => product.tests)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @ApiProperty()
  @Column({ default: false })
  isSiteTest: boolean;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  unit: string;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  minimumQuantityRequired?: number;

  @OneToMany(() => TestSchemaMapping, mapping => mapping.test)
  schemaMappings: TestSchemaMapping[];
}
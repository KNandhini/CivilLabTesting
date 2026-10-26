import { Entity, Column, PrimaryColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('system_settings')
export class SystemSettings {
  @ApiProperty()
  @PrimaryColumn({ default: 'default' })
  id: string;

  @ApiProperty()
  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, any>;

  @ApiProperty()
  @Column({ nullable: true, default: 0 })
  ulrNo: number;

  @ApiProperty()
  @Column({ nullable: true, default: 0 })
  trfNoNabl!: number;

  @ApiProperty()
  @Column({ nullable: true, default: 0 })
  trfNoNonNabl!: number;
} 
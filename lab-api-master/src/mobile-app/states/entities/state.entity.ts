import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('states')
export class State {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  iso: string;
}
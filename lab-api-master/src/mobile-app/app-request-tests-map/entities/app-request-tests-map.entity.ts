import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AppRequest } from '../../app-requests/entities/app-request.entity';
import { AppTest } from '../../app-tests/entities/app-test.entity';
import { Test } from 'src/tests/entities/test.entity';

@Entity('app_request_tests_maps')
export class AppRequestTestsMap {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  requestId: string;

  @Column()
  testId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @ManyToOne(() => AppRequest, request => request.requestTests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requestId' })
  request: AppRequest;

  @ManyToOne(() => Test, { eager: true }) // Ensure eager loading of AppTest
  @JoinColumn({ name: 'testId' })
  test: Test;
}
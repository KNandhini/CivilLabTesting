import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { AppUser } from '../../app-users/entities/app-user.entity';
import { AppRequestTestsMap } from '../../app-request-tests-map/entities/app-request-tests-map.entity';
import { Request } from 'src/requests/entities/request.entity';
import { State } from 'src/mobile-app/states/entities/state.entity';

@Entity('app_requests')
export class AppRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  designation: string;

  @Column()
  organization: string;

  @Column()
  address: string;
  @Column({ nullable: true })
  state: string;

  @ManyToOne(() => State)
  @JoinColumn({ name: 'state' })
  appState: State;

  @Column({ nullable: true })
  gstNumber: string;

  @Column()
  mobileNumber: string;

  @Column({nullable: true})
  email: string;

  @Column()
  projectName: string;

  @Column()
  siteLocation: string;

  @Column()
  testPoints: string;

  @Column({ default: false })
  immediate: boolean;

  @Column({ type: 'date', nullable: true })
  specificDate: Date;

  @Column({ default: false })
  confirmed: boolean;

  @Column({ nullable: true })
  reason: string;

  @Column()
  appUserId: string;

  @ManyToOne(() => AppUser)
  @JoinColumn({ name: 'appUserId' })
  appUser: AppUser;

  @Column({ default: 'Pending' })
  status: string;

  @Column({ default: 'Pending' })
  paymentStatus: string;

  @Column({nullable: true})
  paymentRefereceNo: string;

  @Column({ type: 'bytea', nullable: true })
  report: Buffer;

  @CreateDateColumn()
  createdDateTime: Date;

  @OneToMany(() => AppRequestTestsMap, requestTest => requestTest.request, { eager: true })
  requestTests: AppRequestTestsMap[];

  
  @Column({ nullable: true })
  requestId: string;

  @ManyToOne(() => Request, { nullable: true })
  @JoinColumn({ name: 'requestId' })
  request: Request;
}
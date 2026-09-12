import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Car } from '../../cars/entities/car.entity';

export enum BookingStatus {
  PENDING = 'Pending',
  ACTIVE = 'Active',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Car, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'carId' })
  car: Car;

  @Column()
  carId: string;

  @Column({ type: 'date' })
  pickupDate: string;

  @Column({ type: 'date' })
  dropoffDate: string;

  @Column({ default: false })
  addDriver: boolean;

  @Column({ default: false })
  addInsurance: boolean;

  @Column('decimal', { precision: 10, scale: 2 })
  baseAmount: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  driverFee: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  insuranceFee: number;

  @Column('decimal', { precision: 10, scale: 2, default: 500 })
  serviceFee: number;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.PENDING })
  status: BookingStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
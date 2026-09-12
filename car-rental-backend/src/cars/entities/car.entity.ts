import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum CarType {
  SEDAN = 'Sedan',
  SUV = 'SUV',
  HATCHBACK = 'Hatchback',
  LUXURY = 'Luxury',
}

export enum FuelType {
  PETROL = 'Petrol',
  DIESEL = 'Diesel',
  HYBRID = 'Hybrid',
  ELECTRIC = 'Electric',
}

export enum TransmissionType {
  AUTOMATIC = 'Automatic',
  MANUAL = 'Manual',
}

@Entity('cars')
export class Car {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'enum', enum: CarType })
  type: CarType;

  @Column({ length: 50 })
  city: string;

  @Column('decimal', { precision: 10, scale: 2 })
  pricePerDay: number;

  @Column({ type: 'int' })
  seats: number;

  @Column({ type: 'enum', enum: FuelType, default: FuelType.PETROL })
  fuel: FuelType;

  @Column({ type: 'enum', enum: TransmissionType, default: TransmissionType.AUTOMATIC })
  transmission: TransmissionType;

  @Column({ length: 30, nullable: true })
  mileage: string;

  @Column('decimal', { precision: 2, scale: 1, default: 0 })
  rating: number;

  @Column({ type: 'int', default: 0 })
  reviewCount: number;

  // Cloudinary image URLs stored as JSON array
  @Column({ type: 'json', nullable: true })
  images: string[];

  // e.g. ["Air conditioning", "Reverse camera", "Bluetooth audio"]
  @Column({ type: 'json', nullable: true })
  features: string[];

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  isAvailable: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
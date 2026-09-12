import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';

// This table only ever holds one row (id = 1) — acts as a simple key-value
// store for admin-editable business settings.
@Entity('settings')
export class Setting {
  @PrimaryColumn({ default: 1 })
  id: number;

  @Column('decimal', { precision: 10, scale: 2, default: 1500 })
  driverFeePerDay: number;

  @Column('decimal', { precision: 10, scale: 2, default: 800 })
  insuranceFeePerDay: number;

  @Column('decimal', { precision: 10, scale: 2, default: 500 })
  serviceFee: number;

  @UpdateDateColumn()
  updatedAt: Date;
}
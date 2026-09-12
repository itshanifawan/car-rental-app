import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual, Not } from 'typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { CarsService } from '../cars/cars.service';
import { SettingsService } from '../settings/settings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingsRepository: Repository<Booking>,
    private readonly carsService: CarsService,
    private readonly settingsService: SettingsService,
  ) {}

  private calculateDays(pickup: string, dropoff: string): number {
    const diff = new Date(dropoff).getTime() - new Date(pickup).getTime();
    return Math.round(diff / (1000 * 60 * 60 * 24));
  }

  // Core anti-double-booking check: any existing non-cancelled booking
  // for this car whose date range overlaps the requested range blocks it.
  private async assertCarIsAvailable(
    carId: string,
    pickupDate: string,
    dropoffDate: string,
    excludeBookingId?: string,
  ) {
    const overlapping = await this.bookingsRepository.find({
      where: {
        carId,
        status: Not(BookingStatus.CANCELLED),
        pickupDate: LessThanOrEqual(dropoffDate),
        dropoffDate: MoreThanOrEqual(pickupDate),
        ...(excludeBookingId ? { id: Not(excludeBookingId) } : {}),
      },
    });

    if (overlapping.length > 0) {
      throw new ConflictException(
        'This car is already booked for part of the selected date range',
      );
    }
  }

  async create(userId: string, dto: CreateBookingDto): Promise<Booking> {
    const car = await this.carsService.findOne(dto.carId);
    if (!car.isAvailable) {
      throw new BadRequestException('This car is not currently available for booking');
    }

    const days = this.calculateDays(dto.pickupDate, dto.dropoffDate);
    if (days <= 0) {
      throw new BadRequestException('dropoffDate must be after pickupDate');
    }

    await this.assertCarIsAvailable(dto.carId, dto.pickupDate, dto.dropoffDate);

    // Live business rates — configurable by admin via Settings, not hardcoded
    const settings = await this.settingsService.getSettings();
    const driverRate = Number(settings.driverFeePerDay);
    const insuranceRate = Number(settings.insuranceFeePerDay);
    const serviceFee = Number(settings.serviceFee);

    const baseAmount = days * Number(car.pricePerDay);
    const driverFee = dto.addDriver ? days * driverRate : 0;
    const insuranceFee = dto.addInsurance ? days * insuranceRate : 0;
    const totalAmount = baseAmount + driverFee + insuranceFee + serviceFee;

    const booking = this.bookingsRepository.create({
      userId,
      carId: dto.carId,
      pickupDate: dto.pickupDate,
      dropoffDate: dto.dropoffDate,
      addDriver: !!dto.addDriver,
      addInsurance: !!dto.addInsurance,
      baseAmount,
      driverFee,
      insuranceFee,
      serviceFee,
      totalAmount,
      status: BookingStatus.PENDING,
    });

    return this.bookingsRepository.save(booking);
  }

  async findAllForUser(userId: string): Promise<Booking[]> {
    return this.bookingsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findAllForAdmin(): Promise<Booking[]> {
    return this.bookingsRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Booking> {
    const booking = await this.bookingsRepository.findOne({ where: { id } });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    return booking;
  }

  async updateStatus(id: string, dto: UpdateBookingStatusDto): Promise<Booking> {
    const booking = await this.findOne(id);
    booking.status = dto.status;
    return this.bookingsRepository.save(booking);
  }

  async cancel(id: string, requesterId: string, requesterRole: UserRole): Promise<Booking> {
    const booking = await this.findOne(id);

    const isOwner = booking.userId === requesterId;
    const isAdmin = requesterRole === UserRole.ADMIN;
    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You can only cancel your own bookings');
    }

    if (booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestException('Completed bookings cannot be cancelled');
    }

    booking.status = BookingStatus.CANCELLED;
    return this.bookingsRepository.save(booking);
  }
}
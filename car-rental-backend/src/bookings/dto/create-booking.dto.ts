import { IsUUID, IsDateString, IsOptional, IsBoolean, Validate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isAfterPickup', async: false })
class IsAfterPickupConstraint implements ValidatorConstraintInterface {
  validate(dropoffDate: string, args: ValidationArguments) {
    const obj = args.object as CreateBookingDto;
    return new Date(dropoffDate) > new Date(obj.pickupDate);
  }
  defaultMessage() {
    return 'dropoffDate must be after pickupDate';
  }
}

export class CreateBookingDto {
  @ApiProperty({ example: 'a1b2c3d4-uuid-of-car' })
  @IsUUID()
  carId: string;

  @ApiProperty({ example: '2026-09-10' })
  @IsDateString()
  pickupDate: string;

  @ApiProperty({ example: '2026-09-13' })
  @IsDateString()
  @Validate(IsAfterPickupConstraint)
  dropoffDate: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  addDriver?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  addInsurance?: boolean;
}
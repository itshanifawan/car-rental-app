import {
  IsString,
  IsEnum,
  IsNumber,
  IsInt,
  IsOptional,
  IsArray,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CarType, FuelType, TransmissionType } from '../entities/car.entity';

export class CreateCarDto {
  @ApiProperty({ example: 'Toyota Fortuner' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ enum: CarType, example: CarType.SUV })
  @IsEnum(CarType)
  type: CarType;

  @ApiProperty({ example: 'Islamabad' })
  @IsString()
  @MaxLength(50)
  city: string;

  @ApiProperty({ example: 15500 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  pricePerDay: number;

  @ApiProperty({ example: 7 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  seats: number;

  @ApiProperty({ enum: FuelType, example: FuelType.DIESEL })
  @IsEnum(FuelType)
  fuel: FuelType;

  @ApiProperty({ enum: TransmissionType, example: TransmissionType.AUTOMATIC })
  @IsEnum(TransmissionType)
  transmission: TransmissionType;

  @ApiProperty({ example: '10 km/l', required: false })
  @IsOptional()
  @IsString()
  mileage?: string;

  @ApiProperty({ example: ['Air conditioning', 'Reverse camera'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @ApiProperty({ example: 'Spacious 7-seater, perfect for family trips.', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
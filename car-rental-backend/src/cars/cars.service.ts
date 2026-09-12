import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, ILike } from 'typeorm';
import { Car } from './entities/car.entity';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { QueryCarDto } from './dto/query-car.dto';

@Injectable()
export class CarsService {
  constructor(
    @InjectRepository(Car)
    private readonly carsRepository: Repository<Car>,
  ) {}

  async create(createCarDto: CreateCarDto, images: string[] = []): Promise<Car> {
    const car = this.carsRepository.create({ ...createCarDto, images });
    return this.carsRepository.save(car);
  }

  async findAll(query: QueryCarDto) {
    const { search, city, type, transmission, maxPrice, page = 1, limit = 12, includeUnavailable } = query;

    const where: any = {};
    if (includeUnavailable !== 'true') where.isAvailable = true;
    if (search) where.name = ILike(`%${search}%`);
    if (city) where.city = city;
    if (type) where.type = type;
    if (transmission) where.transmission = transmission;
    if (maxPrice) where.pricePerDay = LessThanOrEqual(maxPrice);

    const [cars, total] = await this.carsRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: cars,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Car> {
    const car = await this.carsRepository.findOne({ where: { id } });
    if (!car) {
      throw new NotFoundException('Car not found');
    }
    return car;
  }

  async update(id: string, updateCarDto: UpdateCarDto): Promise<Car> {
    const car = await this.findOne(id);
    Object.assign(car, updateCarDto);
    return this.carsRepository.save(car);
  }

  async addImages(id: string, newImages: string[]): Promise<Car> {
    const car = await this.findOne(id);
    car.images = [...(car.images || []), ...newImages];
    return this.carsRepository.save(car);
  }

  async remove(id: string): Promise<void> {
    const car = await this.findOne(id);
    await this.carsRepository.remove(car);
  }

  async setAvailability(id: string, isAvailable: boolean): Promise<Car> {
    const car = await this.findOne(id);
    car.isAvailable = isAvailable;
    return this.carsRepository.save(car);
  }
}
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { CarsService } from './cars.service';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { QueryCarDto } from './dto/query-car.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@ApiTags('Cars')
@Controller('cars')
export class CarsController {
  constructor(
    private readonly carsService: CarsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // ---- PUBLIC ROUTES ----

  @Get()
  @ApiOperation({ summary: 'Browse/search available cars with filters' })
  findAll(@Query() query: QueryCarDto) {
    return this.carsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single car by ID' })
  findOne(@Param('id') id: string) {
    return this.carsService.findOne(id);
  }

  // ---- ADMIN-ONLY ROUTES ----

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Add a new car with images (admin only)' })
  @UseInterceptors(FilesInterceptor('images', 6)) // up to 6 images
  async create(
    @Body() createCarDto: CreateCarDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const imageUrls = files?.length
      ? await this.cloudinaryService.uploadMultiple(files)
      : [];
    return this.carsService.create(createCarDto, imageUrls);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update car details (admin only)' })
  update(@Param('id') id: string, @Body() updateCarDto: UpdateCarDto) {
    return this.carsService.update(id, updateCarDto);
  }

  @Post(':id/images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Add more images to an existing car (admin only)' })
  @UseInterceptors(FilesInterceptor('images', 6))
  async addImages(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const imageUrls = await this.cloudinaryService.uploadMultiple(files);
    return this.carsService.addImages(id, imageUrls);
  }

  @Patch(':id/availability')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle car availability (admin only)' })
  setAvailability(@Param('id') id: string, @Body('isAvailable') isAvailable: boolean) {
    return this.carsService.setAvailability(id, isAvailable);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a car (admin only)' })
  remove(@Param('id') id: string) {
    return this.carsService.remove(id);
  }
}
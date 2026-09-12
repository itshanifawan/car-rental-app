import { IsString, IsOptional, MinLength, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Ali Hassan' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  fullName?: string;

  @ApiPropertyOptional({ example: '03001234567' })
  @IsOptional()
  @Matches(/^0\d{10}$/, { message: 'Phone must be a valid 11-digit number starting with 0' })
  phone?: string;
}
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsNumber, IsOptional, IsString, IsUrl, IsUUID, Min } from 'class-validator';
import { UserDto } from 'src/user/dto/user.dto';
import { ShortUrl } from '../shorturl.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ShorturlDto {
  @IsUUID()
  id: string;

  @IsUrl()
  originalUrl: string;

  @IsString()
  shortCode: string;

  @IsNumber()
  clicks: number;

  @Type(() => UserDto)
  user?: UserDto;

  @IsDateString()
  createdAt: Date;

  @IsDateString()
  updatedAt: Date;
}


export class PaginatedShortUrlDto {
  @ApiProperty({ type: [ShortUrl] })
  data: ShortUrl[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}

export class PaginateDto {
  @ApiPropertyOptional({ description: 'Page', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Limit', example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
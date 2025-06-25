import { Type } from 'class-transformer';
import { IsDateString, IsNumber, IsString, IsUrl, IsUUID } from 'class-validator';
import { UserDto } from 'src/user/dto/user.dto';

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
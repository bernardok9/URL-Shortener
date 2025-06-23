import { IsUrl } from 'class-validator';

export class CreateShorturlDto {
  @IsUrl()
  url: string;
}

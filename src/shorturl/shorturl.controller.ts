import { Body, Controller, Post, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { ShorturlService } from './shorturl.service';
import { Response } from 'express';
import { CreateShorturlDto } from './dto/shorturl.dto';

@Controller()
export class ShorturlController {
  constructor(private readonly shortUrlService: ShorturlService) {}

  @Post('short')
  async short(@Body() body: CreateShorturlDto) {
    const short = await this.shortUrlService.create(body.url);
    return {
      originalUrl: short.originalUrl,
      shortUrl: `http://localhost/${short.shortCode}`,
    };
  }

  @Get(':shortCode')
  async redirect(@Param('shortCode') shortCode: string, @Res() res: Response) {
    const found = await this.shortUrlService.findByCode(shortCode);
    if (!found) {
      throw new NotFoundException('URL Code not found');
    }
    return res.redirect(found.originalUrl);
  }
}

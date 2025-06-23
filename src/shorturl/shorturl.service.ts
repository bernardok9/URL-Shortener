import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShortUrl } from './shorturl.entity';

@Injectable()
export class ShorturlService {
  constructor(
    @InjectRepository(ShortUrl)
    private readonly shortUrlRepo: Repository<ShortUrl>,
  ) {}

  private shortCodeGenerator(length = 6): string {
    //Select all possibles numbers and strings
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' + 'abcdefghijklmnopqrstuvwxyz' + '0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      //Generate a random Math number based on length of char, 0 <= n < chars.length;
      //select the position of vector and set on result, repeat 6 times to define the short url;
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async create(originalUrl: string): Promise<ShortUrl> {
    const existing = await this.shortUrlRepo.findOne({ where: { originalUrl } });
    if (existing) return existing;

    let shortCode: string;
    // generate code until some is available
    do {
      shortCode = this.shortCodeGenerator();
    } while (await this.shortUrlRepo.findOne({ where: { shortCode } }));

    const shortUrl = this.shortUrlRepo.create({ originalUrl, shortCode });
    return this.shortUrlRepo.save(shortUrl);
  }

  async findByCode(shortCode: string): Promise<ShortUrl | null> {
    return this.shortUrlRepo.findOne({ where: { shortCode } });
  }
}

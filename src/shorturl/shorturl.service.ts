import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ShortUrl } from './shorturl.entity';
import { User } from 'src/user/user.entity';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';
import { PaginateDto } from './dto/shorturl.dto';


@Injectable()
export class ShorturlService {
  constructor(
    @InjectRepository(ShortUrl)
    private readonly shortUrlRepo: Repository<ShortUrl>,

    @InjectMetric('shorturl_created_total')
    private readonly shortUrlCounter: Counter,

    @InjectMetric('shorturl_execution_time')
    private readonly urlExecutionTime: Histogram
  ) { }

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

  async create(originalUrl: string, user?: User): Promise<ShortUrl> {
    let shortCode: string;
    const end = this.urlExecutionTime.startTimer();
    // generate code until some is available
    do {
      shortCode = this.shortCodeGenerator();
    } while (await this.shortUrlRepo.findOne({ where: { shortCode } }));

    const shortUrl = this.shortUrlRepo.create({ originalUrl: originalUrl, shortCode: shortCode, user: user });

    // End prometheus Histogram timer;
    end();
    this.shortUrlCounter.inc();

    return this.shortUrlRepo.save(shortUrl);
  }

  async findByCode(shortCode: string): Promise<ShortUrl> {
    const found = await this.shortUrlRepo.findOne({ where: { shortCode, deletedAt: IsNull() } });
    if (!found) throw new NotFoundException('Short URL not found');

    found.clicks++;
    await this.shortUrlRepo.save(found);
    return found;
  }

async list(user: User, query: PaginateDto) {
  const { page = 1, limit = 10 } = query;

  const [data, total] = await this.shortUrlRepo.findAndCount({
    where: { user: { id: user.id }, deletedAt: IsNull() },
    relations: ['user'],
    skip: (page - 1) * limit,
    take: limit,
  });

  console.log('Pagination:', { page, limit });

  return {
    data,
    total,
    page,
    lastPage: Math.ceil(total / limit),
  };
}

  async update(id: string, newUrl: string, user: User): Promise<ShortUrl> {
    const short = await this.shortUrlRepo.findOne({ where: { id, deletedAt: IsNull() }, relations: ['user'] });
    if (!short || short.user?.id !== user.id) throw new ForbiddenException();

    short.originalUrl = newUrl;
    return this.shortUrlRepo.save(short);
  }

  async softDelete(id: string, user: User): Promise<void> {
    const short = await this.shortUrlRepo.findOne({ where: { id, deletedAt: IsNull() }, relations: ['user'] });
    if (!short || short.user?.id !== user.id) throw new ForbiddenException();

    await this.shortUrlRepo.softRemove(short);
  }
}

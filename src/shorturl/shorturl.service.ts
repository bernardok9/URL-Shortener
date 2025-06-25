import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ShortUrl } from './shorturl.entity';
import { User } from 'src/user/user.entity';


@Injectable()
export class ShorturlService {
  constructor(
    @InjectRepository(ShortUrl)
    private readonly shortUrlRepo: Repository<ShortUrl>,
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
    // generate code until some is available
    do {
      shortCode = this.shortCodeGenerator();
    } while (await this.shortUrlRepo.findOne({ where: { shortCode } }));

    const shortUrl = this.shortUrlRepo.create({ originalUrl: originalUrl, shortCode: shortCode, user: user });
    return this.shortUrlRepo.save(shortUrl);
  }

  async findByCode(shortCode: string): Promise<ShortUrl> {
    const found = await this.shortUrlRepo.findOne({ where: { shortCode, deletedAt: IsNull() } });
    if (!found) throw new NotFoundException('Short URL not found');

    found.clicks++;
    await this.shortUrlRepo.save(found);
    return found;
  }

  async list(user: User): Promise<ShortUrl[]> {
    const urls = await this.shortUrlRepo.find({
      where: { user: { id: user.id }, deletedAt: IsNull() },
      relations: ['user'],
    });
    return urls;
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

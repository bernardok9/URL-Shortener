import { Module } from '@nestjs/common';
import { ShorturlService } from './shorturl.service';
import { ShorturlController } from './shorturl.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShortUrl } from './shorturl.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShortUrl])],
  controllers: [ShorturlController],
  providers: [ShorturlService],
})
export class ShorturlModule {}

import { Module } from '@nestjs/common';
import { ShorturlService } from './shorturl.service';
import { ShorturlController } from './shorturl.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShortUrl } from './shorturl.entity';
import { MetricsModule } from 'src/metrics/metrics.module';

@Module({
  imports: [TypeOrmModule.forFeature([ShortUrl]), MetricsModule],
  controllers: [ShorturlController],
  providers: [ShorturlService],
})
export class ShorturlModule {}

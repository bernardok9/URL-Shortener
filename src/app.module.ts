import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { envValidationSchema } from './config/env.validation';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
    validationSchema: envValidationSchema,
  }),
  TypeOrmModule.forRoot({
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,    
    port: Number(process.env.DATABASE_PORT),
    database: process.env.DATABASE_NAME,  
    autoLoadEntities: true,
    synchronize: true,
  }),
],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

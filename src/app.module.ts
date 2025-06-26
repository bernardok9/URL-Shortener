import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { envValidationSchema } from './config/env.validation';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ShorturlModule } from './shorturl/shorturl.module';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
    validationSchema: envValidationSchema,
  }),
  TypeOrmModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
      type: 'postgres',
      host: configService.get('DATABASE_HOST'),
      username: configService.get('DATABASE_USERNAME'),
      password: configService.get('DATABASE_PASSWORD'),
      port: configService.get<number>('DATABASE_PORT'),
      database: configService.get('DATABASE_NAME'),
      autoLoadEntities: true,
      synchronize: true,
    }),
  }),
  ...(process.env.PROMETHEUS_ENABLED === 'true'
    ? [
      PrometheusModule.register({
        defaultMetrics: { enabled: true },
      }),
    ]
    : []),
    UserModule,
    AuthModule,
    ShorturlModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

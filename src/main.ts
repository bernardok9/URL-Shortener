import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';


async function bootstrap() {
  dotenv.config();

  const app = await NestFactory.create(AppModule);

  // if Swagger enabled the address is localhost:3000/api
  if (process.env.SWAGGER_ENABLED?.toLowerCase() === 'true') {
    const config = new DocumentBuilder()
      .setTitle('Backend Test')
      .setDescription('API Documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  await app.listen(3000);
}
bootstrap();

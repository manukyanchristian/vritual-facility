import { NestFactory } from '@nestjs/core';
import { WorkflowsServiceModule } from './workflows-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(WorkflowsServiceModule);
  app.useGlobalPipes(new ValidationPipe());

  app.connectMicroservice<MicroserviceOptions>(
    // {
    //   transport: Transport.NATS,
    //   options: {
    //     servers: process.env.NATS_URL,
    //     queue: 'workflows-service',
    //   },
    // },
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL as string],
        queue: 'workflows-service',
        noAck: false,
      },
    },
    { inheritAppConfig: true },
  );
  await app.startAllMicroservices();

  await app.listen(process.env.port ?? 3001);
}

bootstrap().then(
  () => {
    console.log('Workflows Service is running...');
  },
  (err) => {
    console.error(err);
  },
);

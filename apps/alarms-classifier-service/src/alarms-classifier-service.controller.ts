import { Controller } from '@nestjs/common';
import { AlarmsClassifierServiceService } from './alarms-classifier-service.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TracingLogger } from '@app/tracing/tracing.logger';

@Controller()
export class AlarmsClassifierServiceController {
  constructor(
    private readonly logger: TracingLogger,
    private readonly alarmsClassifierServiceService: AlarmsClassifierServiceService,
  ) {}

  @MessagePattern('alarm.classify')
  classifyAlarm(@Payload() data: unknown) {
    this.logger.debug(
      `Received new "alarm.classify" event: ${JSON.stringify(data)}`,
    );

    return {
      // INFO: will classify using some AI-based model.
      category: ['critical', 'non-critical', 'invalid'][
        Math.floor(Math.random() * 3)
      ],
    };
  }
}

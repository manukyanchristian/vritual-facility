import { Injectable, Logger } from '@nestjs/common';
import { InboxService } from '../inbox/inbox.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Inbox } from '../inbox/entities/inbox.entity';
import { DeepPartial, EntityManager } from 'typeorm';
import { Workflow } from './entities/workflow.entity';

@Injectable()
export class WorkflowsInboxProcessor {
  private readonly logger = new Logger(WorkflowsInboxProcessor.name);

  constructor(private readonly inboxService: InboxService) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async processInboxMessages() {
    this.logger.debug('Processing inbox messages');

    await this.inboxService.processInboxMessages(
      (messages, manager) => {
        return Promise.all(
          messages.map((message) => {
            if (message.pattern === 'workflows.create') {
              return this.createWorkflow(message, manager);
            }
          }),
        );
      },
      { take: 100 },
    );
  }

  private async createWorkflow(message: Inbox, manager: EntityManager) {
    const workflowsRepository = manager.getRepository(Workflow);

    const workflow = workflowsRepository.create({
      ...message.payload,
    } as DeepPartial<Workflow>);
    const newWorkflowEntity = await workflowsRepository.save(workflow);
    this.logger.debug(
      `Created workflow with id ${newWorkflowEntity.id} for building ${newWorkflowEntity.buildingId}`,
    );

    await manager.update(Inbox, message.id, {
      status: 'processed',
    });
  }
}

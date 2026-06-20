import { Worker } from 'bullmq';
import { redisConnectionOptions } from '../../config/redis';
import { telegramService } from '../../services/telegram.service';
import { logger } from '../../utils/logger';
import { QUEUE_NAMES, type NotificationJobData } from '../queues';

export function startNotificationWorker() {
  const worker = new Worker<NotificationJobData>(
    QUEUE_NAMES.NOTIFICATIONS,
    async (job) => {
      logger.info({ jobId: job.id, type: job.data.type }, 'Processing notification job');

      switch (job.data.type) {
        case 'APPOINTMENT_BOOKED': {
          await telegramService.notifyDoctorNewAppointment({
            doctorTelegramChatId: job.data.doctorTelegramChatId,
            doctorName: job.data.doctorName,
            patientName: job.data.patientName,
            scheduledAt: job.data.scheduledAt,
            notes: job.data.notes,
          });
          break;
        }

        default:
          logger.warn({ type: (job.data as any).type }, 'Unknown notification job type');
      }
    },
    {
      connection: redisConnectionOptions,
      concurrency: 5,
    }
  );

  worker.on('completed', (job) => {
    logger.info({ jobId: job.id }, 'Notification job completed');
  });

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err }, 'Notification job failed');
  });

  logger.info('Notification worker started');
  return worker;
}
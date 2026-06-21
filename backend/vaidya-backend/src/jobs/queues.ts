import { Queue } from 'bullmq';
import { redisConnectionOptions } from '../config/redis';

export const QUEUE_NAMES = {
  NOTIFICATIONS: 'notifications',
  OUTBREAK: 'outbreak',
} as const;

export interface NotificationJobData {
  type: 'APPOINTMENT_BOOKED';
  appointmentId: string;
  doctorTelegramChatId: string | null;
  doctorName: string;
  patientName: string;
  scheduledAt: string;
  notes?: string;
}

export interface OutbreakJobData {
  type: 'CHECK_OUTBREAK';
  villageId: string;
  symptom: string;
}

export const notificationQueue = new Queue<NotificationJobData>(
  QUEUE_NAMES.NOTIFICATIONS,
  {
    connection: redisConnectionOptions,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: 100,
      removeOnFail: 50,
    },
  }
);

export const outbreakQueue = new Queue<OutbreakJobData>(
  QUEUE_NAMES.OUTBREAK,
  {
    connection: redisConnectionOptions,
    defaultJobOptions: {
      attempts: 2,
      backoff: { type: 'fixed', delay: 5000 },
      removeOnComplete: 50,
      removeOnFail: 50,
    },
  }
);
import type { FastifyInstance } from 'fastify';
import { authRoutes } from './auth.routes';
import { patientRoutes } from './patient.routes';
import { doctorRoutes } from './doctor.routes';
import { appointmentRoutes } from './appointment.routes';
import { triageRoutes } from './triage.routes';
import { medicineRoutes } from './medicine.routes';
import { outbreakRoutes } from './outbreak.routes';
import { adminRoutes } from './admin.routes';
import { syncRoutes } from './sync.routes';
import { prescriptionRoutes } from './prescription.routes';
import { telegramRoutes } from './telegram.routes';

export async function registerRoutes(app: FastifyInstance) {
  app.register(authRoutes, { prefix: '/auth' });
  app.register(patientRoutes, { prefix: '/patients' });
  app.register(doctorRoutes, { prefix: '/doctors' });
  app.register(appointmentRoutes, { prefix: '/appointments' });
  app.register(triageRoutes, { prefix: '/triage' });
  app.register(medicineRoutes, { prefix: '/medicines' });
  app.register(outbreakRoutes, { prefix: '/outbreak' });
  app.register(adminRoutes, { prefix: '/admin' });
  app.register(syncRoutes, { prefix: '/sync' });
  app.register(prescriptionRoutes, { prefix: '/prescriptions' });
  app.register(telegramRoutes, { prefix: '/telegram' });
}
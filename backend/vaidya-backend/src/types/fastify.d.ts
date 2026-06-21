import '@fastify/jwt';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      userId: string;
      role: 'patient' | 'doctor' | 'pharmacy' | 'asha' | 'admin';
    };
    user: {
      userId: string;
      role: 'patient' | 'doctor' | 'pharmacy' | 'asha' | 'admin';
    };
  }
}
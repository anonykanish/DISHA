import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: SocketIOServer | null = null;

export function initSocketIO(server: HttpServer): SocketIOServer {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    // Join specific hospital or department room
    socket.on('join:hospital', (hospitalId: string) => {
      socket.join(`hospital:${hospitalId}`);
    });

    socket.on('join:department', (departmentId: string) => {
      socket.join(`department:${departmentId}`);
    });

    socket.on('join:visit', (visitId: string) => {
      socket.join(`visit:${visitId}`);
    });
  });

  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}

export function emitQueueUpdate(departmentId: string, data: any): void {
  if (!io) return;
  io.to(`department:${departmentId}`).emit('queue:updated', data);
  io.emit('queue:global_updated', { departmentId, ...data });
}

export function emitTokenCalled(visitId: string, departmentId: string, tokenData: any): void {
  if (!io) return;
  io.to(`visit:${visitId}`).emit('token:called', tokenData);
  io.to(`department:${departmentId}`).emit('token:called', tokenData);
  io.emit('token:public_called', tokenData);
}

export function emitAnnouncement(hospitalId: string, announcement: any): void {
  if (!io) return;
  io.to(`hospital:${hospitalId}`).emit('announcement:new', announcement);
  io.emit('announcement:global', announcement);
}

export function emitJourneyUpdate(visitId: string, journeyData: any): void {
  if (!io) return;
  io.to(`visit:${visitId}`).emit('journey:updated', journeyData);
}

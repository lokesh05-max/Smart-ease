import { Server } from 'socket.io';
import { ParkingSlot } from '../models/ParkingSlot.js';

let ioInstance = null;

export const initSocket = (httpServer) => {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: '*', // Allow development origins
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    },
  });

  ioInstance.on('connection', (socket) => {
    // Client connected
    socket.on('join_location', (locationId) => {
      if (locationId) {
        socket.join(`location_${locationId}`);
      }
    });

    socket.on('leave_location', (locationId) => {
      if (locationId) {
        socket.leave(`location_${locationId}`);
      }
    });

    socket.on('disconnect', () => {
      // Client disconnected
    });
  });

  return ioInstance;
};

export const getIO = () => {
  return ioInstance;
};

export const emitSlotUpdate = (slot) => {
  if (!ioInstance) return;
  ioInstance.emit('slot_updated', slot);
  if (slot.locationId) {
    ioInstance.to(`location_${slot.locationId}`).emit('slot_updated', slot);
  }
};

export const emitReservationUpdate = (event, reservation) => {
  if (!ioInstance) return;
  ioInstance.emit(event, reservation);
  if (reservation.locationId) {
    ioInstance.to(`location_${reservation.locationId}`).emit(event, reservation);
  }
};

export const broadcastOccupancyChange = async (locationId) => {
  if (!ioInstance || !locationId) return;
  try {
    const slots = await ParkingSlot.find({ locationId, active: true });
    const totalSlots = slots.length;
    const availableSlots = slots.filter((s) => s.status === 'Available').length;
    const occupiedSlots = slots.filter((s) => s.status === 'Occupied').length;
    const reservedSlots = slots.filter((s) => s.status === 'Reserved').length;
    const maintenanceSlots = slots.filter((s) => s.status === 'Maintenance').length;

    const payload = {
      locationId,
      totalSlots,
      availableSlots,
      occupiedSlots,
      reservedSlots,
      maintenanceSlots,
      updatedAt: new Date(),
    };

    ioInstance.emit('occupancy_updated', payload);
    ioInstance.to(`location_${locationId}`).emit('occupancy_updated', payload);
  } catch (err) {
    console.error('[SocketManager] Failed to broadcast occupancy change:', err.message);
  }
};

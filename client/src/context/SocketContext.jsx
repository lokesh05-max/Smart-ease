import React, { createContext, useContext, useEffect, useState } from 'react';
import { socket } from '../services/socket';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [lastSlotUpdate, setLastSlotUpdate] = useState(null);
  const [lastReservationUpdate, setLastReservationUpdate] = useState(null);
  const [lastOccupancyUpdate, setLastOccupancyUpdate] = useState(null);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onSlotUpdate(slot) {
      setLastSlotUpdate({ slot, timestamp: Date.now() });
    }

    function onReservationCreated(reservation) {
      setLastReservationUpdate({ type: 'created', reservation, timestamp: Date.now() });
    }

    function onReservationUpdated(reservation) {
      setLastReservationUpdate({ type: 'updated', reservation, timestamp: Date.now() });
    }

    function onOccupancyUpdate(data) {
      setLastOccupancyUpdate({ ...data, timestamp: Date.now() });
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('slot_updated', onSlotUpdate);
    socket.on('reservation_created', onReservationCreated);
    socket.on('reservation_updated', onReservationUpdated);
    socket.on('occupancy_updated', onOccupancyUpdate);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('slot_updated', onSlotUpdate);
      socket.off('reservation_created', onReservationCreated);
      socket.off('reservation_updated', onReservationUpdated);
      socket.off('occupancy_updated', onOccupancyUpdate);
    };
  }, []);

  const joinLocation = (locationId) => {
    if (locationId) {
      socket.emit('join_location', locationId);
    }
  };

  const leaveLocation = (locationId) => {
    if (locationId) {
      socket.emit('leave_location', locationId);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        lastSlotUpdate,
        lastReservationUpdate,
        lastOccupancyUpdate,
        joinLocation,
        leaveLocation,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

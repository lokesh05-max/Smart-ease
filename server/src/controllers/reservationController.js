import { Reservation } from '../models/Reservation.js';
import { ParkingSlot } from '../models/ParkingSlot.js';
import { ParkingLocation } from '../models/ParkingLocation.js';
import { slotMutex } from '../utils/mutex.js';
import { logActivity } from '../utils/logger.js';
import {
  emitSlotUpdate,
  emitReservationUpdate,
  broadcastOccupancyChange,
} from '../sockets/socketManager.js';

// Helper to generate unique booking reference
const generateBookingReference = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  const randomNum = Math.floor(100 + Math.random() * 900);
  return `SPK-${dateStr}-${randomChars}${randomNum}`;
};

export const createReservation = async (req, res, next) => {
  const { locationId, slotId, vehicleType, vehiclePlate, startTime, endTime } = req.body;
  const userId = req.user._id;

  // Validate start and end dates
  const reqStart = new Date(startTime);
  const reqEnd = new Date(endTime);

  if (isNaN(reqStart.getTime()) || isNaN(reqEnd.getTime())) {
    return res.status(400).json({
      success: false,
      message: 'Invalid date/time format for reservation',
    });
  }

  // Allow 5 minutes buffer for slight clock differences if booking starting immediately
  const nowWithBuffer = new Date(Date.now() - 5 * 60 * 1000);
  if (reqStart < nowWithBuffer) {
    return res.status(400).json({
      success: false,
      message: 'Reservation start time cannot be in the past',
    });
  }

  if (reqEnd <= reqStart) {
    return res.status(400).json({
      success: false,
      message: 'Reservation end time must be later than start time',
    });
  }

  const durationMs = reqEnd - reqStart;
  const durationHours = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60)));

  // Acquire mutex for this slotId to prevent concurrent double-booking
  const releaseLock = await slotMutex.acquire(slotId);

  try {
    // 1. Verify Slot exists and is available
    const slot = await ParkingSlot.findById(slotId);
    if (!slot || !slot.active) {
      return res.status(404).json({
        success: false,
        message: 'Parking slot not found or is inactive',
      });
    }

    if (slot.locationId.toString() !== locationId) {
      return res.status(400).json({
        success: false,
        message: 'Selected slot does not belong to the specified parking location',
      });
    }

    if (slot.status === 'Maintenance') {
      return res.status(400).json({
        success: false,
        message: 'This parking slot is currently under maintenance and cannot be booked',
      });
    }

    // 2. Validate overlapping reservations in MongoDB
    // Conflicting booking condition: (existingStart < reqEnd) && (existingEnd > reqStart)
    const conflictingReservation = await Reservation.findOne({
      slotId,
      status: { $in: ['Pending', 'Confirmed'] },
      startTime: { $lt: reqEnd },
      endTime: { $gt: reqStart },
    });

    if (conflictingReservation) {
      return res.status(409).json({
        success: false,
        message: `This slot has already been reserved for the selected time window (Conflicting Booking: ${conflictingReservation.bookingReference}). Please choose another slot or time.`,
        conflict: {
          bookingReference: conflictingReservation.bookingReference,
          startTime: conflictingReservation.startTime,
          endTime: conflictingReservation.endTime,
        },
      });
    }

    // 3. Calculate estimated fee
    const estimatedFee = durationHours * slot.pricePerHour;
    const bookingReference = generateBookingReference();

    // 4. Create the Reservation
    const reservation = await Reservation.create({
      bookingReference,
      userId,
      locationId,
      slotId,
      vehicleType: vehicleType || slot.vehicleType,
      vehiclePlate: (vehiclePlate || '').trim().toUpperCase(),
      startTime: reqStart,
      endTime: reqEnd,
      status: 'Confirmed',
      estimatedFee,
      finalFee: estimatedFee,
    });

    // If reservation is starting right now (within 30 mins), reflect on current slot status
    const isImminent = reqStart <= new Date(Date.now() + 30 * 60 * 1000);
    if (isImminent && slot.status === 'Available') {
      slot.status = 'Reserved';
      await slot.save();
      emitSlotUpdate(slot);
      broadcastOccupancyChange(locationId);
    }

    // Populate for complete response
    await reservation.populate([
      { path: 'locationId', select: 'name address city openingHours' },
      { path: 'slotId', select: 'slotNumber floor vehicleType pricePerHour status' },
      { path: 'userId', select: 'name email phone' },
    ]);

    // Socket broadcast
    emitReservationUpdate('reservation_created', reservation);

    // Activity Log
    await logActivity({
      actorId: userId,
      actorName: req.user.name,
      action: 'RESERVATION_CREATED',
      entityType: 'Reservation',
      entityId: reservation._id,
      details: {
        bookingReference,
        slotNumber: slot.slotNumber,
        estimatedFee,
        durationHours,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Parking slot reserved successfully',
      reservation,
    });
  } catch (error) {
    next(error);
  } finally {
    releaseLock();
  }
};

export const getMyReservations = async (req, res, next) => {
  try {
    const { status } = req.query;
    let query = { userId: req.user._id };

    if (status && status !== 'all') {
      query.status = status;
    }

    const reservations = await Reservation.find(query)
      .populate('locationId', 'name address city')
      .populate('slotId', 'slotNumber floor vehicleType pricePerHour status')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reservations.length,
      reservations,
    });
  } catch (error) {
    next(error);
  }
};

export const getReservationById = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('locationId', 'name address city openingHours')
      .populate('slotId', 'slotNumber floor vehicleType pricePerHour status')
      .populate('userId', 'name email phone');

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    // Enforce authorization: only reservation owner or admin can view
    if (
      req.user.role !== 'admin' &&
      reservation.userId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this reservation',
      });
    }

    res.status(200).json({
      success: true,
      reservation,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelReservation = async (req, res, next) => {
  const { reason } = req.body;
  const reservationId = req.params.id;

  try {
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    // Must be owner or admin
    if (
      req.user.role !== 'admin' &&
      reservation.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to cancel this reservation',
      });
    }

    if (reservation.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This reservation has already been cancelled',
      });
    }

    if (reservation.status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Completed reservations cannot be cancelled',
      });
    }

    if (reservation.checkInTime) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle is currently checked in. Please check out instead of cancelling.',
      });
    }

    reservation.status = 'Cancelled';
    reservation.cancellationReason = reason || 'Cancelled by user';
    await reservation.save();

    // Check if slot status should be restored
    const slot = await ParkingSlot.findById(reservation.slotId);
    if (slot && slot.status === 'Reserved') {
      slot.status = 'Available';
      await slot.save();
      emitSlotUpdate(slot);
      broadcastOccupancyChange(reservation.locationId);
    }

    await reservation.populate([
      { path: 'locationId', select: 'name address city' },
      { path: 'slotId', select: 'slotNumber floor' },
    ]);

    emitReservationUpdate('reservation_updated', reservation);

    await logActivity({
      actorId: req.user._id,
      actorName: req.user.name,
      action: 'RESERVATION_CANCELLED',
      entityType: 'Reservation',
      entityId: reservation._id,
      details: {
        bookingReference: reservation.bookingReference,
        reason: reservation.cancellationReason,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Reservation cancelled successfully',
      reservation,
    });
  } catch (error) {
    next(error);
  }
};

export const checkInReservation = async (req, res, next) => {
  const reservationId = req.params.id;

  try {
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    if (
      req.user.role !== 'admin' &&
      reservation.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to check in for this reservation',
      });
    }

    if (reservation.status !== 'Confirmed') {
      return res.status(400).json({
        success: false,
        message: `Cannot check in. Current reservation status is ${reservation.status}`,
      });
    }

    if (reservation.checkInTime) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle is already checked in',
      });
    }

    const checkInTime = new Date();
    reservation.checkInTime = checkInTime;
    await reservation.save();

    // Update physical/master slot status to 'Occupied'
    const slot = await ParkingSlot.findById(reservation.slotId);
    if (slot) {
      slot.status = 'Occupied';
      await slot.save();
      emitSlotUpdate(slot);
      broadcastOccupancyChange(reservation.locationId);
    }

    await reservation.populate([
      { path: 'locationId', select: 'name address city' },
      { path: 'slotId', select: 'slotNumber floor vehicleType pricePerHour' },
      { path: 'userId', select: 'name email phone' },
    ]);

    emitReservationUpdate('reservation_updated', reservation);

    await logActivity({
      actorId: req.user._id,
      actorName: req.user.name,
      action: 'CHECKED_IN',
      entityType: 'Reservation',
      entityId: reservation._id,
      details: {
        bookingReference: reservation.bookingReference,
        checkInTime,
        slotNumber: slot?.slotNumber,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Checked in successfully. Parking slot is now marked as Occupied.',
      reservation,
    });
  } catch (error) {
    next(error);
  }
};

export const checkOutReservation = async (req, res, next) => {
  const reservationId = req.params.id;

  try {
    const reservation = await Reservation.findById(reservationId).populate('slotId');
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    if (
      req.user.role !== 'admin' &&
      reservation.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to check out for this reservation',
      });
    }

    if (!reservation.checkInTime) {
      return res.status(400).json({
        success: false,
        message: 'Cannot check out before checking in',
      });
    }

    if (reservation.status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'This reservation is already completed',
      });
    }

    const checkOutTime = new Date();
    reservation.checkOutTime = checkOutTime;

    // Calculate actual elapsed duration and final fee
    const durationMs = checkOutTime - reservation.checkInTime;
    const actualHours = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60)));
    const hourlyRate = reservation.slotId?.pricePerHour || 40;
    const calculatedFee = actualHours * hourlyRate;

    // Fee is at least the estimated fee or actual fee if overstayed
    reservation.finalFee = Math.max(calculatedFee, reservation.estimatedFee);
    reservation.status = 'Completed';
    await reservation.save();

    // Release the parking slot back to 'Available'
    const slot = await ParkingSlot.findById(reservation.slotId);
    if (slot && slot.status === 'Occupied') {
      slot.status = 'Available';
      await slot.save();
      emitSlotUpdate(slot);
      broadcastOccupancyChange(reservation.locationId);
    }

    await reservation.populate([
      { path: 'locationId', select: 'name address city' },
      { path: 'slotId', select: 'slotNumber floor vehicleType pricePerHour' },
      { path: 'userId', select: 'name email phone' },
    ]);

    emitReservationUpdate('reservation_updated', reservation);

    await logActivity({
      actorId: req.user._id,
      actorName: req.user.name,
      action: 'CHECKED_OUT',
      entityType: 'Reservation',
      entityId: reservation._id,
      details: {
        bookingReference: reservation.bookingReference,
        checkOutTime,
        actualHours,
        finalFee: reservation.finalFee,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Checked out successfully. Thank you for using ParkEase!',
      reservation,
    });
  } catch (error) {
    next(error);
  }
};

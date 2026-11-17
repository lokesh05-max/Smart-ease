import { ParkingLocation } from '../models/ParkingLocation.js';
import { ParkingSlot } from '../models/ParkingSlot.js';
import { Reservation } from '../models/Reservation.js';
import { logActivity } from '../utils/logger.js';
import { broadcastOccupancyChange } from '../sockets/socketManager.js';

export const getLocations = async (req, res, next) => {
  try {
    const { search, vehicleType } = req.query;
    let query = { active: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }

    if (vehicleType) {
      query.supportedVehicleTypes = vehicleType;
    }

    const locations = await ParkingLocation.find(query).lean();

    // Fetch slot stats for each location
    const locationsWithStats = await Promise.all(
      locations.map(async (loc) => {
        const slots = await ParkingSlot.find({ locationId: loc._id, active: true }).lean();
        const totalSlots = slots.length;
        const availableSlots = slots.filter((s) => s.status === 'Available').length;
        const occupiedSlots = slots.filter((s) => s.status === 'Occupied').length;
        const reservedSlots = slots.filter((s) => s.status === 'Reserved').length;
        const maintenanceSlots = slots.filter((s) => s.status === 'Maintenance').length;

        const prices = slots.map((s) => s.pricePerHour).filter(Boolean);
        const minPrice = prices.length ? Math.min(...prices) : loc.baseHourlyRate || 40;

        return {
          ...loc,
          stats: {
            totalSlots,
            availableSlots,
            occupiedSlots,
            reservedSlots,
            maintenanceSlots,
            minPrice,
          },
        };
      })
    );

    res.status(200).json({
      success: true,
      count: locationsWithStats.length,
      locations: locationsWithStats,
    });
  } catch (error) {
    next(error);
  }
};

export const getLocationById = async (req, res, next) => {
  try {
    const location = await ParkingLocation.findById(req.params.id).lean();
    if (!location) {
      return res.status(404).json({ success: false, message: 'Parking location not found' });
    }

    const slots = await ParkingSlot.find({ locationId: location._id, active: true }).sort({ slotNumber: 1 }).lean();
    const totalSlots = slots.length;
    const availableSlots = slots.filter((s) => s.status === 'Available').length;
    const occupiedSlots = slots.filter((s) => s.status === 'Occupied').length;
    const reservedSlots = slots.filter((s) => s.status === 'Reserved').length;
    const maintenanceSlots = slots.filter((s) => s.status === 'Maintenance').length;

    res.status(200).json({
      success: true,
      location: {
        ...location,
        slots,
        stats: {
          totalSlots,
          availableSlots,
          occupiedSlots,
          reservedSlots,
          maintenanceSlots,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getLocationSlots = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { vehicleType } = req.query;

    let filter = { locationId: id, active: true };
    if (vehicleType) {
      filter.vehicleType = vehicleType;
    }

    const slots = await ParkingSlot.find(filter).sort({ slotNumber: 1 }).lean();

    res.status(200).json({
      success: true,
      count: slots.length,
      slots,
    });
  } catch (error) {
    next(error);
  }
};

export const checkSlotAvailability = async (req, res, next) => {
  try {
    const { locationId, startTime, endTime, vehicleType } = req.query;

    if (!locationId) {
      return res.status(400).json({ success: false, message: 'locationId is required' });
    }

    let slotQuery = { locationId, active: true };
    if (vehicleType) {
      slotQuery.vehicleType = vehicleType;
    }

    const allSlots = await ParkingSlot.find(slotQuery).sort({ slotNumber: 1 }).lean();

    // If specific time range is requested, evaluate time-overlap conflicts
    if (startTime && endTime) {
      const parsedStart = new Date(startTime);
      const parsedEnd = new Date(endTime);

      if (isNaN(parsedStart.getTime()) || isNaN(parsedEnd.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid startTime or endTime date format' });
      }

      if (parsedStart >= parsedEnd) {
        return res.status(400).json({ success: false, message: 'startTime must be earlier than endTime' });
      }

      // Find all overlapping active reservations
      // Overlap condition: (existingStart < requestedEnd) && (existingEnd > requestedStart)
      const overlappingReservations = await Reservation.find({
        locationId,
        status: { $in: ['Pending', 'Confirmed'] },
        startTime: { $lt: parsedEnd },
        endTime: { $gt: parsedStart },
      }).lean();

      const bookedSlotMap = new Map();
      overlappingReservations.forEach((r) => {
        bookedSlotMap.set(r.slotId.toString(), r);
      });

      const slotsWithEffectiveStatus = allSlots.map((slot) => {
        const slotIdStr = slot._id.toString();
        const activeRes = bookedSlotMap.get(slotIdStr);

        let effectiveStatus = slot.status;
        let isAvailableForWindow = true;

        if (slot.status === 'Maintenance') {
          effectiveStatus = 'Maintenance';
          isAvailableForWindow = false;
        } else if (activeRes) {
          effectiveStatus = activeRes.checkInTime ? 'Occupied' : 'Reserved';
          isAvailableForWindow = false;
        } else {
          // If master slot was flagged occupied right now, check if current time overlaps
          const now = new Date();
          if (slot.status === 'Occupied' && parsedStart <= now && parsedEnd >= now) {
            effectiveStatus = 'Occupied';
            isAvailableForWindow = false;
          } else {
            effectiveStatus = 'Available';
            isAvailableForWindow = true;
          }
        }

        return {
          ...slot,
          effectiveStatus,
          isAvailableForWindow,
          overlappingBooking: activeRes
            ? {
                bookingReference: activeRes.bookingReference,
                startTime: activeRes.startTime,
                endTime: activeRes.endTime,
              }
            : null,
        };
      });

      return res.status(200).json({
        success: true,
        locationId,
        startTime: parsedStart,
        endTime: parsedEnd,
        slots: slotsWithEffectiveStatus,
        availableCount: slotsWithEffectiveStatus.filter((s) => s.isAvailableForWindow).length,
        totalCount: slotsWithEffectiveStatus.length,
      });
    }

    // If no time window provided, return current master status
    res.status(200).json({
      success: true,
      locationId,
      slots: allSlots.map((s) => ({
        ...s,
        effectiveStatus: s.status,
        isAvailableForWindow: s.status === 'Available',
      })),
      availableCount: allSlots.filter((s) => s.status === 'Available').length,
      totalCount: allSlots.length,
    });
  } catch (error) {
    next(error);
  }
};

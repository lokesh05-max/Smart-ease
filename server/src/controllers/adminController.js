import { ParkingLocation } from '../models/ParkingLocation.js';
import { ParkingSlot } from '../models/ParkingSlot.js';
import { Reservation } from '../models/Reservation.js';
import { User } from '../models/User.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { logActivity } from '../utils/logger.js';
import {
  emitSlotUpdate,
  emitReservationUpdate,
  broadcastOccupancyChange,
} from '../sockets/socketManager.js';

// GET /api/admin/dashboard
export const getAdminDashboardMetrics = async (req, res, next) => {
  try {
    const [locationsCount, slots, reservations, usersCount, recentLogs, recentReservations] =
      await Promise.all([
        ParkingLocation.countDocuments({ active: true }),
        ParkingSlot.find({ active: true }).lean(),
        Reservation.find().lean(),
        User.countDocuments(),
        ActivityLog.find().sort({ timestamp: -1 }).limit(10).lean(),
        Reservation.find()
          .populate('locationId', 'name')
          .populate('slotId', 'slotNumber')
          .populate('userId', 'name email')
          .sort({ createdAt: -1 })
          .limit(8)
          .lean(),
      ]);

    const totalSlots = slots.length;
    const availableSlots = slots.filter((s) => s.status === 'Available').length;
    const occupiedSlots = slots.filter((s) => s.status === 'Occupied').length;
    const reservedSlots = slots.filter((s) => s.status === 'Reserved').length;
    const maintenanceSlots = slots.filter((s) => s.status === 'Maintenance').length;

    const totalRevenue = reservations.reduce((acc, curr) => {
      if (curr.status === 'Completed') return acc + (curr.finalFee || 0);
      if (curr.status === 'Confirmed') return acc + (curr.estimatedFee || 0);
      return acc;
    }, 0);

    const activeBookings = reservations.filter((r) => r.status === 'Confirmed').length;
    const completedBookings = reservations.filter((r) => r.status === 'Completed').length;
    const cancelledBookings = reservations.filter((r) => r.status === 'Cancelled').length;

    // Per-location breakdown
    const locations = await ParkingLocation.find({ active: true }).lean();
    const locationStats = locations.map((loc) => {
      const locSlots = slots.filter((s) => s.locationId.toString() === loc._id.toString());
      const total = locSlots.length;
      const occupied = locSlots.filter((s) => s.status === 'Occupied').length;
      const reserved = locSlots.filter((s) => s.status === 'Reserved').length;
      const available = locSlots.filter((s) => s.status === 'Available').length;
      const occupancyRate = total > 0 ? Math.round(((occupied + reserved) / total) * 100) : 0;

      return {
        id: loc._id,
        name: loc.name,
        city: loc.city,
        total,
        occupied,
        reserved,
        available,
        occupancyRate,
      };
    });

    res.status(200).json({
      success: true,
      metrics: {
        locationsCount,
        usersCount,
        totalSlots,
        availableSlots,
        occupiedSlots,
        reservedSlots,
        maintenanceSlots,
        totalRevenue,
        totalReservations: reservations.length,
        activeBookings,
        completedBookings,
        cancelledBookings,
      },
      locationStats,
      recentLogs,
      recentReservations,
    });
  } catch (error) {
    next(error);
  }
};

// Location CRUD
export const createLocation = async (req, res, next) => {
  try {
    const location = await ParkingLocation.create(req.body);

    await logActivity({
      actorId: req.user._id,
      actorName: req.user.name,
      action: 'LOCATION_CREATED',
      entityType: 'ParkingLocation',
      entityId: location._id,
      details: { name: location.name },
    });

    res.status(201).json({
      success: true,
      message: 'Parking location created successfully',
      location,
    });
  } catch (error) {
    next(error);
  }
};

export const updateLocation = async (req, res, next) => {
  try {
    const location = await ParkingLocation.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!location) {
      return res.status(404).json({ success: false, message: 'Parking location not found' });
    }

    await logActivity({
      actorId: req.user._id,
      actorName: req.user.name,
      action: 'LOCATION_UPDATED',
      entityType: 'ParkingLocation',
      entityId: location._id,
      details: req.body,
    });

    res.status(200).json({
      success: true,
      message: 'Parking location updated successfully',
      location,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteLocation = async (req, res, next) => {
  try {
    const location = await ParkingLocation.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ success: false, message: 'Parking location not found' });
    }

    // Soft delete / deactivate
    location.active = false;
    await location.save();

    // Also deactivate slots
    await ParkingSlot.updateMany({ locationId: location._id }, { active: false });

    await logActivity({
      actorId: req.user._id,
      actorName: req.user.name,
      action: 'LOCATION_DELETED',
      entityType: 'ParkingLocation',
      entityId: location._id,
      details: { name: location.name },
    });

    res.status(200).json({
      success: true,
      message: 'Parking location and associated slots deactivated',
    });
  } catch (error) {
    next(error);
  }
};

// Slot CRUD
export const createSlot = async (req, res, next) => {
  try {
    const { locationId, slotNumber, floor, vehicleType, pricePerHour, status } = req.body;

    const existingSlot = await ParkingSlot.findOne({
      locationId,
      slotNumber: slotNumber.toUpperCase(),
    });

    if (existingSlot) {
      return res.status(409).json({
        success: false,
        message: `Slot '${slotNumber}' already exists at this location`,
      });
    }

    const slot = await ParkingSlot.create({
      locationId,
      slotNumber: slotNumber.toUpperCase(),
      floor: floor || 'Ground Level',
      vehicleType: vehicleType || 'Car',
      pricePerHour: Number(pricePerHour) || 40,
      status: status || 'Available',
    });

    emitSlotUpdate(slot);
    broadcastOccupancyChange(locationId);

    await logActivity({
      actorId: req.user._id,
      actorName: req.user.name,
      action: 'SLOT_CREATED',
      entityType: 'ParkingSlot',
      entityId: slot._id,
      details: { slotNumber: slot.slotNumber, locationId },
    });

    res.status(201).json({
      success: true,
      message: 'Parking slot created successfully',
      slot,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSlot = async (req, res, next) => {
  try {
    const slot = await ParkingSlot.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Parking slot not found' });
    }

    const oldStatus = slot.status;
    const { slotNumber, vehicleType, pricePerHour, status, floor, active } = req.body;

    if (slotNumber && slotNumber.toUpperCase() !== slot.slotNumber) {
      const duplicate = await ParkingSlot.findOne({
        locationId: slot.locationId,
        slotNumber: slotNumber.toUpperCase(),
        _id: { $ne: slot._id },
      });
      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: `Slot '${slotNumber}' already exists at this location`,
        });
      }
      slot.slotNumber = slotNumber.toUpperCase();
    }

    if (vehicleType) slot.vehicleType = vehicleType;
    if (pricePerHour !== undefined) slot.pricePerHour = Number(pricePerHour);
    if (floor !== undefined) slot.floor = floor;
    if (active !== undefined) slot.active = active;
    if (status) slot.status = status;

    await slot.save();

    // Broadcast instant update if status changed or modified
    emitSlotUpdate(slot);
    broadcastOccupancyChange(slot.locationId);

    await logActivity({
      actorId: req.user._id,
      actorName: req.user.name,
      action: 'SLOT_UPDATED',
      entityType: 'ParkingSlot',
      entityId: slot._id,
      details: { slotNumber: slot.slotNumber, oldStatus, newStatus: slot.status },
    });

    res.status(200).json({
      success: true,
      message: 'Parking slot updated successfully',
      slot,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSlot = async (req, res, next) => {
  try {
    const slot = await ParkingSlot.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Parking slot not found' });
    }

    const locationId = slot.locationId;
    await ParkingSlot.findByIdAndDelete(req.params.id);

    broadcastOccupancyChange(locationId);

    await logActivity({
      actorId: req.user._id,
      actorName: req.user.name,
      action: 'SLOT_DELETED',
      entityType: 'ParkingSlot',
      entityId: slot._id,
      details: { slotNumber: slot.slotNumber },
    });

    res.status(200).json({
      success: true,
      message: 'Parking slot deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Reservations search & management
export const getAllReservations = async (req, res, next) => {
  try {
    const { search, status, locationId } = req.query;
    let query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (locationId) {
      query.locationId = locationId;
    }

    let reservations = await Reservation.find(query)
      .populate('locationId', 'name address city')
      .populate('slotId', 'slotNumber floor vehicleType')
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    if (search) {
      const term = search.toLowerCase();
      reservations = reservations.filter((r) => {
        const refMatch = r.bookingReference?.toLowerCase().includes(term);
        const userMatch = r.userId?.name?.toLowerCase().includes(term) || r.userId?.email?.toLowerCase().includes(term);
        const slotMatch = r.slotId?.slotNumber?.toLowerCase().includes(term);
        return refMatch || userMatch || slotMatch;
      });
    }

    res.status(200).json({
      success: true,
      count: reservations.length,
      reservations,
    });
  } catch (error) {
    next(error);
  }
};

// User management
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 }).lean();

    const usersWithStats = await Promise.all(
      users.map(async (u) => {
        const bookingsCount = await Reservation.countDocuments({ userId: u._id });
        return {
          ...u,
          bookingsCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: usersWithStats.length,
      users: usersWithStats,
    });
  } catch (error) {
    next(error);
  }
};

// Reports and Analytics
export const getAdminReports = async (req, res, next) => {
  try {
    const reservations = await Reservation.find().lean();
    const slots = await ParkingSlot.find({ active: true }).lean();
    const locations = await ParkingLocation.find({ active: true }).lean();

    // 1. Vehicle Type breakdown
    const vehicleDistribution = {
      Car: reservations.filter((r) => r.vehicleType === 'Car').length,
      Bike: reservations.filter((r) => r.vehicleType === 'Bike').length,
      SUV: reservations.filter((r) => r.vehicleType === 'SUV').length,
      EV: reservations.filter((r) => r.vehicleType === 'EV').length,
    };

    const vehicleChartData = Object.entries(vehicleDistribution).map(([name, count]) => ({
      name,
      count,
    }));

    // 2. Revenue & Bookings over last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

      const dayReservations = reservations.filter(
        (r) => r.createdAt && new Date(r.createdAt).toISOString().slice(0, 10) === dateStr
      );

      const dayRevenue = dayReservations.reduce((sum, r) => {
        if (r.status === 'Completed') return sum + (r.finalFee || 0);
        if (r.status === 'Confirmed') return sum + (r.estimatedFee || 0);
        return sum;
      }, 0);

      last7Days.push({
        date: dateStr,
        day: dayName,
        bookings: dayReservations.length,
        revenue: dayRevenue,
      });
    }

    // 3. Location occupancy comparison
    const locationComparison = locations.map((loc) => {
      const locSlots = slots.filter((s) => s.locationId.toString() === loc._id.toString());
      const total = locSlots.length;
      const occupied = locSlots.filter((s) => s.status === 'Occupied').length;
      const reserved = locSlots.filter((s) => s.status === 'Reserved').length;
      const available = locSlots.filter((s) => s.status === 'Available').length;

      return {
        name: loc.name,
        total,
        occupied,
        reserved,
        available,
        occupancyRate: total > 0 ? Math.round(((occupied + reserved) / total) * 100) : 0,
      };
    });

    res.status(200).json({
      success: true,
      reports: {
        last7Days,
        vehicleChartData,
        locationComparison,
        summary: {
          totalBookings: reservations.length,
          totalRevenue: last7Days.reduce((a, b) => a + b.revenue, 0),
          averagePerDay: Math.round(reservations.length / 7),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

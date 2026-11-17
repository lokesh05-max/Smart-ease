import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../src/models/User.js';
import { ParkingLocation } from '../src/models/ParkingLocation.js';
import { ParkingSlot } from '../src/models/ParkingSlot.js';
import { Reservation } from '../src/models/Reservation.js';
import { ActivityLog } from '../src/models/ActivityLog.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_parking_system';

export const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('[Seed] Connected.');

    // Clear old data
    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      ParkingLocation.deleteMany({}),
      ParkingSlot.deleteMany({}),
      Reservation.deleteMany({}),
      ActivityLog.deleteMany({}),
    ]);

    // 1. Create Users
    console.log('[Seed] Creating demo accounts...');
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash('Admin@123', salt);
    const userPasswordHash = await bcrypt.hash('User@123', salt);

    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@smartparking.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
      phone: '+1 (555) 019-2831',
    });

    const user1 = await User.create({
      name: 'Alex Johnson',
      email: 'user@smartparking.com',
      passwordHash: userPasswordHash,
      role: 'user',
      phone: '+1 (555) 014-9922',
    });

    const user2 = await User.create({
      name: 'Sarah Miller',
      email: 'sarah@smartparking.com',
      passwordHash: userPasswordHash,
      role: 'user',
      phone: '+1 (555) 018-4411',
    });

    console.log(`[Seed] Created ${3} users.`);

    // 2. Create Parking Locations
    console.log('[Seed] Creating parking locations...');
    const loc1 = await ParkingLocation.create({
      name: 'Metro Central Hub',
      address: '100 Grand Avenue, Financial District',
      city: 'Downtown Metro',
      description:
        'Multi-level smart parking facility equipped with 150kW fast EV chargers, automated number plate recognition, and 24/7 manned security.',
      openingHours: '24/7 Operations',
      supportedVehicleTypes: ['Car', 'SUV', 'EV', 'Bike'],
      baseHourlyRate: 50,
      active: true,
      image: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80',
    });

    const loc2 = await ParkingLocation.create({
      name: 'Tech City Business Park',
      address: '450 Innovation Parkway, Tower B',
      city: 'Silicon Corridor',
      description:
        'Covered executive parking hub right beside corporate tech towers with dedicated elevator access, reserved motorcycle bays, and smart guidance.',
      openingHours: '06:00 AM - 11:30 PM',
      supportedVehicleTypes: ['Car', 'SUV', 'Bike'],
      baseHourlyRate: 35,
      active: true,
      image: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80',
    });

    const loc3 = await ParkingLocation.create({
      name: 'Grand Galleria & Transit Plaza',
      address: '820 Promenade Way, Shopping Complex',
      city: 'Westside Boulevard',
      description:
        'Spacious lifestyle retail and transit connector parking terminal with wide stalls, wheelchair accessible ramps, and priority green vehicle spots.',
      openingHours: '07:00 AM - 12:00 AM',
      supportedVehicleTypes: ['Car', 'SUV', 'EV'],
      baseHourlyRate: 40,
      active: true,
      image: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=800&q=80',
    });

    console.log(`[Seed] Created 3 locations.`);

    // 3. Create Slots
    console.log('[Seed] Generating parking slots...');
    const slotsData = [];

    // Metro Central: 14 slots
    const metroConfig = [
      { slotNumber: 'A-01', floor: 'Level 1', vehicleType: 'Car', pricePerHour: 50, status: 'Available' },
      { slotNumber: 'A-02', floor: 'Level 1', vehicleType: 'Car', pricePerHour: 50, status: 'Occupied' },
      { slotNumber: 'A-03', floor: 'Level 1', vehicleType: 'Car', pricePerHour: 50, status: 'Reserved' },
      { slotNumber: 'A-04', floor: 'Level 1', vehicleType: 'Car', pricePerHour: 50, status: 'Available' },
      { slotNumber: 'A-05', floor: 'Level 1', vehicleType: 'EV', pricePerHour: 60, status: 'Available' },
      { slotNumber: 'A-06', floor: 'Level 1', vehicleType: 'EV', pricePerHour: 60, status: 'Occupied' },
      { slotNumber: 'A-07', floor: 'Level 1', vehicleType: 'SUV', pricePerHour: 55, status: 'Available' },
      { slotNumber: 'A-08', floor: 'Level 1', vehicleType: 'SUV', pricePerHour: 55, status: 'Available' },
      { slotNumber: 'A-09', floor: 'Level 2', vehicleType: 'Bike', pricePerHour: 25, status: 'Available' },
      { slotNumber: 'A-10', floor: 'Level 2', vehicleType: 'Bike', pricePerHour: 25, status: 'Available' },
      { slotNumber: 'A-11', floor: 'Level 2', vehicleType: 'Car', pricePerHour: 50, status: 'Available' },
      { slotNumber: 'A-12', floor: 'Level 2', vehicleType: 'Car', pricePerHour: 50, status: 'Available' },
      { slotNumber: 'A-13', floor: 'Level 2', vehicleType: 'SUV', pricePerHour: 55, status: 'Maintenance' },
      { slotNumber: 'A-14', floor: 'Level 2', vehicleType: 'Car', pricePerHour: 50, status: 'Available' },
    ];

    metroConfig.forEach((s) => {
      slotsData.push({ ...s, locationId: loc1._id, active: true });
    });

    // Tech City: 10 slots
    const techConfig = [
      { slotNumber: 'B-01', floor: 'Ground Bay', vehicleType: 'Car', pricePerHour: 35, status: 'Available' },
      { slotNumber: 'B-02', floor: 'Ground Bay', vehicleType: 'Car', pricePerHour: 35, status: 'Available' },
      { slotNumber: 'B-03', floor: 'Ground Bay', vehicleType: 'SUV', pricePerHour: 40, status: 'Occupied' },
      { slotNumber: 'B-04', floor: 'Ground Bay', vehicleType: 'SUV', pricePerHour: 40, status: 'Available' },
      { slotNumber: 'B-05', floor: 'Ground Bay', vehicleType: 'Bike', pricePerHour: 20, status: 'Available' },
      { slotNumber: 'B-06', floor: 'Ground Bay', vehicleType: 'Bike', pricePerHour: 20, status: 'Available' },
      { slotNumber: 'B-07', floor: 'Basement 1', vehicleType: 'Car', pricePerHour: 35, status: 'Available' },
      { slotNumber: 'B-08', floor: 'Basement 1', vehicleType: 'Car', pricePerHour: 35, status: 'Available' },
      { slotNumber: 'B-09', floor: 'Basement 1', vehicleType: 'Car', pricePerHour: 35, status: 'Reserved' },
      { slotNumber: 'B-10', floor: 'Basement 1', vehicleType: 'SUV', pricePerHour: 40, status: 'Available' },
    ];

    techConfig.forEach((s) => {
      slotsData.push({ ...s, locationId: loc2._id, active: true });
    });

    // Galleria: 10 slots
    const galleriaConfig = [
      { slotNumber: 'C-01', floor: 'Plaza Deck', vehicleType: 'Car', pricePerHour: 40, status: 'Available' },
      { slotNumber: 'C-02', floor: 'Plaza Deck', vehicleType: 'Car', pricePerHour: 40, status: 'Available' },
      { slotNumber: 'C-03', floor: 'Plaza Deck', vehicleType: 'EV', pricePerHour: 50, status: 'Occupied' },
      { slotNumber: 'C-04', floor: 'Plaza Deck', vehicleType: 'EV', pricePerHour: 50, status: 'Available' },
      { slotNumber: 'C-05', floor: 'Plaza Deck', vehicleType: 'SUV', pricePerHour: 45, status: 'Available' },
      { slotNumber: 'C-06', floor: 'Deck B', vehicleType: 'Car', pricePerHour: 40, status: 'Available' },
      { slotNumber: 'C-07', floor: 'Deck B', vehicleType: 'Car', pricePerHour: 40, status: 'Available' },
      { slotNumber: 'C-08', floor: 'Deck B', vehicleType: 'Car', pricePerHour: 40, status: 'Available' },
      { slotNumber: 'C-09', floor: 'Deck B', vehicleType: 'SUV', pricePerHour: 45, status: 'Available' },
      { slotNumber: 'C-10', floor: 'Deck B', vehicleType: 'Car', pricePerHour: 40, status: 'Maintenance' },
    ];

    galleriaConfig.forEach((s) => {
      slotsData.push({ ...s, locationId: loc3._id, active: true });
    });

    const createdSlots = await ParkingSlot.insertMany(slotsData);
    console.log(`[Seed] Created ${createdSlots.length} parking slots.`);

    // 4. Create Sample Reservations
    console.log('[Seed] Creating sample reservations & history...');
    const now = new Date();

    const sampleRes = [
      // 1. Completed reservation from yesterday (User 1)
      {
        bookingReference: 'SPK-20261011-HIST01',
        userId: user1._id,
        locationId: loc1._id,
        slotId: createdSlots.find((s) => s.slotNumber === 'A-01')._id,
        vehicleType: 'Car',
        vehiclePlate: 'DL-01-AB-1234',
        startTime: new Date(now.getTime() - 26 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() - 23 * 60 * 60 * 1000),
        checkInTime: new Date(now.getTime() - 26 * 60 * 60 * 1000),
        checkOutTime: new Date(now.getTime() - 23 * 60 * 60 * 1000),
        status: 'Completed',
        estimatedFee: 150,
        finalFee: 150,
      },
      // 2. Currently Occupied slot (User 1 checked in 45 minutes ago)
      {
        bookingReference: 'SPK-20261012-CURR02',
        userId: user1._id,
        locationId: loc1._id,
        slotId: createdSlots.find((s) => s.slotNumber === 'A-02')._id,
        vehicleType: 'Car',
        vehiclePlate: 'DL-01-AB-1234',
        startTime: new Date(now.getTime() - 45 * 60 * 1000),
        endTime: new Date(now.getTime() + 135 * 60 * 1000),
        checkInTime: new Date(now.getTime() - 45 * 60 * 1000),
        checkOutTime: null,
        status: 'Confirmed',
        estimatedFee: 150,
        finalFee: 150,
      },
      // 3. Upcoming Confirmed reservation (User 2)
      {
        bookingReference: 'SPK-20261012-UPCM03',
        userId: user2._id,
        locationId: loc1._id,
        slotId: createdSlots.find((s) => s.slotNumber === 'A-03')._id,
        vehicleType: 'Car',
        vehiclePlate: 'MH-12-CD-5678',
        startTime: new Date(now.getTime() + 120 * 60 * 1000),
        endTime: new Date(now.getTime() + 240 * 60 * 1000),
        checkInTime: null,
        checkOutTime: null,
        status: 'Confirmed',
        estimatedFee: 100,
        finalFee: 100,
      },
      // 4. Cancelled reservation (User 2)
      {
        bookingReference: 'SPK-20261010-CANC04',
        userId: user2._id,
        locationId: loc2._id,
        slotId: createdSlots.find((s) => s.slotNumber === 'B-09')._id,
        vehicleType: 'Car',
        vehiclePlate: 'MH-12-CD-5678',
        startTime: new Date(now.getTime() - 48 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() - 45 * 60 * 60 * 1000),
        checkInTime: null,
        checkOutTime: null,
        status: 'Cancelled',
        estimatedFee: 105,
        finalFee: 0,
        cancellationReason: 'Meeting schedule rescheduled',
      },
      // 5. Tech City occupied slot
      {
        bookingReference: 'SPK-20261012-TECH05',
        userId: user2._id,
        locationId: loc2._id,
        slotId: createdSlots.find((s) => s.slotNumber === 'B-03')._id,
        vehicleType: 'SUV',
        vehiclePlate: 'KA-05-EV-9012',
        startTime: new Date(now.getTime() - 30 * 60 * 1000),
        endTime: new Date(now.getTime() + 90 * 60 * 1000),
        checkInTime: new Date(now.getTime() - 30 * 60 * 1000),
        checkOutTime: null,
        status: 'Confirmed',
        estimatedFee: 80,
        finalFee: 80,
      },
    ];

    await Reservation.insertMany(sampleRes);
    console.log(`[Seed] Created ${sampleRes.length} sample reservations.`);

    // 5. Create Activity Logs
    console.log('[Seed] Creating recent activity logs...');
    const sampleLogs = [
      {
        actorId: admin._id,
        actorName: 'System Administrator',
        action: 'SYSTEM_INITIALIZED',
        entityType: 'System',
        details: { message: 'Initialized smart parking environment' },
        timestamp: new Date(now.getTime() - 72 * 60 * 60 * 1000),
      },
      {
        actorId: user1._id,
        actorName: 'Alex Johnson',
        action: 'RESERVATION_CREATED',
        entityType: 'Reservation',
        details: { bookingReference: 'SPK-20261012-CURR02', slotNumber: 'A-02' },
        timestamp: new Date(now.getTime() - 50 * 60 * 1000),
      },
      {
        actorId: user1._id,
        actorName: 'Alex Johnson',
        action: 'CHECKED_IN',
        entityType: 'Reservation',
        details: { bookingReference: 'SPK-20261012-CURR02', slotNumber: 'A-02' },
        timestamp: new Date(now.getTime() - 45 * 60 * 1000),
      },
      {
        actorId: user2._id,
        actorName: 'Sarah Miller',
        action: 'RESERVATION_CREATED',
        entityType: 'Reservation',
        details: { bookingReference: 'SPK-20261012-UPCM03', slotNumber: 'A-03' },
        timestamp: new Date(now.getTime() - 20 * 60 * 1000),
      },
    ];

    await ActivityLog.insertMany(sampleLogs);
    console.log(`[Seed] Created ${sampleLogs.length} activity logs.`);

    console.log('----------------------------------------------------');
    console.log('Database seeding successfully finished!');
    console.log('Demo Credentials:');
    console.log('  Admin: admin@smartparking.com / Admin@123');
    console.log('  User:  user@smartparking.com  / User@123');
    console.log('  User2: sarah@smartparking.com / User@123');
    console.log('----------------------------------------------------');
  } catch (err) {
    console.error('[Seed] Seeding failed:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('[Seed] Disconnected from MongoDB.');
  }
};

seedDatabase()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('[Seed Error]', err);
    process.exit(1);
  });


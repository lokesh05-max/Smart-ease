import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: [true, 'Booking reference is required'],
      unique: true,
      index: true,
      trim: true,
      uppercase: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParkingLocation',
      required: [true, 'Location ID is required'],
      index: true,
    },
    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParkingSlot',
      required: [true, 'Slot ID is required'],
      index: true,
    },
    vehicleType: {
      type: String,
      enum: ['Car', 'Bike', 'SUV', 'EV'],
      required: [true, 'Vehicle type is required'],
    },
    vehiclePlate: {
      type: String,
      trim: true,
      uppercase: true,
      default: '',
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
      index: true,
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
      index: true,
    },
    checkInTime: {
      type: Date,
      default: null,
    },
    checkOutTime: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed', 'No-show'],
      default: 'Confirmed',
      index: true,
    },
    estimatedFee: {
      type: Number,
      required: [true, 'Estimated fee is required'],
      min: 0,
    },
    finalFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    cancellationReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Helpful index to fast query slot availability over time windows
reservationSchema.index({ slotId: 1, status: 1, startTime: 1, endTime: 1 });

export const Reservation = mongoose.model('Reservation', reservationSchema);

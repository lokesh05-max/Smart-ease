import mongoose from 'mongoose';

const parkingSlotSchema = new mongoose.Schema(
  {
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParkingLocation',
      required: [true, 'Location ID is required'],
      index: true,
    },
    slotNumber: {
      type: String,
      required: [true, 'Slot number is required'],
      trim: true,
      uppercase: true,
    },
    floor: {
      type: String,
      default: 'Ground Level',
      trim: true,
    },
    vehicleType: {
      type: String,
      enum: ['Car', 'Bike', 'SUV', 'EV'],
      default: 'Car',
    },
    pricePerHour: {
      type: Number,
      required: [true, 'Price per hour is required'],
      min: [0, 'Price per hour cannot be negative'],
    },
    status: {
      type: String,
      enum: ['Available', 'Reserved', 'Occupied', 'Maintenance'],
      default: 'Available',
      index: true,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index to prevent duplicate slot numbers within the same location
parkingSlotSchema.index({ locationId: 1, slotNumber: 1 }, { unique: true });

export const ParkingSlot = mongoose.model('ParkingSlot', parkingSlotSchema);

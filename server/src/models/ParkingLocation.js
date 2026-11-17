import mongoose from 'mongoose';

const parkingLocationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Location name is required'],
      trim: true,
      maxlength: [120, 'Name cannot exceed 120 characters'],
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    city: {
      type: String,
      default: 'Downtown',
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    openingHours: {
      type: String,
      default: '24/7 Operations',
      trim: true,
    },
    supportedVehicleTypes: {
      type: [String],
      enum: ['Car', 'Bike', 'SUV', 'EV'],
      default: ['Car', 'SUV', 'EV'],
    },
    baseHourlyRate: {
      type: Number,
      default: 40,
      min: [0, 'Hourly rate cannot be negative'],
    },
    image: {
      type: String,
      default: '',
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual property to populate slots count
parkingLocationSchema.virtual('slots', {
  ref: 'ParkingSlot',
  localField: '_id',
  foreignField: 'locationId',
});

export const ParkingLocation = mongoose.model('ParkingLocation', parkingLocationSchema);

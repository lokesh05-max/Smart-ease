import express from 'express';
import { body } from 'express-validator';
import {
  getAdminDashboardMetrics,
  createLocation,
  updateLocation,
  deleteLocation,
  createSlot,
  updateSlot,
  deleteSlot,
  getAllReservations,
  getAllUsers,
  getAdminReports,
} from '../controllers/adminController.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validate.js';

const router = express.Router();

// Enforce both JWT authentication and Admin role authorization
router.use(authenticate, authorizeAdmin);

// Dashboard metrics
router.get('/dashboard', getAdminDashboardMetrics);

// Locations management
router.post(
  '/locations',
  [
    body('name').trim().notEmpty().withMessage('Location name is required'),
    body('address').trim().notEmpty().withMessage('Address is required'),
  ],
  handleValidationErrors,
  createLocation
);
router.patch('/locations/:id', updateLocation);
router.delete('/locations/:id', deleteLocation);

// Slots management
router.post(
  '/slots',
  [
    body('locationId').notEmpty().withMessage('Location ID is required'),
    body('slotNumber').trim().notEmpty().withMessage('Slot number is required'),
    body('pricePerHour').isNumeric().withMessage('Price per hour must be a number'),
  ],
  handleValidationErrors,
  createSlot
);
router.patch('/slots/:id', updateSlot);
router.delete('/slots/:id', deleteSlot);

// Reservations & Users & Reports
router.get('/reservations', getAllReservations);
router.get('/users', getAllUsers);
router.get('/reports', getAdminReports);

export default router;

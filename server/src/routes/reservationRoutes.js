import express from 'express';
import { body } from 'express-validator';
import {
  createReservation,
  getMyReservations,
  getReservationById,
  cancelReservation,
  checkInReservation,
  checkOutReservation,
} from '../controllers/reservationController.js';
import { authenticate } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validate.js';

const router = express.Router();

router.use(authenticate);

router.post(
  '/',
  [
    body('locationId').notEmpty().withMessage('locationId is required'),
    body('slotId').notEmpty().withMessage('slotId is required'),
    body('vehicleType')
      .isIn(['Car', 'Bike', 'SUV', 'EV'])
      .withMessage('Valid vehicleType is required'),
    body('startTime').isISO8601().withMessage('Valid ISO8601 startTime is required'),
    body('endTime').isISO8601().withMessage('Valid ISO8601 endTime is required'),
  ],
  handleValidationErrors,
  createReservation
);

router.get('/my', getMyReservations);
router.get('/:id', getReservationById);
router.patch('/:id/cancel', cancelReservation);
router.post('/:id/check-in', checkInReservation);
router.post('/:id/check-out', checkOutReservation);

export default router;

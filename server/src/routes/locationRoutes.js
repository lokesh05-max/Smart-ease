import express from 'express';
import {
  getLocations,
  getLocationById,
  getLocationSlots,
  checkSlotAvailability,
} from '../controllers/locationController.js';

const router = express.Router();

router.get('/', getLocations);
router.get('/:id', getLocationById);
router.get('/:id/slots', getLocationSlots);

export default router;

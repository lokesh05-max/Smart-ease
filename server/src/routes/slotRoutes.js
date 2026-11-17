import express from 'express';
import { checkSlotAvailability } from '../controllers/locationController.js';

const router = express.Router();

router.get('/availability', checkSlotAvailability);

export default router;

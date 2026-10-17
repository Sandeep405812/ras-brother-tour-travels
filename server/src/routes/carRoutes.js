const express = require('express');
const router = express.Router();
const {
  getAllCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
  getFeaturedCars,
  getMyFleet,
  toggleCarDate,
} = require('../controllers/carController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getAllCars);
router.get('/featured', getFeaturedCars);
router.get('/my-fleet', protect, authorize('owner', 'admin'), getMyFleet);
router.get('/:id', getCarById);
router.post('/', protect, authorize('owner', 'admin'), createCar);
router.put('/:id', protect, authorize('owner', 'admin'), updateCar);
router.put('/:id/toggle-date', protect, authorize('owner', 'admin'), toggleCarDate);
router.delete('/:id', protect, authorize('owner', 'admin'), deleteCar);

module.exports = router;

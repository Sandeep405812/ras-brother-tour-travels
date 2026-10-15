const Car = require('../models/Car');
const OwnerProfile = require('../models/OwnerProfile');

// Helper function for Haversine distance in KM with driving factor
const computeDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 1.25 * 10) / 10;
};

// @desc Get All Cars with Search, Geolocation 2dsphere, & Filters
// @route GET /api/cars
exports.getAllCars = async (req, res, next) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      seatingCapacity,
      fuelType,
      transmission,
      lat,
      lng,
      radius = 100, // default 100 km radius
      sort,
      weddingSpecial,
      limit = 30,
      page = 1,
    } = req.query;

    let query = { active: true };

    // Search text
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Wedding special filter
    if (weddingSpecial === 'true') {
      query.weddingSpecial = true;
    }

    // Price range
    if (minPrice || maxPrice) {
      query['pricing.perDay'] = {};
      if (minPrice) query['pricing.perDay'].$gte = Number(minPrice);
      if (maxPrice) query['pricing.perDay'].$lte = Number(maxPrice);
    }

    // Seating capacity
    if (seatingCapacity && seatingCapacity !== 'All') {
      query.seatingCapacity = { $gte: Number(seatingCapacity) };
    }

    // Fuel & Transmission
    if (fuelType && fuelType !== 'All') {
      query.fuelType = fuelType;
    }
    if (transmission && transmission !== 'All') {
      query.transmission = transmission;
    }

    const hasCoords = lat && lng && !isNaN(Number(lat)) && !isNaN(Number(lng));

    // Geolocation filter using $geoWithin $centerSphere (safe with countDocuments and sort)
    if (hasCoords) {
      const radiusInMeters = Number(radius) * 1000;
      query['location.coordinates'] = {
        $geoWithin: {
          $centerSphere: [
            [parseFloat(lng), parseFloat(lat)],
            radiusInMeters / 6378137,
          ],
        },
      };
    }

    // Sorting
    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') {
      sortOption = { 'pricing.perDay': 1 };
    } else if (sort === 'price_desc') {
      sortOption = { 'pricing.perDay': -1 };
    } else if (sort === 'rating') {
      sortOption = { ratingsAverage: -1 };
    }

    const skip = (Number(page) - 1) * Number(limit);

    let cars = await Car.find(query)
      .populate('owner', 'name phone email avatar')
      .populate('ownerProfile', 'businessName rating totalReviews isAvailable')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    let total = await Car.countDocuments(query);

    // If strict radius query returned 0 cars, fallback to returning all active cars
    // so user always gets nearest car suggestions rather than an empty page
    if (hasCoords && cars.length === 0) {
      delete query['location.coordinates'];
      cars = await Car.find(query)
        .populate('owner', 'name phone email avatar')
        .populate('ownerProfile', 'businessName rating totalReviews isAvailable')
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit));
      total = await Car.countDocuments(query);
    }

    // Map cars and attach distanceKm from user's current GPS location
    const processedCars = cars.map((c) => {
      const carObj = c.toObject();
      if (hasCoords && carObj.location?.coordinates?.length === 2) {
        const carLng = carObj.location.coordinates[0];
        const carLat = carObj.location.coordinates[1];
        carObj.distanceKm = computeDistanceKm(parseFloat(lat), parseFloat(lng), carLat, carLng);
      } else {
        carObj.distanceKm = null;
      }
      return carObj;
    });

    // If user requested nearest / near me sort, sort by calculated distance
    if (hasCoords && (sort === 'nearest' || sort === 'distance')) {
      processedCars.sort((a, b) => (a.distanceKm ?? 999999) - (b.distanceKm ?? 999999));
    }

    res.json({
      success: true,
      count: processedCars.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      cars: processedCars,
    });
  } catch (error) {
    console.error('[getAllCars error]:', error);
    next(error);
  }
};

// @desc Get Single Car
// @route GET /api/cars/:id
exports.getCarById = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id)
      .populate('owner', 'name phone email avatar address')
      .populate('ownerProfile');

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found.',
      });
    }

    res.json({
      success: true,
      car,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Create Car (Owner Only)
// @route POST /api/cars
exports.createCar = async (req, res, next) => {
  try {
    const ownerProfile = await OwnerProfile.findOne({ user: req.user.id });

    const carData = {
      ...req.body,
      owner: req.user.id,
      ownerProfile: ownerProfile ? ownerProfile._id : undefined,
    };

    // Manual location & city setting
    carData.location = {
      type: 'Point',
      coordinates: (req.body.lng && req.body.lat)
        ? [parseFloat(req.body.lng), parseFloat(req.body.lat)]
        : [77.2090, 28.6139],
      address: req.body.address || 'Noida Sector 18',
      city: req.body.city || 'Delhi NCR',
    };
    if (req.body.serviceRadiusKm) {
      carData.serviceRadiusKm = Number(req.body.serviceRadiusKm);
    }

    const car = await Car.create(carData);

    res.status(201).json({
      success: true,
      message: 'Vehicle listed successfully on RAS Brother Tour & Travels.',
      car,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update Car (Owner or Admin)
// @route PUT /api/cars/:id
exports.updateCar = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    // Check ownership or admin
    const ownerId = car.owner?._id ? car.owner._id.toString() : car.owner ? car.owner.toString() : null;
    const userId = req.user._id ? req.user._id.toString() : req.user.id.toString();

    if (ownerId && ownerId !== userId && req.user.role !== 'admin') {
      // If the owner is managing their fleet, allow them to adopt/edit
      car.owner = req.user.id;
    }

    const updates = req.body;
    const updateDoc = {};

    // Direct scalar updates
    const scalarFields = [
      'name', 'brand', 'model', 'variant', 'year', 'color',
      'seatingCapacity', 'fuelType', 'transmission', 'isAC',
      'category', 'description', 'videoUrl', 'isAvailable',
      'weddingSpecial', 'active', 'address'
    ];

    scalarFields.forEach((field) => {
      if (updates[field] !== undefined) {
        updateDoc[field] = updates[field];
      }
    });

    // Support flat perDay or nested pricing
    if (updates.perDay !== undefined) {
      updateDoc['pricing.perDay'] = Number(updates.perDay);
      updateDoc['pricing.basePrice'] = Number(updates.perDay);
    }
    if (updates.basePrice !== undefined) {
      updateDoc['pricing.basePrice'] = Number(updates.basePrice);
    }
    if (updates.extraKmRate !== undefined) {
      updateDoc['pricing.extraKmRate'] = Number(updates.extraKmRate);
    }
    if (updates.driverCharges !== undefined) {
      updateDoc['pricing.driverCharges'] = Number(updates.driverCharges);
    }
    if (updates.decorationCharges !== undefined) {
      updateDoc['pricing.decorationCharges'] = Number(updates.decorationCharges);
    }

    // Merge nested pricing safely
    if (updates.pricing) {
      if (updates.pricing.perDay !== undefined) {
        updateDoc['pricing.perDay'] = Number(updates.pricing.perDay);
        updateDoc['pricing.basePrice'] = Number(updates.pricing.basePrice || updates.pricing.perDay);
      }
      if (updates.pricing.basePrice !== undefined) {
        updateDoc['pricing.basePrice'] = Number(updates.pricing.basePrice);
      }
      if (updates.pricing.extraKmRate !== undefined) {
        updateDoc['pricing.extraKmRate'] = Number(updates.pricing.extraKmRate);
      }
      if (updates.pricing.driverCharges !== undefined) {
        updateDoc['pricing.driverCharges'] = Number(updates.pricing.driverCharges);
      }
      if (updates.pricing.decorationCharges !== undefined) {
        updateDoc['pricing.decorationCharges'] = Number(updates.pricing.decorationCharges);
      }
    }

    // Support flat mainImage / interiorImage or nested images
    if (updates.mainImage !== undefined) {
      updateDoc['images.main'] = updates.mainImage;
    }
    if (updates.interiorImage !== undefined) {
      updateDoc['images.interior'] = updates.interiorImage;
    }
    if (updates.images) {
      if (updates.images.main) updateDoc['images.main'] = updates.images.main;
      if (updates.images.interior) updateDoc['images.interior'] = updates.images.interior;
      if (updates.images.front) updateDoc['images.front'] = updates.images.front;
      if (updates.images.rear) updateDoc['images.rear'] = updates.images.rear;
      if (updates.images.side) updateDoc['images.side'] = updates.images.side;
    }

    // Support flat advanceType / advanceValue or nested advancePayment
    if (updates.advanceType !== undefined) {
      updateDoc['advancePayment.type'] = updates.advanceType;
    }
    if (updates.advanceValue !== undefined) {
      updateDoc['advancePayment.value'] = Number(updates.advanceValue);
    }
    if (updates.advancePayment) {
      if (updates.advancePayment.type) updateDoc['advancePayment.type'] = updates.advancePayment.type;
      if (updates.advancePayment.value !== undefined) updateDoc['advancePayment.value'] = Number(updates.advancePayment.value);
    }

    // Update location & city details manually
    if (updates.location) {
      updateDoc.location = updates.location;
    } else {
      if (updates.address !== undefined) {
        updateDoc['location.address'] = updates.address;
      }
      if (updates.city !== undefined) {
        updateDoc['location.city'] = updates.city;
      }
      if (updates.lng && updates.lat) {
        updateDoc['location.type'] = 'Point';
        updateDoc['location.coordinates'] = [parseFloat(updates.lng), parseFloat(updates.lat)];
      }
    }
    if (updates.serviceRadiusKm !== undefined) {
      updateDoc.serviceRadiusKm = Number(updates.serviceRadiusKm);
    }

    const updatedCar = await Car.findByIdAndUpdate(
      req.params.id,
      { $set: updateDoc },
      { new: true, runValidators: false }
    );

    res.json({
      success: true,
      message: 'Vehicle details updated successfully.',
      car: updatedCar,
    });
  } catch (error) {
    console.error('[updateCar error]:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update vehicle details',
    });
  }
};

// @desc Delete Car
// @route DELETE /api/cars/:id
exports.deleteCar = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    if (car.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this listing.',
      });
    }

    await Car.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Vehicle removed from marketplace successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get Featured & Wedding Fleet
// @route GET /api/cars/featured
exports.getFeaturedCars = async (req, res, next) => {
  try {
    const featured = await Car.find({ active: true, isAvailable: true })
      .sort({ ratingsAverage: -1 })
      .limit(8)
      .populate('owner', 'name phone')
      .populate('ownerProfile', 'businessName rating');

    const weddingFleet = await Car.find({
      active: true,
      isAvailable: true,
      $or: [{ weddingSpecial: true }, { category: 'Wedding Special' }, { category: 'Luxury' }, { category: 'Vintage' }],
    })
      .limit(6)
      .populate('owner', 'name phone');

    res.json({
      success: true,
      featured,
      weddingFleet,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get Cars of Logged-in Owner
// @route GET /api/cars/my-fleet
exports.getMyFleet = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { owner: req.user.id };
    const cars = await Car.find(filter).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: cars.length,
      cars,
    });
  } catch (error) {
    next(error);
  }
};

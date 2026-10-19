const Car = require('../models/Car');
const OwnerProfile = require('../models/OwnerProfile');
const Booking = require('../models/Booking');

// ============================================================
// Helper: Haversine distance in KM
// ============================================================
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

  const c =
    2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c * 10) / 10;
};

// ============================================================
// GET ALL CARS
// GET /api/cars
// ============================================================
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
      radius = 100,
      sort,
      weddingSpecial,
      limit = 30,
      page = 1,
    } = req.query;

    let query = {
      active: true,
    };

    // ========================================================
    // SEARCH
    // ========================================================
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    // ========================================================
    // CATEGORY
    // ========================================================
    if (category && category !== 'All') {
      query.category = category;
    }

    // ========================================================
    // WEDDING SPECIAL
    // ========================================================
    if (weddingSpecial === 'true') {
      query.weddingSpecial = true;
    }

    // ========================================================
    // PRICE FILTER
    // ========================================================
    if (minPrice || maxPrice) {
      query['pricing.perDay'] = {};

      if (minPrice) {
        query['pricing.perDay'].$gte = Number(minPrice);
      }

      if (maxPrice) {
        query['pricing.perDay'].$lte = Number(maxPrice);
      }
    }

    // ========================================================
    // SEATING
    // ========================================================
    if (seatingCapacity && seatingCapacity !== 'All') {
      query.seatingCapacity = {
        $gte: Number(seatingCapacity),
      };
    }

    // ========================================================
    // FUEL
    // ========================================================
    if (fuelType && fuelType !== 'All') {
      query.fuelType = fuelType;
    }

    // ========================================================
    // TRANSMISSION
    // ========================================================
    if (transmission && transmission !== 'All') {
      query.transmission = transmission;
    }

    // ========================================================
    // CUSTOMER LOCATION
    // ========================================================
    const hasCoords =
      lat !== undefined &&
      lng !== undefined &&
      Number.isFinite(Number(lat)) &&
      Number.isFinite(Number(lng));

    // ========================================================
    // RADIUS FILTER
    // ========================================================
    if (hasCoords) {
      const radiusInMeters = Number(radius) * 1000;

      query['location.coordinates'] = {
        $geoWithin: {
          $centerSphere: [
            [Number(lng), Number(lat)],
            radiusInMeters / 6378137,
          ],
        },
      };
    }

    // ========================================================
    // SORTING
    // ========================================================
    let sortOption = {
      createdAt: -1,
    };

    if (sort === 'price_asc') {
      sortOption = {
        'pricing.perDay': 1,
      };
    } else if (sort === 'price_desc') {
      sortOption = {
        'pricing.perDay': -1,
      };
    } else if (sort === 'rating') {
      sortOption = {
        ratingsAverage: -1,
      };
    }

    const skip =
      (Number(page) - 1) * Number(limit);

    // ========================================================
    // FETCH CARS
    // ========================================================
    const cars = await Car.find(query)
      .populate(
        'owner',
        'name phone email avatar'
      )
      .populate(
        'ownerProfile',
        'businessName rating totalReviews isAvailable'
      )
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    // ========================================================
    // PROCESS DISTANCE (Optimized without toObject overhead)
    // ========================================================
    let processedCars = cars.map((carObj) => {

      if (
        hasCoords &&
        carObj.location?.coordinates?.length === 2
      ) {
        const carLng =
          Number(carObj.location.coordinates[0]);

        const carLat =
          Number(carObj.location.coordinates[1]);

        carObj.distanceKm =
          computeDistanceKm(
            Number(lat),
            Number(lng),
            carLat,
            carLng
          );
      } else {
        carObj.distanceKm = null;
      }

      carObj.isUnavailableOnDate = false;
      carObj.unavailableReason = '';

      return carObj;
    });

    // ========================================================
    // ONLY CARS WITHIN RADIUS
    // ========================================================
    if (hasCoords) {
      processedCars =
        processedCars.filter(
          (car) =>
            car.distanceKm !== null &&
            car.distanceKm <= Number(radius)
        );

      processedCars.sort(
        (a, b) =>
          (a.distanceKm ?? 999999) -
          (b.distanceKm ?? 999999)
      );
    }

    // ========================================================
    // DATE AVAILABILITY
    // ========================================================
    if (
      req.query.date &&
      processedCars.length > 0
    ) {
      const travelDateStr =
        String(req.query.date).split('T')[0];

      const travelDate =
        new Date(travelDateStr);

      const startOfDay =
        new Date(travelDate);

      startOfDay.setHours(
        0,
        0,
        0,
        0
      );

      const endOfDay =
        new Date(travelDate);

      endOfDay.setHours(
        23,
        59,
        59,
        999
      );

      // ======================================================
      // EXISTING BOOKINGS
      // ======================================================
      const activeBookings =
        await Booking.find({
          car: {
            $in: processedCars.map(
              (car) => car._id
            ),
          },

          status: {
            $in: [
              'confirmed',
              'in_progress',
              'pending',
            ],
          },

          startDate: {
            $lte: endOfDay,
          },

          endDate: {
            $gte: startOfDay,
          },
        }).select('car');

      const bookedCarIds =
        new Set(
          activeBookings.map(
            (booking) =>
              booking.car.toString()
          )
        );

      // ======================================================
      // MARK UNAVAILABLE CARS
      // ======================================================
      processedCars =
        processedCars.map((carObj) => {
          // Owner blocked date
          if (
            Array.isArray(
              carObj.unavailableDates
            ) &&
            carObj.unavailableDates.includes(
              travelDateStr
            )
          ) {
            carObj.isUnavailableOnDate =
              true;

            carObj.unavailableReason =
              'Not Available (Marked by Owner)';
          }

          // Already booked
          else if (
            bookedCarIds.has(
              carObj._id.toString()
            )
          ) {
            carObj.isUnavailableOnDate =
              true;

            carObj.unavailableReason =
              'Already Booked on this date';
          }

          return carObj;
        });
    }

    // ========================================================
    // RESPONSE
    // ========================================================
    res.json({
      success: true,
      count: processedCars.length,
      total: processedCars.length,
      page: Number(page),

      totalPages:
        Math.ceil(
          processedCars.length /
            Number(limit)
        ) || 1,

      cars: processedCars,
    });
  } catch (error) {
    console.error(
      '[getAllCars error]:',
      error
    );

    next(error);
  }
};

// ============================================================
// GET SINGLE CAR
// GET /api/cars/:id
// ============================================================
exports.getCarById = async (
  req,
  res,
  next
) => {
  try {
    const car =
      await Car.findById(req.params.id)
        .populate(
          'owner',
          'name phone email avatar address'
        )
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

// ============================================================
// CREATE CAR
// POST /api/cars
// ============================================================
exports.createCar = async (
  req,
  res,
  next
) => {
  try {
    const ownerProfile =
      await OwnerProfile.findOne({
        user: req.user.id,
      });

    // ========================================================
    // PER KM RATE
    // ========================================================
    const rawPerKm =
      req.body.perKm ??
      req.body.pricing?.perKm ??
      req.body.extraKmRate;

    const perKm =
      Number(rawPerKm);

    if (
      !Number.isFinite(perKm) ||
      perKm <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Valid per-kilometer rate is required.',
      });
    }

    // ========================================================
    // OTHER PRICING
    // ========================================================
    const basePrice =
      Number(
        req.body.basePrice ??
          req.body.pricing?.basePrice ??
          perKm
      );

    const perDay =
      Number(
        req.body.perDay ??
          req.body.pricing?.perDay ??
          2000
      );

    // ========================================================
    // BASIC CAR DATA
    // ========================================================
    const carData = {
      ...req.body,

      owner: req.user.id,

      ownerProfile:
        ownerProfile
          ? ownerProfile._id
          : undefined,

      brand:
        req.body.brand ||
        'Standard',

      model:
        req.body.model ||
        '2024',

      variant:
        req.body.variant ||
        '',

      year:
        Number(
          req.body.year || 2024
        ),

      color:
        req.body.color ||
        'White',

      seatingCapacity:
        Number(
          req.body.seatingCapacity || 5
        ),

      fuelType:
        req.body.fuelType ||
        'Diesel',

      fuelIncluded:
        req.body.fuelIncluded !==
        undefined
          ? Boolean(
              req.body.fuelIncluded
            )
          : true,

      description:
        req.body.description ||
        'Verified chauffeur driven vehicle.',

      images: {
        main:
          req.body.mainImage ||
          req.body.images?.main ||
          '/brand/ras-logo-primary.svg',

        interior:
          req.body.interiorImage ||
          req.body.images?.interior ||
          '',

        gallery:
          Array.isArray(
            req.body.gallery
          )
            ? req.body.gallery
            : [],
      },

      pricing: {
        perKm,

        extraKmRate:
          perKm,

        basePrice,

        perDay,

        driverCharges: 0,

        nightCharges: 300,

        decorationCharges: 0,
      },

      paymentMethods:
        req.body.paymentMethods ||
        ['cod', 'online'],

      unavailableDates:
        Array.isArray(
          req.body.unavailableDates
        )
          ? req.body.unavailableDates
          : [],
    };

    // ========================================================
    // ACTUAL VEHICLE LOCATION
    // NO HARDCODED LOCATION
    // ========================================================
    const lat =
      Number(req.body.lat);

    const lng =
      Number(req.body.lng);

    const address =
      String(
        req.body.address ||
          req.body.locationAddress ||
          ''
      ).trim();

    const city =
      String(
        req.body.city ||
          address
      ).trim();

    // ========================================================
    // VALIDATE COORDINATES
    // ========================================================
    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Valid vehicle location coordinates are required. Please select the car location on the map or Google location search.',
      });
    }

    // ========================================================
    // VALIDATE ADDRESS
    // ========================================================
    if (!address) {
      return res.status(400).json({
        success: false,
        message:
          'Vehicle location address is required.',
      });
    }

    // ========================================================
    // GEOJSON LOCATION
    // [longitude, latitude]
    // ========================================================
    carData.location = {
      type: 'Point',

      coordinates: [
        lng,
        lat,
      ],

      address,

      city:
        city || address,
    };

    // ========================================================
    // SERVICE RADIUS
    // ========================================================
    if (
      req.body.serviceRadiusKm !==
      undefined
    ) {
      const serviceRadiusKm =
        Number(
          req.body.serviceRadiusKm
        );

      if (
        Number.isFinite(
          serviceRadiusKm
        ) &&
        serviceRadiusKm > 0
      ) {
        carData.serviceRadiusKm =
          serviceRadiusKm;
      }
    }

    // ========================================================
    // SAVE CAR
    // ========================================================
    const car =
      await Car.create(
        carData
      );

    res.status(201).json({
      success: true,

      message:
        'Vehicle listed successfully on RAS Brother Tour & Travels.',

      car,
    });
  } catch (error) {
    console.error(
      '[createCar error]:',
      error
    );

    next(error);
  }
};

// ============================================================
// UPDATE CAR
// PUT /api/cars/:id
// ============================================================
exports.updateCar = async (
  req,
  res,
  next
) => {
  try {
    const car =
      await Car.findById(
        req.params.id
      );

    if (!car) {
      return res.status(404).json({
        success: false,
        message:
          'Vehicle not found',
      });
    }

    // ========================================================
    // OWNERSHIP
    // ========================================================
    const ownerId =
      car.owner?._id
        ? car.owner._id.toString()
        : car.owner
        ? car.owner.toString()
        : null;

    const userId =
      req.user._id
        ? req.user._id.toString()
        : req.user.id.toString();

    if (
      ownerId &&
      ownerId !== userId &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message:
          'Not authorized to update this vehicle.',
      });
    }

    const updates =
      req.body;

    const updateDoc = {};

    // ========================================================
    // SCALAR FIELDS
    // ========================================================
    const scalarFields = [
      'name',
      'brand',
      'model',
      'variant',
      'year',
      'color',
      'seatingCapacity',
      'fuelType',
      'transmission',
      'isAC',
      'category',
      'description',
      'videoUrl',
      'isAvailable',
      'weddingSpecial',
      'active',
    ];

    scalarFields.forEach(
      (field) => {
        if (
          updates[field] !==
          undefined
        ) {
          updateDoc[field] =
            updates[field];
        }
      }
    );

    // ========================================================
    // PER KM
    // ========================================================
    if (
      updates.perKm !==
      undefined
    ) {
      const perKm =
        Number(
          updates.perKm
        );

      if (
        !Number.isFinite(perKm) ||
        perKm <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            'Valid per-kilometer rate is required.',
        });
      }

      updateDoc[
        'pricing.perKm'
      ] = perKm;

      updateDoc[
        'pricing.extraKmRate'
      ] = perKm;
    }

    // ========================================================
    // FUEL INCLUDED
    // ========================================================
    if (
      updates.fuelIncluded !==
      undefined
    ) {
      updateDoc.fuelIncluded =
        Boolean(
          updates.fuelIncluded
        );
    }

    // ========================================================
    // UNAVAILABLE DATES
    // ========================================================
    if (
      updates.unavailableDates !==
        undefined &&
      Array.isArray(
        updates.unavailableDates
      )
    ) {
      updateDoc.unavailableDates =
        updates.unavailableDates;
    }

    // ========================================================
    // PAYMENT METHODS
    // ========================================================
    if (
      updates.paymentMethods !==
        undefined &&
      Array.isArray(
        updates.paymentMethods
      )
    ) {
      updateDoc.paymentMethods =
        updates.paymentMethods;
    }

    // ========================================================
    // PER DAY
    // ========================================================
    if (
      updates.perDay !==
      undefined
    ) {
      updateDoc[
        'pricing.perDay'
      ] = Number(
        updates.perDay
      );

      updateDoc[
        'pricing.basePrice'
      ] = Number(
        updates.perDay
      );
    }

    // ========================================================
    // BASE PRICE
    // ========================================================
    if (
      updates.basePrice !==
      undefined
    ) {
      updateDoc[
        'pricing.basePrice'
      ] = Number(
        updates.basePrice
      );
    }

    // ========================================================
    // EXTRA KM RATE
    // ========================================================
    if (
      updates.extraKmRate !==
      undefined
    ) {
      updateDoc[
        'pricing.extraKmRate'
      ] = Number(
        updates.extraKmRate
      );
    }

    // ========================================================
    // DRIVER CHARGES
    // ========================================================
    if (
      updates.driverCharges !==
      undefined
    ) {
      updateDoc[
        'pricing.driverCharges'
      ] = Number(
        updates.driverCharges
      );
    }

    // ========================================================
    // DECORATION CHARGES
    // ========================================================
    if (
      updates.decorationCharges !==
      undefined
    ) {
      updateDoc[
        'pricing.decorationCharges'
      ] = Number(
        updates.decorationCharges
      );
    }

    // ========================================================
    // NESTED PRICING
    // ========================================================
    if (
      updates.pricing
    ) {
      // ------------------------------------------------------
      // PER KM
      // ------------------------------------------------------
      if (
        updates.pricing.perKm !==
        undefined
      ) {
        const perKm =
          Number(
            updates.pricing.perKm
          );

        if (
          !Number.isFinite(perKm) ||
          perKm <= 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              'Valid per-kilometer rate is required.',
          });
        }

        updateDoc[
          'pricing.perKm'
        ] = perKm;

        updateDoc[
          'pricing.extraKmRate'
        ] = perKm;
      }

      // ------------------------------------------------------
      // PER DAY
      // ------------------------------------------------------
      if (
        updates.pricing.perDay !==
        undefined
      ) {
        const perDay =
          Number(
            updates.pricing.perDay
          );

        updateDoc[
          'pricing.perDay'
        ] = perDay;

        updateDoc[
          'pricing.basePrice'
        ] =
          updates.pricing.basePrice !==
          undefined
            ? Number(
                updates.pricing.basePrice
              )
            : perDay;
      }

      // ------------------------------------------------------
      // BASE PRICE
      // ------------------------------------------------------
      if (
        updates.pricing.basePrice !==
        undefined
      ) {
        updateDoc[
          'pricing.basePrice'
        ] = Number(
          updates.pricing.basePrice
        );
      }

      // ------------------------------------------------------
      // EXTRA KM RATE
      // ------------------------------------------------------
      if (
        updates.pricing.extraKmRate !==
        undefined
      ) {
        updateDoc[
          'pricing.extraKmRate'
        ] = Number(
          updates.pricing.extraKmRate
        );
      }

      // ------------------------------------------------------
      // DRIVER CHARGES
      // ------------------------------------------------------
      if (
        updates.pricing.driverCharges !==
        undefined
      ) {
        updateDoc[
          'pricing.driverCharges'
        ] = Number(
          updates.pricing.driverCharges
        );
      }

      // ------------------------------------------------------
      // DECORATION CHARGES
      // ------------------------------------------------------
      if (
        updates.pricing.decorationCharges !==
        undefined
      ) {
        updateDoc[
          'pricing.decorationCharges'
        ] = Number(
          updates.pricing.decorationCharges
        );
      }
    }

    // ========================================================
    // IMAGES
    // ========================================================
    if (
      updates.mainImage !==
      undefined
    ) {
      updateDoc[
        'images.main'
      ] =
        updates.mainImage;
    }

    if (
      updates.interiorImage !==
      undefined
    ) {
      updateDoc[
        'images.interior'
      ] =
        updates.interiorImage;
    }

    if (
      updates.images
    ) {
      if (
        updates.images.main
      ) {
        updateDoc[
          'images.main'
        ] =
          updates.images.main;
      }

      if (
        updates.images.interior
      ) {
        updateDoc[
          'images.interior'
        ] =
          updates.images.interior;
      }

      if (
        updates.images.front
      ) {
        updateDoc[
          'images.front'
        ] =
          updates.images.front;
      }

      if (
        updates.images.rear
      ) {
        updateDoc[
          'images.rear'
        ] =
          updates.images.rear;
      }

      if (
        updates.images.side
      ) {
        updateDoc[
          'images.side'
        ] =
          updates.images.side;
      }
    }

    // ========================================================
    // ADVANCE PAYMENT
    // ========================================================
    if (
      updates.advanceType !==
      undefined
    ) {
      updateDoc[
        'advancePayment.type'
      ] =
        updates.advanceType;
    }

    if (
      updates.advanceValue !==
      undefined
    ) {
      updateDoc[
        'advancePayment.value'
      ] =
        Number(
          updates.advanceValue
        );
    }

    if (
      updates.advancePayment
    ) {
      if (
        updates.advancePayment.type
      ) {
        updateDoc[
          'advancePayment.type'
        ] =
          updates.advancePayment.type;
      }

      if (
        updates.advancePayment.value !==
        undefined
      ) {
        updateDoc[
          'advancePayment.value'
        ] =
          Number(
            updates.advancePayment.value
          );
      }
    }

    // ========================================================
    // LOCATION
    // ========================================================
    if (
      updates.location !==
      undefined
    ) {
      const location =
        updates.location ||
        {};

      const coordinates =
        Array.isArray(
          location.coordinates
        )
          ? location.coordinates.map(
              Number
            )
          : null;

      if (
        !coordinates ||
        coordinates.length < 2 ||
        !Number.isFinite(
          coordinates[0]
        ) ||
        !Number.isFinite(
          coordinates[1]
        ) ||
        coordinates[0] < -180 ||
        coordinates[0] > 180 ||
        coordinates[1] < -90 ||
        coordinates[1] > 90
      ) {
        return res.status(400).json({
          success: false,
          message:
            'Valid vehicle location coordinates are required.',
        });
      }

      const address =
        String(
          location.address ||
            updates.address ||
            car.location?.address ||
            ''
        ).trim();

      const city =
        String(
          location.city ||
            updates.city ||
            car.location?.city ||
            ''
        ).trim();

      if (!address) {
        return res.status(400).json({
          success: false,
          message:
            'Vehicle location address is required.',
        });
      }

      updateDoc.location = {
        type: 'Point',

        coordinates: [
          coordinates[0],
          coordinates[1],
        ],

        address,

        city:
          city || address,
      };
    } else {
      // ------------------------------------------------------
      // ADDRESS ONLY
      // ------------------------------------------------------
      if (
        updates.address !==
        undefined
      ) {
        const address =
          String(
            updates.address
          ).trim();

        if (!address) {
          return res.status(400).json({
            success: false,
            message:
              'Vehicle location address cannot be empty.',
          });
        }

        updateDoc[
          'location.address'
        ] = address;
      }

      // ------------------------------------------------------
      // CITY
      // ------------------------------------------------------
      if (
        updates.city !==
        undefined
      ) {
        updateDoc[
          'location.city'
        ] =
          String(
            updates.city
          ).trim();
      }

      // ------------------------------------------------------
      // LATITUDE + LONGITUDE
      // ------------------------------------------------------
      if (
        updates.lng !==
          undefined ||
        updates.lat !==
          undefined
      ) {
        const lng =
          Number(
            updates.lng
          );

        const lat =
          Number(
            updates.lat
          );

        if (
          !Number.isFinite(lng) ||
          !Number.isFinite(lat) ||
          lng < -180 ||
          lng > 180 ||
          lat < -90 ||
          lat > 90
        ) {
          return res.status(400).json({
            success: false,
            message:
              'Both valid latitude and longitude are required to update vehicle location.',
          });
        }

        updateDoc[
          'location.type'
        ] = 'Point';

        updateDoc[
          'location.coordinates'
        ] = [
          lng,
          lat,
        ];
      }
    }

    // ========================================================
    // SERVICE RADIUS
    // ========================================================
    if (
      updates.serviceRadiusKm !==
      undefined
    ) {
      const radius =
        Number(
          updates.serviceRadiusKm
        );

      if (
        !Number.isFinite(radius) ||
        radius <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            'Service radius must be greater than 0.',
        });
      }

      updateDoc.serviceRadiusKm =
        radius;
    }

    // ========================================================
    // UPDATE DATABASE
    // ========================================================
    const updatedCar =
      await Car.findByIdAndUpdate(
        req.params.id,

        {
          $set: updateDoc,
        },

        {
          new: true,
          runValidators: true,
        }
      );

    res.json({
      success: true,

      message:
        'Vehicle details updated successfully.',

      car: updatedCar,
    });
  } catch (error) {
    console.error(
      '[updateCar error]:',
      error
    );

    res.status(400).json({
      success: false,
      message:
        error.message ||
        'Failed to update vehicle details',
    });
  }
};

// ============================================================
// DELETE CAR
// DELETE /api/cars/:id
// ============================================================
exports.deleteCar = async (
  req,
  res,
  next
) => {
  try {
    const car =
      await Car.findById(
        req.params.id
      );

    if (!car) {
      return res.status(404).json({
        success: false,
        message:
          'Vehicle not found',
      });
    }

    if (
      car.owner.toString() !==
        req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message:
          'Not authorized to delete this listing.',
      });
    }

    await Car.findByIdAndDelete(
      req.params.id
    );

    res.json({
      success: true,

      message:
        'Vehicle removed from marketplace successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// FEATURED + WEDDING FLEET
// GET /api/cars/featured
// ============================================================
exports.getFeaturedCars = async (
  req,
  res,
  next
) => {
  try {
    const featured =
      await Car.find({
        active: true,
        isAvailable: true,
      })
        .sort({
          ratingsAverage: -1,
        })
        .limit(8)
        .populate(
          'owner',
          'name phone'
        )
        .populate(
          'ownerProfile',
          'businessName rating'
        );

    const weddingFleet =
      await Car.find({
        active: true,
        isAvailable: true,

        $or: [
          {
            weddingSpecial: true,
          },
          {
            category:
              'Wedding Special',
          },
          {
            category:
              'Luxury',
          },
          {
            category:
              'Vintage',
          },
        ],
      })
        .limit(6)
        .populate(
          'owner',
          'name phone'
        );

    res.json({
      success: true,
      featured,
      weddingFleet,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// OWNER FLEET
// GET /api/cars/my-fleet
// ============================================================
exports.getMyFleet = async (
  req,
  res,
  next
) => {
  try {
    const filter =
      req.user.role === 'admin'
        ? {}
        : {
            owner:
              req.user.id,
          };

    const cars =
      await Car.find(
        filter
      ).sort({
        createdAt: -1,
      });

    res.json({
      success: true,

      count:
        cars.length,

      cars,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// TOGGLE CUSTOM DATE AVAILABILITY
// PUT /api/cars/:id/toggle-date
// ============================================================
exports.toggleCarDate = async (
  req,
  res,
  next
) => {
  try {
    const {
      date,
    } = req.body;

    if (!date) {
      return res.status(400).json({
        success: false,
        message:
          'Please provide a valid date (YYYY-MM-DD).',
      });
    }

    const car =
      await Car.findById(
        req.params.id
      );

    if (!car) {
      return res.status(404).json({
        success: false,
        message:
          'Vehicle not found.',
      });
    }

    const isOwner =
      car.owner.toString() ===
      req.user.id;

    const isAdmin =
      req.user.role ===
      'admin';

    if (
      !isOwner &&
      !isAdmin
    ) {
      return res.status(403).json({
        success: false,
        message:
          'Not authorized to modify this vehicle.',
      });
    }

    if (
      !Array.isArray(
        car.unavailableDates
      )
    ) {
      car.unavailableDates =
        [];
    }

    const dateStr =
      String(date).split('T')[0];

    const index =
      car.unavailableDates.indexOf(
        dateStr
      );

    let isNowBlocked =
      false;

    if (index > -1) {
      car.unavailableDates.splice(
        index,
        1
      );

      isNowBlocked =
        false;
    } else {
      car.unavailableDates.push(
        dateStr
      );

      isNowBlocked =
        true;
    }

    await car.save();

    res.json({
      success: true,

      message:
        isNowBlocked
          ? `Car marked NOT AVAILABLE on ${dateStr}`
          : `Car marked AVAILABLE on ${dateStr}`,

      isUnavailable:
        isNowBlocked,

      unavailableDates:
        car.unavailableDates,
    });
  } catch (error) {
    next(error);
  }
};
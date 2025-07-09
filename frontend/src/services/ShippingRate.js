// src/services/shippingRateService.js

const RATE_CONFIG = {
  services: {
    Standard: { 
      baseRate: 45, 
      minCharge: 35, 
      maxWeight: 50, 
      transitDays: '3-5',
      codAvailable: true 
    },
    Express: { 
      baseRate: 75, 
      minCharge: 55, 
      maxWeight: 30, 
      transitDays: '1-2',
      codAvailable: true 
    },
    SameDay: { 
      baseRate: 140, 
      minCharge: 90, 
      maxWeight: 10, 
      transitDays: '0',
      codAvailable: false 
    },
    Overnight: { 
      baseRate: 95, 
      minCharge: 70, 
      maxWeight: 25, 
      transitDays: '1',
      codAvailable: true 
    }
  },
  
  categoryMultipliers: {
    Documents: 0.8,
    Books: 0.9,
    Clothing: 1.0,
    Electronics: 1.3,
    Fragile: 1.4,
    Gifts: 1.1,
    Medical: 1.5,
    Jewellery: 1.6,
    Food: 1.2,
    Others: 1.2
  },

  distanceMultipliers: {
    local: 1.0,      // Same city (0-25km)
    metro: 1.1,      // Metro cities
    regional: 1.3,   // Same state (100-300km)
    zonal: 1.6,      // Same zone (300-800km)
    national: 1.8,   // Different zones (800km+)
    remote: 2.2,     // Remote PIN codes
    northeast: 2.5,  // Northeast & island areas
    hillStation: 2.0 // Hill stations
  },

  // Volumetric weight calculation (L×W×H in cm / 5000)
  volumetricDivisor: 5000,
  maxDimension: 120, // cm - any side

  // Weight slabs for bulk discounts
  weightSlabs: [
    { min: 0, max: 0.5, discount: 0 },
    { min: 0.5, max: 2, discount: 0.05 },
    { min: 2, max: 5, discount: 0.1 },
    { min: 5, max: 10, discount: 0.15 },
    { min: 10, max: 25, discount: 0.2 },
    { min: 25, max: Infinity, discount: 0.25 }
  ],

  // Additional charges
  charges: {
    fuelSurcharge: 0.12,       // 12% fuel surcharge
    gst: 0.18,                 // 18% GST
    codCharges: 0.02,          // 2% of COD amount
    codMaxCharge: 300,         // Max COD charge ₹300
    codMinCharge: 25,          // Min COD charge ₹25
    rtoCharges: 40,            // Return to origin
    reAttemptCharges: 15,      // Re-delivery attempt
    oversizeCharges: 150,      // Packages > 120cm any side
    fragileHandling: 50,       // Fragile item handling
    remoteAreaCharges: 35,     // Remote area delivery
    doorDelivery: 20,          // Door delivery premium
    signatureRequired: 15,     // Signature on delivery
    scheduledDelivery: 25,     // Time slot delivery
    weekendDelivery: 40,       // Saturday/Sunday delivery
    holidayDelivery: 60        // Holiday delivery
  },

  // Insurance rates based on declared value
  insuranceSlabs: [
    { min: 0, max: 5000, rate: 0.005 },      // 0.5%
    { min: 5000, max: 25000, rate: 0.01 },   // 1%
    { min: 25000, max: 100000, rate: 0.015 }, // 1.5%
    { min: 100000, max: Infinity, rate: 0.02 } // 2%
  ],

  // PIN code classification for your network
  pincodeClassification: {
    metros: ['110', '400', '560', '600', '700', '500', '380', '411'], 
    remote: ['797', '798', '799', '790', '791', '792', '793', '794', '795', '796', '744', '745', '682', '683'],
    northeast: ['781', '782', '783', '784', '785', '786', '787', '788', '789'],
    hillStations: ['171', '172', '173', '174', '175', '176', '177', '178', '179', '193', '194', '195']
  },

  // Restricted items (additional charges or restrictions)
  restrictedItems: {
    batteries: { allowed: true, additionalCharge: 25 },
    liquids: { allowed: true, additionalCharge: 30 },
    hazardous: { allowed: false, additionalCharge: 0 },
    perishable: { allowed: true, additionalCharge: 50 },
    valuables: { allowed: true, additionalCharge: 100, insuranceMandatory: true }
  }
};

const calculateShippingRate = (shipmentData) => {
  try {
    const { 
      package: pkg, 
      service, 
      pickup, 
      delivery = {}, 
      options = {} 
    } = shipmentData;

    // Extract package details
    const weight = parseFloat(pkg?.weight);
    const declaredValue = parseFloat(pkg?.declaredValue) || 0;
    const serviceType = service?.type || 'Standard';
    const category = pkg?.category || 'Others';
    const dimensions = pkg?.dimensions || {};
    const codAmount = parseFloat(options?.codAmount) || 0;

    // Validation
    if (!weight || isNaN(weight) || weight <= 0) {
      throw new Error('Weight must be greater than 0');
    }

    const serviceConfig = RATE_CONFIG.services[serviceType];
    if (!serviceConfig) {
      throw new Error(`Invalid service type: ${serviceType}`);
    }

    if (weight > serviceConfig.maxWeight) {
      throw new Error(`Weight exceeds limit for ${serviceType} service (${serviceConfig.maxWeight}kg max)`);
    }

    // Calculate volumetric weight if dimensions provided
    let billableWeight = weight;
    let volumetricWeight = 0;
    let isOversized = false;

    if (dimensions.length && dimensions.width && dimensions.height) {
      const { length, width, height } = dimensions;
      volumetricWeight = (length * width * height) / RATE_CONFIG.volumetricDivisor;
      billableWeight = Math.max(weight, volumetricWeight);
      
      // Check for oversized package
      isOversized = length > RATE_CONFIG.maxDimension || 
                   width > RATE_CONFIG.maxDimension || 
                   height > RATE_CONFIG.maxDimension;
    }

    // Calculate base shipping cost
    let baseAmount = billableWeight * serviceConfig.baseRate;
    
    // Apply category multiplier
    baseAmount *= RATE_CONFIG.categoryMultipliers[category] || 1.0;
    
    // Apply distance multiplier
    const distanceMultiplier = getDistanceMultiplier(pickup?.pincode, delivery?.pincode);
    baseAmount *= distanceMultiplier;

    // Apply weight discount
    const weightDiscount = getWeightDiscount(billableWeight);
    const discountAmount = baseAmount * weightDiscount;
    baseAmount -= discountAmount;

    // Apply minimum charges
    baseAmount = Math.max(baseAmount, serviceConfig.minCharge);

    // Calculate additional charges
    let additionalCharges = 0;
    const chargeBreakdown = {};

    // Fuel surcharge
    const fuelSurcharge = baseAmount * RATE_CONFIG.charges.fuelSurcharge;
    additionalCharges += fuelSurcharge;
    chargeBreakdown.fuelSurcharge = Math.round(fuelSurcharge);

    // COD charges
    let codCharges = 0;
    if (codAmount > 0) {
      if (!serviceConfig.codAvailable) {
        throw new Error(`COD not available for ${serviceType} service`);
      }
      codCharges = Math.max(
        Math.min(codAmount * RATE_CONFIG.charges.codCharges, RATE_CONFIG.charges.codMaxCharge),
        RATE_CONFIG.charges.codMinCharge
      );
      additionalCharges += codCharges;
      chargeBreakdown.codCharges = Math.round(codCharges);
    }

    // Remote area charges
    if (isRemoteArea(pickup?.pincode, delivery?.pincode)) {
      additionalCharges += RATE_CONFIG.charges.remoteAreaCharges;
      chargeBreakdown.remoteAreaCharges = RATE_CONFIG.charges.remoteAreaCharges;
    }

    // Oversize charges
    if (isOversized) {
      additionalCharges += RATE_CONFIG.charges.oversizeCharges;
      chargeBreakdown.oversizeCharges = RATE_CONFIG.charges.oversizeCharges;
    }

    // Special handling charges
    if (category === 'Fragile') {
      additionalCharges += RATE_CONFIG.charges.fragileHandling;
      chargeBreakdown.fragileHandling = RATE_CONFIG.charges.fragileHandling;
    }

    // Optional service charges
    if (options.doorDelivery) {
      additionalCharges += RATE_CONFIG.charges.doorDelivery;
      chargeBreakdown.doorDelivery = RATE_CONFIG.charges.doorDelivery;
    }

    if (options.signatureRequired) {
      additionalCharges += RATE_CONFIG.charges.signatureRequired;
      chargeBreakdown.signatureRequired = RATE_CONFIG.charges.signatureRequired;
    }

    if (options.scheduledDelivery) {
      additionalCharges += RATE_CONFIG.charges.scheduledDelivery;
      chargeBreakdown.scheduledDelivery = RATE_CONFIG.charges.scheduledDelivery;
    }

    if (options.weekendDelivery) {
      additionalCharges += RATE_CONFIG.charges.weekendDelivery;
      chargeBreakdown.weekendDelivery = RATE_CONFIG.charges.weekendDelivery;
    }

    // Insurance calculation
    const insurance = calculateInsurance(declaredValue);
    additionalCharges += insurance;

    // Calculate subtotal
    const subtotal = baseAmount + additionalCharges;

    // Calculate GST
    const gst = subtotal * RATE_CONFIG.charges.gst;
    
    // Final total
    const total = Math.round(subtotal + gst);

    // Estimated delivery date
    const deliveryDate = calculateDeliveryDate(serviceConfig.transitDays, options);

    return {
      success: true,
      rateDetails: {
        serviceType,
        transitDays: serviceConfig.transitDays,
        estimatedDelivery: deliveryDate,
        weight: {
          actualWeight: weight,
          volumetricWeight: Math.round(volumetricWeight * 100) / 100,
          billableWeight: Math.round(billableWeight * 100) / 100
        }
      },
      breakdown: {
        baseAmount: Math.round(baseAmount),
        ratePerKg: serviceConfig.baseRate,
        categoryMultiplier: RATE_CONFIG.categoryMultipliers[category],
        distanceMultiplier,
        discount: Math.round(discountAmount),
        ...chargeBreakdown,
        insurance: Math.round(insurance),
        subtotal: Math.round(subtotal),
        gst: Math.round(gst),
        total
      },
      paymentInfo: {
        amountInPaise: total * 100,
        currency: 'INR',
        codAmount: codAmount,
        description: `${serviceType} shipping from ${pickup?.pincode || 'N/A'} to ${delivery?.pincode || 'N/A'}`
      }
    };

  } catch (err) {
    return { 
      success: false, 
      error: err.message,
      errorCode: 'RATE_CALCULATION_ERROR'
    };
  }
};

const getDistanceMultiplier = (pickupPin, deliveryPin) => {
  if (!pickupPin || !deliveryPin) return RATE_CONFIG.distanceMultipliers.national;

  const p1 = pickupPin.slice(0, 3);
  const p2 = deliveryPin.slice(0, 3);

  if (p1 === p2) return RATE_CONFIG.distanceMultipliers.local;

  if (RATE_CONFIG.pincodeClassification.metros.includes(p1) && 
      RATE_CONFIG.pincodeClassification.metros.includes(p2)) {
    return RATE_CONFIG.distanceMultipliers.metro;
  }

  if (RATE_CONFIG.pincodeClassification.northeast.includes(p1) || 
      RATE_CONFIG.pincodeClassification.northeast.includes(p2)) {
    return RATE_CONFIG.distanceMultipliers.northeast;
  }

  if (RATE_CONFIG.pincodeClassification.hillStations.includes(p1) || 
      RATE_CONFIG.pincodeClassification.hillStations.includes(p2)) {
    return RATE_CONFIG.distanceMultipliers.hillStation;
  }

  if (RATE_CONFIG.pincodeClassification.remote.includes(p1) || 
      RATE_CONFIG.pincodeClassification.remote.includes(p2)) {
    return RATE_CONFIG.distanceMultipliers.remote;
  }

  if (Math.floor(parseInt(p1) / 10) === Math.floor(parseInt(p2) / 10)) {
    return RATE_CONFIG.distanceMultipliers.regional;
  }

  if (Math.floor(parseInt(p1) / 100) === Math.floor(parseInt(p2) / 100)) {
    return RATE_CONFIG.distanceMultipliers.zonal;
  }

  return RATE_CONFIG.distanceMultipliers.national;
};

const getWeightDiscount = (weight) => {
  const slab = RATE_CONFIG.weightSlabs.find(s => weight > s.min && weight <= s.max);
  return slab?.discount || 0;
};

const calculateInsurance = (declaredValue) => {
  if (declaredValue <= 0) return 0;
  
  const slab = RATE_CONFIG.insuranceSlabs.find(s => 
    declaredValue > s.min && declaredValue <= s.max
  );
  
  return declaredValue * (slab?.rate || 0.02);
};

const isRemoteArea = (pickupPin, deliveryPin) => {
  if (!pickupPin || !deliveryPin) return false;
  
  const p1 = pickupPin.slice(0, 3);
  const p2 = deliveryPin.slice(0, 3);
  
  return RATE_CONFIG.pincodeClassification.remote.includes(p1) || 
         RATE_CONFIG.pincodeClassification.remote.includes(p2);
};

const calculateDeliveryDate = (transitDays, options = {}) => {
  const today = new Date();
  let deliveryDate = new Date(today);
  
  if (transitDays === '0') {
    return today.toISOString().split('T')[0];
  }
  
  const days = transitDays.includes('-') ? 
    parseInt(transitDays.split('-')[1]) : 
    parseInt(transitDays);
  
  deliveryDate.setDate(today.getDate() + days);
  
  if (!options.weekendDelivery) {
    while (deliveryDate.getDay() === 0 || deliveryDate.getDay() === 6) {
      deliveryDate.setDate(deliveryDate.getDate() + 1);
    }
  }
  
  return deliveryDate.toISOString().split('T')[0];
};

// Service availability checker
const checkServiceAvailability = (pickupPin, deliveryPin, serviceType) => {
  const serviceConfig = RATE_CONFIG.services[serviceType];
  if (!serviceConfig) return { available: false, reason: 'Invalid service type' };

  if (serviceType === 'SameDay') {
    const p1 = pickupPin?.slice(0, 3);
    const p2 = deliveryPin?.slice(0, 3);
    
    if (p1 !== p2) {
      return { available: false, reason: 'Same day delivery only available within same city' };
    }
    
    if (RATE_CONFIG.pincodeClassification.remote.includes(p1)) {
      return { available: false, reason: 'Same day delivery not available to remote areas' };
    }
  }

  return { available: true };
};

export { 
  calculateShippingRate, 
  checkServiceAvailability,
  RATE_CONFIG 
};
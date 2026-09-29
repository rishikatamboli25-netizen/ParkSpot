const PARKINGS_DATA = [

  {
    id: 1,
    name: "City Center Parking",
    price: 30,
    unit: "/hr",
    totalSpots: 450,
    availableSpots: 120,
    rating: 4.2,
    type: "underground",
    open: true,
    amenities: ["CCTV","24/7","Lift","Disabled Access"],
    latOffset: 0.002,
    lngOffset: -0.003,
    baseDistance: 0.3,
    popularity: 87
  },

  {
    id: 2,
    name: "Metro Plaza Parking",
    price: 20,
    unit: "/hr",
    totalSpots: 200,
    availableSpots: 45,
    rating: 3.8,
    type: "surface",
    open: true,
    amenities: ["CCTV","⚡EV"],
    latOffset: -0.004,
    lngOffset: 0.002,
    baseDistance: 0.5,
    popularity: 72
  },

  {
    id: 3,
    name: "Central Metro Parking",
    price: 25,
    unit: "/hr",
    totalSpots: 300,
    availableSpots: 180,
    rating: 4.5,
    type: "multilevel",
    open: true,
    amenities: ["CCTV","24/7","⚡EV","Covered","Lift"],
    latOffset: 0.003,
    lngOffset: 0.004,
    baseDistance: 0.6,
    popularity: 93
  },

  {
    id: 4,
    name: "Outer Ring Parking",
    price: 15,
    unit: "/hr",
    totalSpots: 150,
    availableSpots: 20,
    rating: 3.5,
    type: "surface",
    open: true,
    amenities: ["CCTV"],
    latOffset: -0.005,
    lngOffset: -0.002,
    baseDistance: 0.8,
    popularity: 61
  },

  {
    id: 5,
    name: "Green Park Basement",
    price: 35,
    unit: "/hr",
    totalSpots: 500,
    availableSpots: 230,
    rating: 4.3,
    type: "underground",
    open: false,
    amenities: ["CCTV","Lift","Covered","Disabled Access","⚡EV"],
    latOffset: 0.006,
    lngOffset: -0.004,
    baseDistance: 1.0,
    popularity: 80
  },

  {
    id: 6,
    name: "Business Hub Parking",
    price: 50,
    unit: "/hr",
    totalSpots: 800,
    availableSpots: 320,
    rating: 4.6,
    type: "multilevel",
    open: true,
    amenities: ["CCTV","24/7","⚡EV","Covered","Lift"],
    latOffset: -0.002,
    lngOffset: 0.005,
    baseDistance: 0.2,
    popularity: 96
  },

  {
    id: 7,
    name: "Corporate Tower Parking",
    price: 40,
    unit: "/hr",
    totalSpots: 400,
    availableSpots: 80,
    rating: 4.0,
    type: "underground",
    open: true,
    amenities: ["CCTV","Lift","⚡EV"],
    latOffset: 0.004,
    lngOffset: -0.005,
    baseDistance: 0.7,
    popularity: 78
  },

  {
    id: 8,
    name: "Street Side Lot",
    price: 20,
    unit: "/hr",
    totalSpots: 200,
    availableSpots: 120,
    rating: 3.6,
    type: "surface",
    open: true,
    amenities: ["CCTV"],
    latOffset: -0.006,
    lngOffset: 0.003,
    baseDistance: 0.9,
    popularity: 65
  }

];

export default PARKINGS_DATA;
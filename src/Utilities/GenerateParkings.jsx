import PARKINGS_DATA from "../Data/ParkingData.js";

function GenerateParkings(userLat, userLng) {
  

  // 1️⃣ Decide random number of parkings
  const count = Math.floor(Math.random() * PARKINGS_DATA.length);

  // 2️⃣ Shuffle the dataset
  const shuffled = [...PARKINGS_DATA].sort(() => Math.random() - 0.5);

  // 3️⃣ Pick random subset
  const selected = shuffled.slice(0, count);

  // 4️⃣ Modify only selected parkings
  return selected.map(p => {
    const latOffset = p.latOffset + (Math.random() - 0.5) * 0.01;
    const lngOffset = p.lngOffset + (Math.random() - 0.5) * 0.01;

    return {
      ...p,
      lat: userLat + latOffset,
      lng: userLng + lngOffset,
      distance: (p.baseDistance + Math.random() * 0.5).toFixed(2)
    };
  });
}

export default GenerateParkings;
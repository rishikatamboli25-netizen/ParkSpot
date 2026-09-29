import { useEffect, useRef, useState } from "react";
import "./App.css";

import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Circle,
  Popup,
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

// Icons
import { FaLocationDot } from "react-icons/fa6";
import { FiSearch, FiNavigation, FiSliders } from "react-icons/fi";

// Components
import Card from "./Components/Card";
import ParkingCard from "./Components/ParkingCard";

// Logic
import GenerateParkings from "./Utilities/GenerateParkings";

// ======================================================
// CONFIG
// ======================================================

const LOCATION_SUGGESTION_RADIUS_KM = 50;

const DEFAULT_MAP_CENTER = [20.5937, 78.9629];

// ======================================================
// DISTANCE CALCULATION
// ======================================================

const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;

  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

// ======================================================
// VEHICLE DATA NORMALIZER
// ======================================================

const getParkingVehicleTypes = (parking) => {
  const possibleFields = [
    parking?.vehicleTypes,
    parking?.allowedVehicles,
    parking?.vehicles,
    parking?.vehicleType,
  ];

  const value = possibleFields.find(
    (item) => item !== undefined && item !== null,
  );

  if (value === undefined) {
    return null;
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim().toLowerCase())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);
  }

  return null;
};

// ======================================================
// VEHICLE FILTER
// ======================================================

const parkingSupportsVehicle = (parking, selectedVehicle) => {
  // "All" means no vehicle filtering
  if (selectedVehicle === "All") {
    return true;
  }

  const vehicleTypes = getParkingVehicleTypes(parking);

  // If parking data does not contain
  // vehicle information, keep it visible.
  //
  // This prevents old dummy parking data
  // from disappearing completely.

  if (!vehicleTypes) {
    return true;
  }

  const selected = selectedVehicle.trim().toLowerCase();

  // Generic "all" values

  if (
    vehicleTypes.includes("all") ||
    vehicleTypes.includes("any") ||
    vehicleTypes.includes("both")
  ) {
    return true;
  }

  // EV

  if (selected === "ev") {
    return (
      vehicleTypes.includes("ev") ||
      vehicleTypes.includes("electric") ||
      vehicleTypes.includes("electric vehicle")
    );
  }

  return vehicleTypes.includes(selected);
};

// ======================================================
// MAP CONTROLLER
// ======================================================

function MapController({ userCoords, searchCoords, parkings, searchRadius }) {
  const map = useMap();

  // --------------------------------------------------
  // MAP RESIZE
  // --------------------------------------------------

  useEffect(() => {
    const handleResize = () => {
      map.invalidateSize();
    };

    window.addEventListener("resize", handleResize);

    const resizeTimer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      window.removeEventListener("resize", handleResize);

      clearTimeout(resizeTimer);
    };
  }, [map]);

  // --------------------------------------------------
  // USER LOCATION
  // --------------------------------------------------

  useEffect(() => {
    if (!userCoords || searchCoords) {
      return;
    }

    map.flyTo([userCoords.lat, userCoords.lng], 14, {
      duration: 1.2,
    });
  }, [userCoords, searchCoords, map]);

  // --------------------------------------------------
  // SEARCH LOCATION
  // --------------------------------------------------

  useEffect(() => {
    if (!searchCoords) {
      return;
    }

    map.flyTo(
      [searchCoords.lat, searchCoords.lng],
      Math.max(11, Math.min(15, radiusToZoom(searchRadius))),
      {
        duration: 1.2,
      },
    );
  }, [searchCoords, searchRadius, map]);

  // --------------------------------------------------
  // PARKING RESULTS
  // --------------------------------------------------

  useEffect(() => {
    if (!searchCoords || !parkings.length) {
      return;
    }

    const validParkings = parkings.filter(
      (parking) =>
        Number.isFinite(Number(parking.lat)) &&
        Number.isFinite(Number(parking.lng)),
    );

    if (!validParkings.length) {
      return;
    }

    const bounds = validParkings.map((parking) => [
      Number(parking.lat),
      Number(parking.lng),
    ]);

    if (bounds.length === 1) {
      map.flyTo(bounds[0], Math.min(16, radiusToZoom(searchRadius) + 1), {
        duration: 1,
      });

      return;
    }

    map.fitBounds(bounds, {
      padding: [50, 50],
      maxZoom: 15,
      animate: true,
    });
  }, [parkings, searchCoords, searchRadius, map]);

  return null;
}

// ======================================================
// RADIUS → MAP ZOOM
// ======================================================

const radiusToZoom = (radius) => {
  if (radius <= 1) {
    return 16;
  }

  if (radius <= 2) {
    return 15;
  }

  if (radius <= 5) {
    return 14;
  }

  if (radius <= 10) {
    return 13;
  }

  if (radius <= 20) {
    return 12;
  }

  return 11;
};

// ======================================================
// MAIN APP
// ======================================================

function App() {
  const mapApi = import.meta.env.VITE_MAP_API_key;

  // ====================================================
  // PARKING
  // ====================================================

  const [parkings, setParkings] = useState([]);

  const [selectedParking, setSelectedParking] = useState(null);

  // ====================================================
  // SEARCH
  // ====================================================

  const [location, setLocation] = useState("");

  const [suggestions, setSuggestions] = useState([]);

  const [coords, setCoords] = useState(null);

  // ====================================================
  // USER LOCATION
  // ====================================================

  const [userCoords, setUserCoords] = useState(null);

  const [locationLoading, setLocationLoading] = useState(true);

  const [locationError, setLocationError] = useState("");

  // ====================================================
  // SEARCH LOADING
  // ====================================================

  const [searchLoading, setSearchLoading] = useState(false);

  // ====================================================
  // SEARCH OPTIONS
  // ====================================================

  const [searchOptionsOpen, setSearchOptionsOpen] = useState(false);

  const [searchRadius, setSearchRadius] = useState(2);

  const [vehicleType, setVehicleType] = useState("Car");

  const [appliedOptions, setAppliedOptions] = useState({
    radius: 2,
    vehicle: "Car",
  });

  // ====================================================
  // OTHER FILTER
  // ====================================================

  const [activeFilter, setActiveFilter] = useState("all");

  // ====================================================
  // REFS
  // ====================================================

  const timeoutRef = useRef(null);

  const abortControllerRef = useRef(null);

  // ====================================================
  // GET USER LOCATION
  // ====================================================

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");

      setLocationLoading(false);

      return;
    }

    setLocationLoading(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude);

        const lng = Number(position.coords.longitude);

        setUserCoords({
          lat,
          lng,
        });

        setLocationLoading(false);
      },

      (error) => {
        console.error("Location error:", error);

        let message = "Unable to get your location.";

        if (error.code === 1) {
          message = "Location permission was denied.";
        } else if (error.code === 2) {
          message = "Your location is currently unavailable.";
        } else if (error.code === 3) {
          message = "Location request timed out.";
        }

        setLocationError(message);

        setLocationLoading(false);
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      },
    );
  };

  // ====================================================
  // INITIAL LOCATION
  // ====================================================

  useEffect(() => {
    getUserLocation();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // ====================================================
  // SEARCH VIEWBOX
  // ====================================================

  const getSearchViewbox = (lat, lng, radiusKm) => {
    const latDelta = radiusKm / 111;

    const cosine = Math.cos((lat * Math.PI) / 180);

    const safeCosine = Math.max(Math.abs(cosine), 0.01);

    const lngDelta = radiusKm / (111 * safeCosine);

    const minLat = lat - latDelta;

    const maxLat = lat + latDelta;

    const minLng = lng - lngDelta;

    const maxLng = lng + lngDelta;

    return {
      minLat,
      maxLat,
      minLng,
      maxLng,
    };
  };

  // ====================================================
  // LOCATIONIQ AUTOCOMPLETE
  // ====================================================

  const fetchSuggestions = (value) => {
    setLocation(value);
    setCoords(null);

    if (value.trim().length < 3) {
      setSuggestions([]);

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      return;
    }

    if (!userCoords) {
      setSuggestions([]);

      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    timeoutRef.current = setTimeout(async () => {
      try {
        setSearchLoading(true);

        const { minLat, maxLat, minLng, maxLng } = getSearchViewbox(
          userCoords.lat,
          userCoords.lng,
          LOCATION_SUGGESTION_RADIUS_KM,
        );

        const viewbox = `${minLng},${minLat},${maxLng},${maxLat}`;

        const controller = new AbortController();

        abortControllerRef.current = controller;

        const url = new URL("https://api.locationiq.com/v1/autocomplete");

        url.searchParams.set("key", mapApi);

        url.searchParams.set("q", value.trim());

        url.searchParams.set("limit", "5");

        // Only India

        url.searchParams.set("countrycodes", "in");

        // Nearby area

        url.searchParams.set("viewbox", viewbox);

        // Strictly bounded

        url.searchParams.set("bounded", "1");

        // Distance-oriented ranking

        url.searchParams.set("importancesort", "0");

        url.searchParams.set("dedupe", "1");

        url.searchParams.set("accept-language", "en");

        const response = await fetch(url.toString(), {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`LocationIQ error: ${response.status}`);
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          setSuggestions(data);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Autocomplete error:", error);

          setSuggestions([]);
        }
      } finally {
        setSearchLoading(false);
      }
    }, 700);
  };

  // ====================================================
  // SELECT SEARCH LOCATION
  // ====================================================

  const handleSelect = (place) => {
    const lat = Number(place.lat);

    const lng = Number(place.lon);

    setLocation(place.display_name);

    setSuggestions([]);

    setCoords({
      lat,
      lng,
    });
  };

  // ====================================================
  // GENERATE + FILTER PARKINGS
  // ====================================================

  const runParkingSearch = (searchCoords, options) => {
    if (!searchCoords) {
      return;
    }

    const generatedParkings = GenerateParkings(
      searchCoords.lat,
      searchCoords.lng,
    );

    // -----------------------------------------------
    // RADIUS FILTER
    // -----------------------------------------------

    const radiusFiltered = generatedParkings
      .map((parking) => {
        const parkingLat = Number(parking.lat);

        const parkingLng = Number(parking.lng);

        if (!Number.isFinite(parkingLat) || !Number.isFinite(parkingLng)) {
          return null;
        }

        const distance = calculateDistance(
          searchCoords.lat,
          searchCoords.lng,
          parkingLat,
          parkingLng,
        );

        return {
          ...parking,
          actualDistance: Number(distance.toFixed(2)),
        };
      })
      .filter(Boolean)
      .filter((parking) => parking.actualDistance <= options.radius);

    // -----------------------------------------------
    // VEHICLE FILTER
    // -----------------------------------------------

    const vehicleFiltered = radiusFiltered.filter((parking) =>
      parkingSupportsVehicle(parking, options.vehicle),
    );

    setParkings(vehicleFiltered);

    setSelectedParking(null);
  };

  // ====================================================
  // SEARCH PARKING
  // ====================================================

  const handleSearch = (e) => {
    e.preventDefault();

    if (!coords) {
      alert(
        userCoords
          ? "Please select a location from the nearby suggestions."
          : "Please allow location access first.",
      );

      return;
    }

    runParkingSearch(coords, appliedOptions);
  };

  // ====================================================
  // APPLY SEARCH OPTIONS
  // ====================================================

  const handleApplyOptions = () => {
    const newOptions = {
      radius: searchRadius,
      vehicle: vehicleType,
    };

    setAppliedOptions(newOptions);

    setSearchOptionsOpen(false);

    // Re-run actual parking search
    // immediately with NEW options.

    if (coords) {
      runParkingSearch(coords, newOptions);
    }
  };

  // ====================================================
  // FILTER LIST
  // ====================================================

  const filteredParkings = parkings.filter((parking) => {
    if (activeFilter === "all") {
      return true;
    }

    if (activeFilter === "open") {
      return parking.Open;
    }

    if (activeFilter === "cheap") {
      return parking.price <= 25;
    }

    if (activeFilter === "covered") {
      return parking.amenities?.includes("Covered");
    }

    if (activeFilter === "EvCharging") {
      return parking.amenities?.includes("⚡EV");
    }

    return true;
  });

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <main
      className="
        w-full
        min-w-0
        overflow-x-hidden
      "
    >
      {/* ==================================================
          NAVBAR
      ================================================== */}

      <section className="w-full">
        <div
          className="
            sticky
            top-0
            z-50
            w-full
            min-h-[72px]
            bg-surface-card-white
            border
            flex
            items-center
            justify-between
            gap-4
            px-4
            sm:px-6
            py-3
          "
        >
          <div
            className="
              flex
              items-center
              gap-2
              sm:gap-3
              min-w-0
            "
          >
            <div
              className="
                shrink-0
                bg-accent-primary-forest
                text-white
                p-2.5
                sm:p-3
                rounded-lg
              "
            >
              <FaLocationDot />
            </div>

            <span
              className="
                font-fraunces
                text-[clamp(1.2rem,3vw,2.4rem)]
                text-accent-primary-forest
                font-semibold
                truncate
              "
            >
              ParkSpot
            </span>
          </div>

          <div
            className="
              hidden
              sm:block
              shrink-0
              text-sm
              md:text-base
              lg:text-lg
              text-secondary-text-stone
              text-right
            "
          >
            Find. Compare. Park.
          </div>
        </div>
      </section>

      {/* ==================================================
          HERO
      ================================================== */}

      <section className="w-full">
        <div
          className="
    hero-pattern
    w-full
    min-h-[390px]
    sm:min-h-[430px]
    lg:min-h-[55vh]
    bg-accent-primary-forest
    flex
    flex-col
    justify-center
    items-center
    px-4
    py-10
  "
        >
          <h1
            className="
              font-fraunces
              text-white
              font-semibold
              text-center
              text-[clamp(1.6rem,4vw,3rem)]
            "
          >
            Find Parking Near You
          </h1>

          <p
            className="
              text-[clamp(0.95rem,1.3vw,1.3rem)]
              text-white/75
              px-2
              sm:px-6
              py-2
              text-center
              max-w-2xl
            "
          >
            Discover available spots, compare prices and amenities instantly
          </p>

          {/* LOCATION STATUS */}

          <div
            className="
              flex
              flex-wrap
              items-center
              justify-center
              gap-2
              text-xs
              sm:text-sm
              text-white/70
              mb-1
              text-center
            "
          >
            {locationLoading && (
              <>
                <span
                  className="
                    w-2
                    h-2
                    rounded-full
                    bg-white
                    animate-pulse
                  "
                />
                Getting your location...
              </>
            )}

            {!locationLoading && userCoords && !locationError && (
              <>
                <FiNavigation />
                Nearby suggestions enabled
              </>
            )}

            {!locationLoading && locationError && (
              <span className="text-white/80">{locationError}</span>
            )}
          </div>

          {/* ==================================================
              SEARCH
          ================================================== */}

          <form
            onSubmit={handleSearch}
            className="
              w-full
              max-w-5xl
            "
          >
            <div
              className="
                flex
                flex-col
                sm:flex-row
                items-center
                justify-center
                gap-3
                mt-5
                w-full
                px-2
              "
            >
              {/* SEARCH INPUT */}

              <div
                className="
                  relative
                  w-full
                  max-w-[600px]
                  bg-white
                  rounded-xl
                  px-4
                  py-3
                  flex
                  items-center
                  gap-3
                  text-secondary-text-stone
                "
              >
                <FiSearch
                  className="
                    shrink-0
                  "
                />

                <input
                  value={location}
                  onChange={(e) => fetchSuggestions(e.target.value)}
                  className="
                    min-w-0
                    flex-1
                    bg-transparent
                    focus:outline-none
                    text-sm
                    sm:text-base
                  "
                  type="text"
                  placeholder={
                    userCoords
                      ? "Search nearby location..."
                      : "Allow location access first..."
                  }
                  disabled={!userCoords}
                />

                {/* SEARCH LOADER */}

                {searchLoading && (
                  <div
                    className="
                      w-4
                      h-4
                      rounded-full
                      border-2
                      border-gray-300
                      border-t-accent-primary-forest
                      animate-spin
                      shrink-0
                    "
                  />
                )}

                {/* SUGGESTIONS */}

                {suggestions.length > 0 && (
                  <div
                    className="
                      absolute
                      top-full
                      left-0
                      w-full
                      bg-white
                      shadow-xl
                      rounded-xl
                      mt-2
                      z-[2000]
                      max-h-64
                      overflow-y-auto
                      border
                    "
                  >
                    {suggestions.map((item, index) => (
                      <button
                        key={
                          item.place_id ?? `${item.lat}-${item.lon}-${index}`
                        }
                        type="button"
                        onClick={() => handleSelect(item)}
                        className="
                            w-full
                            text-left
                            px-4
                            py-3
                            hover:bg-gray-100
                            text-sm
                            text-secondary-text-stone
                            border-b
                            last:border-b-0
                            transition
                          "
                      >
                        <div
                          className="
                              flex
                              items-start
                              gap-3
                            "
                        >
                          <FaLocationDot
                            className="
                                mt-0.5
                                shrink-0
                                text-accent-primary-forest
                              "
                          />

                          <span
                            className="
                                min-w-0
                              "
                          >
                            {item.display_name}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* SEARCH BUTTON */}

              <button
                type="submit"
                disabled={!coords || locationLoading}
                className="
                  bg-cta-button-rust
                  w-full
                  sm:w-auto
                  px-5
                  py-3
                  rounded-xl
                  text-white
                  font-dmSans
                  text-sm
                  sm:text-base
                  whitespace-nowrap
                  transition
                  hover:opacity-90
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                "
              >
                Search Parking
              </button>

              {/* OPTIONS BUTTON + POPUP */}

              <div
                className="
                  relative
                  w-full
                  sm:w-auto
                "
              >
                <button
                  type="button"
                  onClick={() => setSearchOptionsOpen((prev) => !prev)}
                  className="
                    w-full
                    sm:w-auto
                    bg-white
                    text-secondary-text-stone
                    px-4
                    py-3
                    rounded-xl
                    font-dmSans
                    text-sm
                    sm:text-base
                    flex
                    items-center
                    justify-center
                    gap-2
                    whitespace-nowrap
                    shadow-sm
                    hover:bg-gray-50
                    transition
                  "
                >
                  <FiSliders />
                  Options
                </button>

                {/* ==================================================
                    SEARCH OPTIONS POPUP
                ================================================== */}

                {searchOptionsOpen && (
                  <div
                    className="
                      absolute
                      top-full
                      right-0
                      sm:right-0
                      mt-3
                      w-[min(92vw,340px)]
                      bg-white
                      rounded-xl
                      shadow-2xl
                      border
                      p-5
                      z-[3000]
                    "
                  >
                    {/* POPUP ARROW */}

                    <div
                      className="
                        hidden
                        sm:block
                        absolute
                        -top-2
                        right-8
                        w-4
                        h-4
                        bg-white
                        border-l
                        border-t
                        rotate-45
                      "
                    />

                    {/* HEADER */}

                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        gap-4
                        mb-5
                      "
                    >
                      <h2
                        className="
                          font-dmSans
                          font-semibold
                          text-lg
                          text-gray-900
                        "
                      >
                        Search Options
                      </h2>

                      <button
                        type="button"
                        onClick={() => setSearchOptionsOpen(false)}
                        className="
                          text-gray-400
                          hover:text-gray-900
                          text-2xl
                          leading-none
                          transition
                        "
                      >
                        ×
                      </button>
                    </div>

                    {/* SEARCH RADIUS */}

                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        gap-4
                        mb-4
                      "
                    >
                      <label
                        className="
                          font-dmSans
                          text-sm
                          text-gray-700
                        "
                      >
                        Search Radius
                      </label>

                      <select
                        value={searchRadius}
                        onChange={(e) =>
                          setSearchRadius(Number(e.target.value))
                        }
                        className="
                          w-28
                          bg-white
                          border
                          border-gray-200
                          rounded-lg
                          px-3
                          py-2
                          text-sm
                          text-gray-700
                          outline-none
                          focus:border-accent-primary-forest
                        "
                      >
                        <option value={1}>1 km</option>

                        <option value={2}>2 km</option>

                        <option value={5}>5 km</option>

                        <option value={10}>10 km</option>

                        <option value={20}>20 km</option>

                        <option value={50}>50 km</option>
                      </select>
                    </div>

                    {/* VEHICLE TYPE */}

                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        gap-4
                        mb-5
                      "
                    >
                      <label
                        className="
                          font-dmSans
                          text-sm
                          text-gray-700
                        "
                      >
                        Vehicle Type
                      </label>

                      <select
                        value={vehicleType}
                        onChange={(e) => setVehicleType(e.target.value)}
                        className="
                          w-28
                          bg-white
                          border
                          border-gray-200
                          rounded-lg
                          px-3
                          py-2
                          text-sm
                          text-gray-700
                          outline-none
                          focus:border-accent-primary-forest
                        "
                      >
                        <option value="Car">Car</option>

                        <option value="Bike">Bike</option>

                        <option value="SUV">SUV</option>

                        <option value="EV">EV</option>

                        <option value="All">All</option>
                      </select>
                    </div>

                    {/* CURRENT OPTIONS */}

                    <div
                      className="
                        mb-4
                        text-xs
                        text-gray-500
                        bg-gray-50
                        rounded-lg
                        px-3
                        py-2
                      "
                    >
                      {searchRadius} km
                      {" • "}
                      {vehicleType}
                    </div>

                    {/* APPLY */}

                    <button
                      type="button"
                      onClick={handleApplyOptions}
                      className="
                        w-full
                        bg-cta-button-rust
                        text-white
                        rounded-lg
                        py-2.5
                        font-dmSans
                        font-semibold
                        hover:opacity-90
                        transition
                      "
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>
            </div>
          </form>

          {/* ACTIVE SEARCH SETTINGS */}

          <div
            className="
              flex
              flex-wrap
              items-center
              justify-center
              gap-2
              mt-4
              text-xs
              sm:text-sm
              text-white/70
            "
          >
            <span>Within {appliedOptions.radius} km</span>

            <span>•</span>

            <span>{appliedOptions.vehicle}</span>
          </div>
        </div>
      </section>

      {/* ==================================================
          MAP + LIST
      ================================================== */}

      <section
        className="
          w-full
          min-w-0
          grid
          grid-cols-1
          lg:grid-cols-[minmax(320px,3fr)_minmax(0,5fr)]
          lg:h-[90vh]
          border-t
        "
      >
        {/* ==================================================
            PARKING LIST
        ================================================== */}

        <div
          className="
            min-w-0
            flex
            flex-col
            lg:border-r
          "
        >
          {/* LIST HEADER */}

          <div
            className="
              shrink-0
              bg-surface-card-white
              border-b
            "
          >
            {/* TITLE */}

            <div
              className="
                border-b
                flex
                flex-wrap
                items-center
                justify-between
                gap-2
                px-3
                sm:px-4
                py-3
              "
            >
              <div
                className="
                  flex
                  flex-wrap
                  items-center
                  gap-2
                "
              >
                <span
                  className="
                    font-dmSans
                    text-secondary-text-stone
                    text-sm
                    sm:text-base
                  "
                >
                  Find. Compare. Park.
                </span>

                {coords && (
                  <span
                    className="
                      text-xs
                      text-gray-400
                    "
                  >
                    {appliedOptions.radius} km
                    {" • "}
                    {appliedOptions.vehicle}
                  </span>
                )}
              </div>

              <span
                className="
                  bg-accent-light-bg-mint
                  rounded-2xl
                  py-1
                  px-3
                  text-accent-primary-forest
                  font-semibold
                  text-xs
                  sm:text-sm
                  whitespace-nowrap
                "
              >
                {filteredParkings.length} found
              </span>
            </div>

            {/* FILTER BUTTONS */}

            <div
              className="
                flex
                flex-wrap
                gap-2
                items-center
                px-3
                py-3
              "
            >
              <button
                type="button"
                onClick={() => setActiveFilter("all")}
                className={`
                  shrink-0
                  text-xs
                  sm:text-sm
                  font-dmSans
                  border
                  rounded-2xl
                  px-3
                  sm:px-4
                  py-1.5
                  whitespace-nowrap
                  ${
                    activeFilter === "all"
                      ? "bg-black text-white font-semibold"
                      : "text-secondary-text-stone"
                  }
                `}
              >
                All
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter("open")}
                className={`
                  shrink-0
                  text-xs
                  sm:text-sm
                  font-dmSans
                  border
                  rounded-2xl
                  px-3
                  sm:px-4
                  py-1.5
                  whitespace-nowrap
                  ${
                    activeFilter === "open"
                      ? "bg-black text-white font-semibold"
                      : "text-secondary-text-stone"
                  }
                `}
              >
                Open Now
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter("cheap")}
                className={`
                  shrink-0
                  text-xs
                  sm:text-sm
                  font-dmSans
                  border
                  rounded-2xl
                  px-3
                  sm:px-4
                  py-1.5
                  whitespace-nowrap
                  ${
                    activeFilter === "cheap"
                      ? "bg-black text-white font-semibold"
                      : "text-secondary-text-stone"
                  }
                `}
              >
                Cheapest
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter("covered")}
                className={`
                  shrink-0
                  text-xs
                  sm:text-sm
                  font-dmSans
                  border
                  rounded-2xl
                  px-3
                  sm:px-4
                  py-1.5
                  whitespace-nowrap
                  ${
                    activeFilter === "covered"
                      ? "bg-black text-white font-semibold"
                      : "text-secondary-text-stone"
                  }
                `}
              >
                Covered
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter("EvCharging")}
                className={`
                  shrink-0
                  text-xs
                  sm:text-sm
                  font-dmSans
                  border
                  rounded-2xl
                  px-3
                  sm:px-4
                  py-1.5
                  whitespace-nowrap
                  ${
                    activeFilter === "EvCharging"
                      ? "bg-black text-white font-semibold"
                      : "text-secondary-text-stone"
                  }
                `}
              >
                EV Charging
              </button>
            </div>
          </div>

          {/* PARKING CARDS */}

          <div
            className="
              bg-white
              p-3
              sm:p-4
              lg:p-5
              space-y-4
              overflow-y-auto
              min-h-0
              lg:flex-1
            "
          >
            {filteredParkings.length > 0 ? (
              filteredParkings.map((parking) => (
                <Card
                  key={parking.id}
                  parking={parking}
                  selectedParking={selectedParking}
                  onClick={() => setSelectedParking(parking)}
                />
              ))
            ) : (
              <div
                className="
                  min-h-[220px]
                  flex
                  flex-col
                  items-center
                  justify-center
                  text-center
                  text-secondary-text-stone
                  font-dmSans
                  px-4
                  gap-2
                "
              >
                {parkings.length === 0 ? (
                  <>
                    <FiSearch
                      className="
                        text-2xl
                        opacity-50
                      "
                    />

                    <span>
                      {coords
                        ? `No parking found within ${appliedOptions.radius} km.`
                        : "Search for a nearby location to find parking."}
                    </span>
                  </>
                ) : (
                  <span>No parking spots match this filter.</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ==================================================
            REAL MAP
        ================================================== */}

        <div
          className="
            min-w-0
            flex
            flex-col
            bg-surface-secondary-linen
          "
        >
          {/* MAP */}

          <div
            className="
              relative
              w-full
              min-w-0
              h-[42vh]
              sm:h-[48vh]
              lg:h-[55vh]
              overflow-hidden
              bg-surface-secondary-linen
            "
          >
            <MapContainer
              center={
                userCoords
                  ? [userCoords.lat, userCoords.lng]
                  : DEFAULT_MAP_CENTER
              }
              zoom={userCoords ? 14 : 5}
              scrollWheelZoom={true}
              className="
                w-full
                h-full
              "
            >
              {/* OPENSTREETMAP */}

              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* MAP CONTROLLER */}

              <MapController
                userCoords={userCoords}
                searchCoords={coords}
                parkings={filteredParkings}
                searchRadius={appliedOptions.radius}
              />

              {/* =================================================
                  USER LOCATION
              ================================================= */}

              {userCoords && (
                <>
                  <CircleMarker
                    center={[userCoords.lat, userCoords.lng]}
                    radius={9}
                    pathOptions={{
                      color: "#ffffff",
                      weight: 3,
                      fillColor: "#2563eb",
                      fillOpacity: 1,
                    }}
                  >
                    <Popup>
                      <strong>Your location</strong>
                    </Popup>
                  </CircleMarker>

                  <CircleMarker
                    center={[userCoords.lat, userCoords.lng]}
                    radius={22}
                    pathOptions={{
                      color: "#2563eb",
                      weight: 1,
                      fillColor: "#2563eb",
                      fillOpacity: 0.12,
                    }}
                  />
                </>
              )}

              {/* =================================================
                  SEARCH RADIUS CIRCLE
              ================================================= */}

              {coords && (
                <Circle
                  center={[coords.lat, coords.lng]}
                  radius={appliedOptions.radius * 1000}
                  pathOptions={{
                    color: "#2f855a",
                    weight: 2,
                    fillColor: "#2f855a",
                    fillOpacity: 0.05,
                  }}
                />
              )}

              {/* =================================================
                  SEARCH LOCATION
              ================================================= */}

              {coords && (
                <CircleMarker
                  center={[coords.lat, coords.lng]}
                  radius={9}
                  pathOptions={{
                    color: "#ffffff",
                    weight: 3,
                    fillColor: "#ea580c",
                    fillOpacity: 1,
                  }}
                >
                  <Popup>
                    <strong>Search location</strong>

                    <br />

                    <span>{location}</span>

                    <br />

                    <span>
                      Search radius: {appliedOptions.radius}
                      {" km"}
                    </span>
                  </Popup>
                </CircleMarker>
              )}

              {/* =================================================
                  PARKING MARKERS
              ================================================= */}

              {filteredParkings.map((parking) => {
                const lat = Number(parking.lat);

                const lng = Number(parking.lng);

                if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
                  return null;
                }

                const isSelected = selectedParking?.id === parking.id;

                return (
                  <CircleMarker
                    key={parking.id}
                    center={[lat, lng]}
                    radius={isSelected ? 10 : 7}
                    pathOptions={{
                      color: "#ffffff",
                      weight: 2,
                      fillColor: isSelected ? "#ef4444" : "#2f855a",
                      fillOpacity: 1,
                    }}
                    eventHandlers={{
                      click: () => setSelectedParking(parking),
                    }}
                  >
                    <Popup>
                      <div
                        className="
                            font-dmSans
                            min-w-[170px]
                          "
                      >
                        <div
                          className="
                              font-semibold
                              text-base
                              mb-1
                            "
                        >
                          {parking.name}
                        </div>

                        <div
                          className="
                              text-sm
                              text-gray-600
                            "
                        >
                          ₹{parking.price}
                          /hr
                        </div>

                        <div
                          className="
                              text-sm
                              text-gray-600
                              mt-1
                            "
                        >
                          {parking.actualDistance ?? parking.baseDistance}
                          {" km away"}
                        </div>

                        <div
                          className="
                              text-sm
                              mt-1
                            "
                        >
                          {parking.availableSpots}
                          {" spots available"}
                        </div>

                        {parking.amenities?.length > 0 && (
                          <div
                            className="
                                flex
                                flex-wrap
                                gap-1
                                mt-2
                              "
                          >
                            {parking.amenities
                              .slice(0, 3)
                              .map((item, index) => (
                                <span
                                  key={index}
                                  className="
                                        text-xs
                                        bg-gray-100
                                        rounded-full
                                        px-2
                                        py-1
                                      "
                                >
                                  {item}
                                </span>
                              ))}
                          </div>
                        )}
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>

            {/* =================================================
                MY LOCATION BUTTON
            ================================================= */}

            <button
              type="button"
              onClick={getUserLocation}
              className="
                absolute
                top-3
                right-3
                z-[1000]
                bg-white
                shadow-md
                border
                rounded-lg
                px-3
                py-2
                flex
                items-center
                gap-2
                text-sm
                font-dmSans
                text-secondary-text-stone
                hover:bg-gray-50
                transition
              "
            >
              <FiNavigation />

              <span className="hidden sm:inline">My location</span>
            </button>

            {/* =================================================
                MAP INFO
            ================================================= */}

            {coords && (
              <div
                className="
                  absolute
                  left-3
                  bottom-3
                  z-[1000]
                  bg-white/95
                  backdrop-blur
                  rounded-lg
                  shadow-md
                  border
                  px-3
                  py-2
                  text-xs
                  sm:text-sm
                  font-dmSans
                  text-secondary-text-stone
                "
              >
                <div className="font-semibold text-gray-900">
                  {appliedOptions.radius} km radius
                </div>

                <div className="text-gray-500">{appliedOptions.vehicle}</div>
              </div>
            )}
          </div>

          {/* ==================================================
              SELECTED PARKING
          ================================================== */}

          {selectedParking && (
            <div
              className="
                w-full
                min-w-0
                lg:flex-1
                overflow-y-auto
              "
            >
              <ParkingCard selectedParking={selectedParking} />
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default App;

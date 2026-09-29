import React from 'react'

const ParkingCard = ({ selectedParking }) => {

  if (!selectedParking) return null

  return (
    <div
      className="
        w-full
        bg-surface-card-white
        border-t
        p-4 sm:p-5
        animate-slideUp
      "
    >

      {/* HEADER */}
      <div className="
        flex
        flex-col
        sm:flex-row
        sm:items-start
        sm:justify-between
        gap-3
      ">

        <div className="min-w-0">

          <h1 className="
            font-semibold
            font-fraunces
            text-xl
            sm:text-2xl
            truncate
          ">
            {selectedParking.name}
          </h1>

          <p className="
            text-sm
            text-secondary-text-stone
            font-dmSans
            mt-1
          ">
            • Updated 1min ago
          </p>

        </div>


        <div className="
          font-dmSans
          shrink-0
          whitespace-nowrap
          text-lg
          sm:text-xl
        ">
          <span className="font-semibold text-accent-primary-forest">
            ₹{selectedParking.price}
          </span>

          <span className="
            font-extralight
            text-secondary-text-stone
            text-sm
          ">
            /hr
          </span>
        </div>

      </div>


      {/* STATS */}
      <div className="
        grid
        grid-cols-2
        sm:grid-cols-4
        gap-2
        mt-5
      ">

        <div className="bg-surface-secondary-linen flex flex-col items-center justify-center py-3 rounded-lg font-dmSans">
          <span className="
            text-[10px]
            sm:text-xs
            text-secondary-text-stone
            uppercase
            text-center
          ">
            Total Spots
          </span>

          <span className="
            text-lg
            font-semibold
            text-accent-primary-forest
          ">
            {selectedParking.totalSpots}
          </span>
        </div>


        <div className="bg-surface-secondary-linen flex flex-col items-center justify-center py-3 rounded-lg font-dmSans">
          <span className="
            text-[10px]
            sm:text-xs
            text-secondary-text-stone
            uppercase
            text-center
          ">
            Available
          </span>

          <span className="
            text-lg
            font-semibold
            text-accent-primary-forest
          ">
            {selectedParking.availableSpots}
          </span>
        </div>


        <div className="bg-surface-secondary-linen flex flex-col items-center justify-center py-3 rounded-lg font-dmSans">
          <span className="
            text-[10px]
            sm:text-xs
            text-secondary-text-stone
            uppercase
            text-center
          ">
            Distance
          </span>

          <span className="
            text-lg
            font-semibold
            text-accent-primary-forest
          ">
            {selectedParking.baseDistance} Km
          </span>
        </div>


        <div className="bg-surface-secondary-linen flex flex-col items-center justify-center py-3 rounded-lg font-dmSans">
          <span className="
            text-[10px]
            sm:text-xs
            text-secondary-text-stone
            uppercase
            text-center
          ">
            Rating
          </span>

          <span className="
            text-lg
            font-semibold
            text-accent-primary-forest
          ">
            {selectedParking.rating}
          </span>
        </div>

      </div>


      {/* AMENITIES */}
      <div className="
        flex
        flex-wrap
        gap-2
        mt-5
      ">

        {selectedParking?.amenities?.map((item, index) => (
          <span
            key={index}
            className="
              inline-flex
              items-center
              bg-info-light-bg-skyblue
              text-info-badge-navy
              rounded-xl
              py-1
              px-2.5
              text-xs
              sm:text-sm
              font-dmSans
              whitespace-nowrap
            "
          >
            {item}
          </span>
        ))}

      </div>


      {/* ACTIONS */}
      <div className="
        grid
        grid-cols-1
        sm:grid-cols-3
        gap-2
        mt-6
      ">

        <button
          className="
            sm:col-span-1
            bg-accent-primary-forest
            text-white
            rounded-lg
            py-2.5
            px-4
            font-dmSans
            hover:opacity-90
            transition
          "
        >
          Get Direction →
        </button>


        <button
          className="
            bg-surface-secondary-linen
            rounded-lg
            py-2.5
            px-4
            font-dmSans
            border
            border-gray-300
            hover:bg-gray-100
            transition
          "
        >
          + Compare
        </button>


        <button
          className="
            bg-surface-secondary-linen
            rounded-lg
            py-2.5
            px-4
            font-dmSans
            border
            border-gray-300
            hover:bg-gray-100
            transition
          "
        >
          Book Spot
        </button>

      </div>

    </div>
  )
}

export default ParkingCard
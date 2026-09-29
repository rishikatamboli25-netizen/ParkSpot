import React from 'react'
import { FiMapPin } from 'react-icons/fi'

const Card = ({ parking, onClick, selectedParking }) => {
  const isSelected = selectedParking?.id === parking.id

  return (
    <div
      onClick={onClick}
      className={`
        w-full min-w-0
        bg-surface-card-white
        border-2
        rounded-xl
        p-4
        font-dmSans
        cursor-pointer
        transition-all duration-200
        hover:border-accent-primary-forest
        hover:shadow-md
        hover:translate-x-1
        ${isSelected
          ? 'bg-accent-mid-fern/5 border-accent-primary-forest translate-x-1 shadow-md shadow-accent-mid-fern/15'
          : ''
        }
      `}
    >

      {/* TOP */}
      <div className="flex items-start justify-between gap-3 min-w-0">

        <h1 className="font-semibold text-base sm:text-lg truncate min-w-0">
          {parking.name}
        </h1>

        <div className="shrink-0 whitespace-nowrap">
          <span className="font-semibold text-accent-primary-forest">
            ₹{parking.price}
          </span>

          <span className="font-extralight text-secondary-text-stone text-sm">
            /hr
          </span>
        </div>

      </div>


      {/* DETAILS */}
      <div className="
        flex flex-wrap
        items-center
        gap-x-4 gap-y-2
        mt-3
        text-sm
        text-secondary-text-stone
      ">

        {/* Distance */}
        <div className="flex items-center gap-1 shrink-0">
          <FiMapPin />

          <span>
            {parking.baseDistance}Km
          </span>
        </div>


        {/* Rating */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-xs sm:text-sm">
            ⭐⭐⭐⭐⭐
          </span>

          <span>
            {parking.rating}
          </span>
        </div>


        {/* Type */}
        <div className="flex items-center gap-1 min-w-0">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0"
          >
            <rect
              x="2"
              y="2"
              width="4"
              height="4"
              fill="none"
              stroke="#6b7280"
              strokeWidth="1"
            />

            <rect
              x="9"
              y="2"
              width="4"
              height="4"
              fill="none"
              stroke="#6b7280"
              strokeWidth="1"
            />

            <rect
              x="2"
              y="9"
              width="4"
              height="4"
              fill="none"
              stroke="#6b7280"
              strokeWidth="1"
            />

            <rect
              x="9"
              y="9"
              width="4"
              height="4"
              fill="none"
              stroke="#6b7280"
              strokeWidth="1"
            />
          </svg>

          <span className="truncate">
            {parking.type}
          </span>
        </div>

      </div>


      {/* AVAILABLE + AMENITIES */}
      <div className="
        flex
        flex-wrap
        items-center
        gap-2
        mt-3
      ">

        <div
          className={`
            shrink-0
            rounded-xl
            px-2.5
            py-1
            text-xs sm:text-sm
            whitespace-nowrap
            ${
              parking.availableSpots < 50
                ? 'bg-red-600/15 text-red-500'
                : 'bg-accent-mid-fern/15 text-accent-primary-forest'
            }
          `}
        >
          {parking.availableSpots} Available
        </div>


        <div className="flex flex-wrap gap-1.5 min-w-0">
          {parking.amenities.map((item, index) => (
            <span
              key={index}
              className="
                inline-flex
                items-center
                rounded-xl
                px-2
                py-1
                text-xs sm:text-sm
                bg-info-light-bg-skyblue
                text-info-badge-navy
                whitespace-nowrap
              "
            >
              {item}
            </span>
          ))}
        </div>

      </div>

    </div>
  )
}

export default Card
/** @type {import('tailwindcss').Config} */
export default {
  content: [
     "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
       colors: {
        // Page
        "page-background-warm-offwhite": "#f7f5f0",

        // Surface
        "surface-card-white": "#ffffff",
        "surface-secondary-linen": "#f0ede6",

        // Border
        "border-default-sand": "#e0dbd0",

        // Text
        "primary-text-charcoal": "#1a1814",
        "secondary-text-stone": "#7a7569",

        // Accent
        "accent-primary-forest": "#2d5a27",
        "accent-mid-fern": "#4a8c42",
        "accent-light-bg-mint": "#e8f2e6",

        // CTA
        "cta-button-rust": "#b84c0a",
        "cta-light-bg-peach": "#fdf0e8",
        "cta-hover-darkrust": "#a03d05",

        // Info
        "info-badge-navy": "#1a4a7a",
        "info-light-bg-skyblue": "#e6eef8",

        // Rating
        "rating-star-gold": "#c49a1a",

        // Compare
        "compare-highlight-bg-cream": "#fdf7e4",
        "compare-best-cell-bg": "#e8f2e6",
        "compare-worst-cell-bg": "#fdeaea",

        // Hero
        "hero-gradient-start-forest": "#2d5a27",
        "hero-gradient-end-darkforest": "#1f3d1c",

        // Availability
        "available-badge-red-bg": "#fdeaea",
        "available-badge-red-text": "#a32020",

        // Map
        "map-block-gray": "#ddd9d0",
        "map-block-dark-gray": "#d0ccc3",
        "map-road-offwhite": "#f5f3ed",
        "map-park-green": "#c8dfc0",
        "map-park-text-green": "#4a7a42",

        // Pin
        "pin-active-rust": "#b84c0a",

        // Recommendation
        "recommendation-body-text-green": "#3a5c35",

        // Scrollbar
        "scrollbar-thumb-sand": "#e0dbd0",
      },


      fontFamily: {
        fraunces: ['Fraunces','sans-serif'],
        dmSans: ['DM Sans', 'sans-serif']
      },

 keyframes: {
  slideUp: {
    '0%': { transform: 'translateY(100%)', opacity: '0' },
    '100%': { transform: 'translateY(0)', opacity: '1' },
  }
},
animation: {
  slideUp: 'slideUp 0.5s ease forwards',
}

    },
  },
  plugins: [],
}


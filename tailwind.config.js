/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@headlessui/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Base colors
        primary: '#2DD4BF',
        'primary-light': '#4ADE80',
        'neutral-light': '#F8FAFC',
        'neutral-dark': '#0F172A',
        'surface-dark': '#1E293B',
        
        // Chart colors - Light Mode
        'chart-light': {
          primary: '#2DD4BF',
          secondary: '#4ADE80',
          tertiary: '#60A5FA',
          success: '#34D399',
          warning: '#F59E0B',
          danger: '#F87171',
          info: '#818CF8',
          gray: '#94A3B8',
          
          // Sustainability specific
          emission: '#34D399',
          'emission-secondary': '#059669',
          fuel: '#60A5FA',
          'fuel-secondary': '#2563EB',
          trees: '#65A30D',
          'trees-secondary': '#3F6212',
          'ai-accent': '#22D3EE',
          'ai-core': '#0891B2'
        },
        
        // Chart colors - Dark Mode
        'chart-dark': {
          primary: '#2DD4BF',
          secondary: '#34D399',
          tertiary: '#60A5FA',
          success: '#4ADE80',
          warning: '#FCD34D',
          danger: '#F87171',
          info: '#818CF8',
          gray: '#94A3B8',
          
          // Sustainability specific
          emission: '#34D399',
          'emission-secondary': '#059669',
          fuel: '#60A5FA',
          'fuel-secondary': '#2563EB',
          trees: '#65A30D',
          'trees-secondary': '#3F6212',
          'ai-accent': '#22D3EE',
          'ai-core': '#0891B2'
        },
        
        tremor: {
          brand: {
            faint: "#eff6ff",
            muted: "#bfdbfe",
            subtle: "#60a5fa",
            DEFAULT: "#3b82f6",
            emphasis: "#1d4ed8",
            inverted: "#ffffff",
          },
          background: {
            muted: "#f9fafb",
            subtle: "#f3f4f6",
            DEFAULT: "#ffffff",
            emphasis: "#374151",
          },
          border: {
            DEFAULT: "#e5e7eb",
          },
          ring: {
            DEFAULT: "#e5e7eb",
          },
          content: {
            subtle: "#9ca3af",
            DEFAULT: "#6b7280",
            emphasis: "#374151",
            strong: "#111827",
            inverted: "#ffffff",
          },
        },
        "dark-tremor": {
          brand: {
            faint: "#0B1229",
            muted: "#172554",
            subtle: "#1e40af",
            DEFAULT: "#3b82f6",
            emphasis: "#60a5fa",
            inverted: "#030712",
          },
          background: {
            muted: "#131A2B",
            subtle: "#1f2937",
            DEFAULT: "#111827",
            emphasis: "#d1d5db",
          },
          border: {
            DEFAULT: "#1f2937",
          },
          ring: {
            DEFAULT: "#1f2937",
          },
          content: {
            subtle: "#4b5563",
            DEFAULT: "#6b7280",
            emphasis: "#e5e7eb",
            strong: "#f9fafb",
            inverted: "#000000",
          },
        },
      },
      fontFamily: {
        sans: ['Lato', 'sans-serif'],
        display: ['Montserrat', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      },
      fontSize: {
        'hero': ['3.5rem', { lineHeight: '1.2', letterSpacing: '-0.05em' }],
        'section': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.02em' }],
        'body': ['1.125rem', { lineHeight: '1.6' }],
      },
      boxShadow: {
        'soft': '0 2px 4px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)',
        'medium': '0 4px 6px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.1)',
        'hard': '0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)',
        'soft-dark': '0 2px 4px rgba(0,0,0,0.2), 0 1px 2px rgba(0,0,0,0.3)',
        'medium-dark': '0 4px 6px rgba(0,0,0,0.25), 0 2px 4px rgba(0,0,0,0.15)',
        'hard-dark': '0 10px 15px rgba(0,0,0,0.3), 0 4px 6px rgba(0,0,0,0.2)',
        'glow-success': '0 4px 6px -1px rgba(46, 229, 157, 0.1)',
        'glow-active': '0 0 8px rgba(45, 212, 191, 0.4)',
        'glow-danger': '0 0 12px rgba(248, 113, 113, 0.3)'
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale': 'scale 0.2s ease-in-out',
        'blob': 'blob 7s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scale: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.05)' },
        },
        blob: {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
          '100%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #2E8B57 0%, #40E0D0 100%)',
      },
      backdropFilter: {
        'none': 'none',
        'blur': 'blur(20px)',
      },
      mixBlendMode: {
        'multiply': 'multiply',
      },
      borderRadius: {
        'tremor-small': '0.375rem',
        'tremor-default': '0.5rem',
        'tremor-full': '9999px',
      },
    },
  },
  safelist: [
    {
      pattern:
        /^(bg-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "ui-selected"],
    },
    {
      pattern:
        /^(text-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "ui-selected"],
    },
    {
      pattern:
        /^(border-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "ui-selected"],
    },
    {
      pattern:
        /^(ring-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
    {
      pattern:
        /^(stroke-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
    {
      pattern:
        /^(fill-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
  ],
  plugins: [],
}
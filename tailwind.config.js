/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx}",
    "./public/index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#2563eb',
          DEFAULT: '#1a365d',
          dark: '#1e40af'
        },
        secondary: {
          light: '#4b5563',
          DEFAULT: '#2d3748',
          dark: '#1f2937'
        },
        accent: {
          light: '#f97316',
          DEFAULT: '#ed8936',
          dark: '#ea580c'
        }
      },
      backgroundColor: {
        dark: {
          primary: '#1a1a1a',
          secondary: '#2d2d2d',
          accent: '#3d3d3d'
        }
      },
      textColor: {
        dark: {
          primary: '#ffffff',
          secondary: '#e5e5e5',
          muted: '#a0aec0'
        }
      },
      borderColor: {
        dark: {
          DEFAULT: '#404040',
          accent: '#525252'
        }
      },
      ringColor: {
        dark: {
          DEFAULT: '#404040',
          accent: '#525252'
        }
      },
      boxShadow: {
        'dark-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
        'dark': '0 1px 3px 0 rgba(0, 0, 0, 0.5), 0 1px 2px -1px rgba(0, 0, 0, 0.5)',
        'dark-md': '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -2px rgba(0, 0, 0, 0.5)',
        'dark-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.5)'
      }
    }
  },
  plugins: []
} 
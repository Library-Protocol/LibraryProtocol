import tailwindcssLogical from 'tailwindcss-logical'
import type { Config } from 'tailwindcss'

import tailwindPlugin from './src/@core/tailwind/plugin'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,css}'],
  corePlugins: {
    preflight: false
  },
  important: '#__next',
  plugins: [tailwindcssLogical, tailwindPlugin],
  theme: {
    extend: {
      colors: {
        brown: {
          500: '#A0522D', // Sienna
          600: '#8B4513', // SaddleBrown
          700: '#654321', // Dark Brown
          800: '#5C4033', // Very Dark Brown
        },
      },
    }
  }
}

export default config

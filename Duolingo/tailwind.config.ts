import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        duo: {
          green: '#58CC02',
          'green-border': '#46A302',
          'green-bg': '#D7FFB8',
          red: '#FF4B4B',
          'red-border': '#EA2B2B',
          'red-bg': '#FFDFE0',
          yellow: '#FFC800',
          'yellow-border': '#E5A500',
          blue: '#1CB0F6',
          'blue-border': '#1899D6',
          'blue-bg': '#DDF4FF',
          'gray-disabled': '#E5E5E5',
          'gray-border': '#CECECE',
          main: '#4B4B4B',
          muted: '#AFAFAF',
          subtle: '#E5E5E5',
        },
      },
      boxShadow: {
        'duo-green': '0 4px 0 #46A302',
        'duo-red': '0 4px 0 #EA2B2B',
        'duo-blue': '0 4px 0 #1899D6',
        'duo-yellow': '0 4px 0 #E5A500',
        'duo-gray': '0 4px 0 #CECECE',
        'duo-card': '0 4px 0 #E5E5E5',
      },
    },
  },
  plugins: [],
};

export default config;

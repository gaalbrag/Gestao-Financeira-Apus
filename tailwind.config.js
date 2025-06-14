
// This file is typically used when Tailwind CSS is installed as a PostCSS plugin.
// For CDN usage, the configuration is embedded in the <script> tag in index.html.
// However, to represent the color palette as per standard project structure:
module.exports = {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
      },
      colors: {
        'primary-dark': '#003642',
        'secondary-accent': '#ed511b',
        'neutral-light-gray': '#e1e1e1',
        'neutral-bg': '#f7fafc',
        'neutral-card': '#ffffff',
        'text-dark': '#1a202c',
        'text-light': '#f8f8f8',
        'text-muted': '#718096',
      },
    },
  },
  plugins: [],
};

module.exports = {
  mode: 'jit',
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'], // Updated from 'purge' to 'content'
  theme: {
    extend: {},
  },
  plugins: [],
};

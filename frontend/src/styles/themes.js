// src/styles/themes.js
export const theme = {
  colors: {
    primary: '#FFB88C',      // Peach (main accent)
    secondary: '#440c06',    // Lighter peach/soft orange
    accent: '#ffffffff',       // Light orange/peach tint
    background: 'linear-gradient(135deg, #FFB88C 0%, #FFE5B4 50%, #FFFFFF 100%)', // Peach to light orange to white
    background2: 'linear-gradient(45deg, #FFF1EB 0%, #FFDAB9 100%)',  // Pale peach and white
    textPrimary: '#3f241dff',  // Brown tone for readability
    textSecondary: '#9c2110',// Muted brown for secondary text
    cardBackground: 'rgba(255, 247, 239, 0.95)', // Nearly-white card, glassmorphism-friendly
    cardBorder: 'rgba(255, 184, 140, 0.2)',      // Peachy border
    inputBackground: 'rgba(255, 248, 240, 0.7)', // Very light peach
    inputBorder: 'rgba(255, 184, 140, 0.3)',     // Peachy border for inputs
    buttonHover: '#FFA664',   // Stronger peach for hover
    success: '#75C9A6',       // Soft green (optional override)
    error: '#FF7272',         // Warm red
    warning: '#FFD580',       // Light yellow-orange
  },
  fonts: {
    heading: "'Montserrat', sans-serif",
    body: "'Open Sans', sans-serif",
  },
  spacing: (factor) => `${factor * 8}px`, // 8px grid system
  borderRadius: '8px',
  boxShadow: '0 8px 32px 0 rgba(255, 184, 140, 0.19)', // Peach tint for glass effect
};

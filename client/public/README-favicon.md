# Math Farm Favicon Setup

This directory contains the favicon and icon files for Math Farm.

## Files Created

### Primary Favicon

- `favicon.svg` - Main SVG favicon with Math Farm radical symbol and purple gradient
- `favicon-simple.svg` - Simplified version for very small sizes

### Apple/iOS Icons

- `apple-touch-icon.svg` - High-quality 180x180 icon for iOS devices

### PWA/Manifest

- `manifest.json` - Web app manifest for PWA support with shortcuts and metadata

### Development Tools

- `favicon-generator.html` - HTML page to generate PNG versions of favicons
- `README-favicon.md` - This documentation file

## Design Details

### Color Scheme

- Primary: `hsl(262, 65%, 45%)` - Math Farm purple
- Secondary: `hsl(270, 75%, 65%)` - Lighter purple accent
- Border: `hsl(262, 65%, 35%)` - Darker purple border
- Symbol: White with subtle gradient

### Symbol Design

The favicon features a mathematical radical (square root) symbol (√) which represents:

- Mathematical focus of the platform
- Growth and learning (roots growing)
- Problem-solving (finding the root of problems)

### Responsive Design

- 32x32: Full detailed version with gradient and mathematical expression
- 16x16: Simplified version focusing on the radical symbol
- 180x180: Enhanced version for Apple touch icons with shadows and details

## Browser Support

### Modern Browsers

- Chrome, Firefox, Safari, Edge: Uses `favicon.svg` (vector, scalable)

### Fallback Support

- Older browsers: Should fall back to `favicon.ico` (needs to be generated)

### Mobile/PWA

- iOS: Uses `apple-touch-icon.svg`
- Android/PWA: Uses icons defined in `manifest.json`

## Generating Additional Formats

To create PNG and ICO versions:

1. Open `favicon-generator.html` in a browser
2. Right-click each canvas and save as PNG
3. Use an online ICO converter to create `favicon.ico` from the 16x16 and 32x32 PNGs
4. Save the ICO file as `favicon.ico` in this directory

## Testing

The favicon should appear in:

- Browser tabs
- Bookmarks
- Browser history
- PWA app icons
- iOS home screen (when added to home screen)

## Accessibility

The favicon uses:

- High contrast white symbol on purple background
- Simple, recognizable mathematical symbol
- Scalable vector format for crisp display at any size

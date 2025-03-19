# Viewport Dimensions

A browser extension for Chrome and Edge that displays the current viewport dimensions in real-time as you resize the browser window.

## Features

- **Real-Time Viewport Display**: Instantly see the current viewport dimensions as you resize your browser window
- **Customizable Display Options**: 
  - Position (top-right, bottom-right, top-left, bottom-left)
  - Font size (small, medium, large)
  - Text color
  - Background color
  - Background opacity
- **Toggle Visibility**: Easily enable or disable the viewport dimensions display using the toggle switch at the top of the settings panel
- **Auto-Hide Option**: Choose to always show the dimensions or hide them after a specified time
- **Responsive**: Works with DevTools open and adjusts to window changes

## Installation

### Chrome/Edge
1. Download or clone this repository
2. Open Chrome/Edge and navigate to `chrome://extensions` or `edge://extensions`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory

## Usage

1. Click the extension icon in your browser toolbar to open the settings panel
2. Toggle the extension on/off using the switch in the header - this immediately shows or hides the display
3. Customize the display settings:
   - Choose the display position
   - Select the font size
   - Pick text and background colors
   - Adjust background opacity
   - Enable "Always Show" or set a hide timeout
4. Click "Save Settings" to apply your changes

## Troubleshooting

If the viewport dimensions display doesn't appear:
- Make sure the extension is enabled (toggle switch at the top is turned on)
- Try refreshing the page
- Check if the extension has the necessary permissions

## Development

The extension is built using vanilla JavaScript and follows Chrome's Extension Manifest V3 guidelines.

### Project Structure
viewport-dimensions/
├── manifest.json
├── popup.html
├── scripts/
│ ├── content.js
│ └── popup.js
├── styles/
│ └── content.css
└── icons/
└── icon.svg


### Building Icons
To generate the required icon sizes from the SVG, you can use tools like:
- Inkscape
- SVGOMG
- ImageMagick

Generate the following sizes: 16x16, 32x32, 48x48, and 128x128 pixels.

## License

MIT License - feel free to use this code in your own projects!
```
# Starmap Application

## Overview
The Starmap Application is an interactive web application that allows users to view the night sky as it appears from their current location. Users can adjust the brightness of visible stars and click on them to get more information.

## Features
- **Geolocation**: Automatically detects the user's current location to display the corresponding star map.
- **Interactive Star Map**: Users can select the brightness levels of stars they wish to view.
- **Star Information**: Clickable stars that provide detailed information about each star.

## Project Structure
```
starmap-app
├── src
│   ├── index.html          # Main HTML document
│   ├── js
│   │   ├── app.js         # Main application logic
│   │   ├── starmap.js     # Logic for rendering the star map
│   │   ├── geolocation.js  # Geolocation functionality
│   │   └── stardata.js     # Star data management
│   ├── css
│   │   ├── styles.css      # General styles
│   │   └── starmap.css     # Styles specific to the starmap
│   └── data
│       └── stars.json      # Star data
├── package.json            # npm configuration file
└── README.md               # Project documentation
```

## Installation
1. Clone the repository:
   ```
   git clone https://github.com/yourusername/starmap-app.git
   ```
2. Navigate to the project directory:
   ```
   cd starmap-app
   ```
3. Install dependencies:
   ```
   npm install
   ```

## Usage
1. Open `src/index.html` in a web browser.
2. Allow geolocation access when prompted.
3. Adjust the brightness slider to filter visible stars.
4. Click on any star to view detailed information.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any suggestions or improvements.

## License
This project is licensed under the MIT License. See the LICENSE file for details.
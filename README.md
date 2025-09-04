# Bill Splitter

A modern, feature-rich bill splitting application for calculating fair expense splits among multiple participants.

## 🚀 Features

- **Fair Bill Splitting**: Calculate how much each participant owes to others
- **Real-time Calculations**: Automatic updates as you type
- **Data Persistence**: Save and load your data as JSON files
- **Export Options**: Export results to text format
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Accessibility**: Full keyboard navigation and screen reader support
- **Modern UI**: Clean, intuitive interface with smooth animations

## 🏗️ Architecture

The application is built using a modular architecture with clear separation of concerns:

### Core Modules

1. **DataManager** (`js/data-manager.js`)
   - Manages all application data (participants, bills, state)
   - Provides data validation and event system
   - Handles data import/export operations

2. **CalculationEngine** (`js/calculation-engine.js`)
   - Performs all bill splitting calculations
   - Generates payment instructions
   - Validates input data

3. **UIManager** (`js/ui-manager.js`)
   - Handles all DOM manipulation and user interactions
   - Manages table operations (sorting, drag & drop)
   - Updates the interface in real-time

4. **FileManager** (`js/file-manager.js`)
   - Handles file operations (save/load JSON, export results)
   - Provides user notifications
   - Manages file validation

5. **BillSplitterApp** (`js/app.js`)
   - Main application controller
   - Coordinates all modules
   - Handles application lifecycle

## 📁 File Structure

```
Bills/
├── index.html                    # Main HTML file
├── styles.css                    # Modern CSS with CSS custom properties
├── js/
│   ├── data-manager.js           # Data management module
│   ├── calculation-engine.js     # Calculation logic module
│   ├── ui-manager.js             # User interface module
│   ├── file-manager.js           # File operations module
│   └── app.js                    # Main application controller
└── README.md                     # This documentation
```

## 🎨 Design System

### CSS Custom Properties

The application uses CSS custom properties (variables) for consistent theming:

```css
:root {
    --color-primary: #2c3e50;
    --color-success: #27ae60;
    --color-danger: #e74c3c;
    --spacing-md: 1rem;
    --font-size-base: 1rem;
    /* ... and many more */
}
```

### Color Palette

- **Primary**: Dark blue-gray (#2c3e50)
- **Success**: Green (#27ae60)
- **Danger**: Red (#e74c3c)
- **Info**: Blue (#3498db)
- **Warning**: Orange (#f39c12)

### Typography

- **Font Family**: Courier New (monospace) for technical feel
- **Responsive**: Scales appropriately on different screen sizes
- **Accessibility**: High contrast support and reduced motion options

## 🔧 Key Features

### 1. Modular Architecture
- 5 focused modules with clear responsibilities
- Clean separation of concerns
- Easy to maintain and extend

### 2. Error Handling
- Comprehensive input validation
- User-friendly error messages
- Graceful error recovery

### 3. Performance
- Debounced calculations for better performance
- Efficient DOM updates
- Optimized event handling

### 4. Accessibility
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

### 5. Code Quality
- ES6+ features and modern JavaScript
- Comprehensive JSDoc documentation
- Consistent naming conventions
- Separation of concerns

## 🚀 Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (optional, for development)

### Installation

1. Clone or download the project files
2. Open `index.html` in your web browser
3. Or serve the files using a local web server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```

### Usage

1. **Set Up Participants**: Enter the number of people and their names
2. **Add Bills**: Enter expenses with who paid and who should share
3. **View Results**: See calculated balances and payment instructions
4. **Save/Load**: Use JSON files to persist your data
5. **Export**: Download results in text format

## ⌨️ Keyboard Shortcuts

- **Ctrl/Cmd + S**: Save data to JSON
- **Ctrl/Cmd + O**: Load data from JSON
- **Ctrl/Cmd + E**: Export results
- **Ctrl/Cmd + N**: Add new bill
- **Escape**: Close notifications or reset focus

## 🧪 Testing

The application includes comprehensive error handling and validation:

- Input validation for all user inputs
- File format validation for JSON imports
- Graceful error recovery
- User-friendly error messages

## 📱 Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 🤝 Contributing

When contributing to this project:

1. Follow the existing code style and architecture
2. Add appropriate error handling
3. Include JSDoc documentation for new functions
4. Test across different browsers and devices
5. Ensure accessibility compliance

## 📄 License

© 2025 Victor Lü. All rights reserved.

## 🔮 Future Enhancements

Potential improvements for future versions:

- [ ] Data persistence in browser storage
- [ ] Multi-language support
- [ ] Advanced reporting features
- [ ] Integration with payment apps
- [ ] Mobile app version
- [ ] Collaborative editing
- [ ] Bill templates
- [ ] Currency support
- [ ] Tax calculations
- [ ] Receipt photo upload

## 🐛 Known Issues

- None currently identified

## 📞 Support

For issues or questions, please refer to the code documentation or create an issue in the project repository.

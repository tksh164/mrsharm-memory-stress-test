# Memory Stress Tester

A sophisticated ASP.NET Core web application that demonstrates controlled memory allocation and out-of-memory (OOM) scenarios with a beautiful, modern frontend.

## 🚀 Features

### Core Functionality
- **Dynamic Memory Allocation**: Allocate specific amounts of memory through an intuitive interface
- **Configurable Thresholds**: Set memory thresholds that trigger 500 Internal Server Error responses
- **OOM Simulation**: Safely simulate out-of-memory conditions
- **Stress Testing**: Run automated stress tests with configurable parameters
- **Real-time Monitoring**: Live memory usage statistics and visualizations

### Frontend Highlights
- **Modern UI**: Beautiful gradient design with glass-morphism effects
- **Interactive Controls**: Sliders, input validation, and responsive design
- **Real-time Charts**: Canvas-based memory usage visualization
- **Toast Notifications**: User-friendly feedback system
- **Loading States**: Smooth loading animations and progress indicators
- **Responsive Design**: Works on desktop and mobile devices

### Technical Features
- **ASP.NET Core 8.0**: Latest framework with minimal APIs
- **Memory Management**: Sophisticated memory allocation service
- **Error Handling**: Proper 500 error responses when thresholds exceeded
- **Garbage Collection**: Automatic and manual memory cleanup
- **Configuration**: Flexible settings via appsettings.json
- **Logging**: Comprehensive application logging

## 🛠️ Setup & Running

### Prerequisites
- .NET 8.0 SDK
- Visual Studio 2022 or VS Code

### Quick Start

1. **Clone and Navigate**
   ```bash
   cd c:\Users\musharm\source\repos\IaCDemo
   ```

2. **Run the Application**
   ```bash
   dotnet run
   ```

3. **Open in Browser**
   - Navigate to `https://localhost:7001` or `http://localhost:5000`

### Configuration

Edit `appsettings.json` to customize memory limits:

```json
{
  "MemorySettings": {
    "DefaultThresholdMB": 1024,      // Default threshold in MB
    "MaxAllowedThresholdMB": 4096,   // Maximum allowed threshold
    "CleanupIntervalSeconds": 30     // Auto-cleanup interval
  }
}
```

## 📊 How It Works

### Memory Allocation Process

1. **Input Validation**: User specifies memory amount and threshold
2. **Pre-allocation Check**: Validates if allocation would exceed threshold
3. **Memory Allocation**: Creates byte arrays filled with random data
4. **Threshold Monitoring**: Continuously monitors memory usage
5. **Error Response**: Returns HTTP 500 when thresholds exceeded

### API Endpoints

- `POST /api/memory/allocate` - Allocate specified memory amount
- `GET /api/memory/status` - Get current memory statistics
- `POST /api/memory/clear` - Clear all allocations and force GC
- `POST /api/memory/stress-test` - Run automated stress test
- `GET /api/memory/settings` - Get configuration settings

### Memory Monitoring

The application tracks:
- **Total Allocated Memory**: GC.GetTotalMemory()
- **Working Set**: Environment.WorkingSet
- **Managed Memory**: Heap allocations
- **GC Collections**: Generation 0, 1, and 2 counts
- **Active Allocations**: Number of memory blocks held

## 🎯 Usage Scenarios

### Basic Memory Allocation
1. Set memory amount (e.g., 512 MB)
2. Set threshold (e.g., 1024 MB)
3. Click "Allocate Memory"
4. Monitor results in real-time

### Triggering 500 Errors
1. Set threshold to 1GB (1024 MB)
2. Allocate 600 MB several times
3. When total exceeds 1GB, server returns HTTP 500
4. Error details shown in results panel

### Stress Testing
1. Configure iterations (e.g., 10)
2. Set MB per iteration (e.g., 100 MB)
3. Set delay between allocations
4. Run stress test to systematically hit limits

## 🎨 UI Components

### Dashboard Cards
- **Memory Status**: Real-time memory statistics
- **Allocation Controls**: Input sliders and buttons
- **Stress Test**: Automated testing controls
- **Results Panel**: Operation history and outcomes

### Interactive Elements
- **Memory Slider**: Visual memory amount selection
- **Threshold Input**: Configurable OOM trigger point
- **Progress Bars**: Stress test progress indication
- **Charts**: Canvas-based memory usage visualization

### Feedback Systems
- **Toast Notifications**: Success/error/warning messages
- **Loading Overlays**: During memory operations
- **Result Cards**: Detailed operation outcomes
- **Color Coding**: Visual status indicators

## ⚙️ Technical Implementation

### Memory Service
- Thread-safe memory allocations using ConcurrentDictionary
- Automatic cleanup to prevent indefinite growth
- GC integration for proper memory management
- Exception handling for OOM scenarios

### Error Handling
- Custom middleware for global exception handling
- Proper HTTP status codes (500 for threshold exceeded)
- Detailed error messages and debugging information
- Client-side error display and user feedback

### Performance Optimizations
- Efficient memory allocation using byte arrays
- Canvas-based charting for smooth performance
- Debounced UI updates to prevent flickering
- Auto-refresh with background status updates

## 🔧 Development

### Project Structure
```
├── Controllers/
│   └── MemoryController.cs      # API endpoints
├── Services/
│   ├── MemoryStressService.cs   # Core memory management
│   └── MemorySettings.cs        # Configuration model
├── Properties/
│   └── launchSettings.json      # Development settings
├── wwwroot/
│   ├── index.html               # Main UI
│   ├── styles.css               # Modern styling
│   └── app.js                   # Frontend logic
├── Program.cs                   # Application entry point
└── appsettings.json            # Configuration
```

## 🎉 Impressive Features

This application goes beyond basic requirements to provide:

1. **Visual Excellence**: Modern, glass-morphism UI with smooth animations
2. **Real-time Feedback**: Live charts and status updates
3. **Progressive Enhancement**: Works without JavaScript (API still functional)
4. **Error Simulation**: Controlled OOM scenarios for testing
5. **Monitoring Dashboard**: Comprehensive memory statistics
6. **Stress Testing**: Automated threshold testing
7. **Mobile Responsive**: Works on all device sizes
8. **Production Ready**: Proper logging, error handling, and configuration

## 🚨 Safety Notes

- Memory allocations are automatically cleaned up
- Maximum allocation limits prevent system crashes
- Garbage collection is forced during cleanup operations
- Background cleanup runs periodically to prevent indefinite growth

Enjoy exploring memory management and OOM scenarios in a safe, controlled environment! 🎯

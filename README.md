# LoadUp Talent Pool Application

A robust, scalable application for managing and filtering an applicant database with an intuitive interface.

## Features

- **Smart API Integration**: Intelligently fetches and caches applicant data using advanced discovery methods
- **Comprehensive Filtering**: Filter applicants by location and driver's license, with special handling for missing values
- **Responsive UI**: Clean React interface with dynamic filter options
- **Batch Processing**: Efficiently handles large datasets (up to 25,000+ applicants) using batch operations
- **Mock Contact System**: Simulated functionality for contacting selected applicants
- **Resilient Error Handling**: Gracefully handles API failures and edge cases

## Architecture

### Backend Architecture

The backend follows a clean, modular architecture:

- **Routes**: RESTful API endpoints with clear separation of concerns
- **Controllers**: Lightweight request handlers focused on HTTP concerns
- **Services**: Core business logic with smart caching and filtering capabilities
- **Data Access**: Intelligent API discovery with primary and fallback methods

### Frontend Architecture

The frontend uses a component-based React architecture with:

- **App**: Central state management with clean data flow
- **Filters**: Dynamic, API-driven filtering component
- **ApplicantList**: Efficient rendering with optimized data display
- **API Service**: Centralized communication with the backend

## Technical Details

### API Discovery System

The application uses a sophisticated dual-approach API discovery system:

1. **Primary Method**: Metadata-based discovery that efficiently determines the exact dataset size
2. **Fallback Method**: Batch-based sequential discovery that adapts to available data
3. **Smart Batching**: Processes API requests in configurable batches to balance performance and server load
4. **Early Termination**: Intelligently stops discovery when patterns indicate no more data is available

### Data Processing

- Advanced extraction logic for diverse data structures
- Intelligent fallback mechanisms for missing data
- Normalized data model with consistent handling of N/A values
- Memory-efficient data handling for large datasets

Here's the second half of the README file that you can copy directly:


## Setup Instructions

### Prerequisites

- Node.js 16+ and npm
- Docker and Docker Compose (optional, for containerized setup)

### Local Development

#### Backend Setup

1. Navigate to the backend directory:
   cd backend

2. Install dependencies:
   npm install

3. Start the development server:
   npm run dev

The backend will run on http://localhost:3001

#### Frontend Setup

1. Navigate to the frontend directory:
   cd frontend

2. Install dependencies:
   npm install

3. Start the development server:
   npm start

The frontend will run on http://localhost:3000

### Docker Setup

For a containerized setup:

1. Make sure Docker and Docker Compose are installed

2. Build and start the containers:
   docker compose up --build

The application will be accessible at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Testing

The application includes comprehensive unit tests:

# Run backend tests
cd backend
npm test

# Run frontend tests (if implemented)
cd frontend
npm test

The test suite uses Jest with mocked API responses for reliable, deterministic testing.

## Design Decisions

### Technology Choices

- **Express.js**: Chosen for its lightweight, flexible architecture and excellent middleware support
- **React**: Selected for its component model, efficient rendering, and robust ecosystem
- **Axios**: Used for its promise-based API and request/response interceptors
- **Jest**: Employed for comprehensive testing with powerful mocking capabilities

### Performance Considerations

- **Caching**: Implements a time-based caching system to minimize redundant API calls
- **Batch Processing**: Fetches data in optimized batches to balance speed and server load
- **Parallel Requests**: Uses Promise.all for concurrent processing within safe batch limits
- **Early Termination**: Intelligently stops processing when patterns indicate no more data is available

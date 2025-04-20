# Customer Meetings App

A full-stack application for managing customer information and meeting records. This application allows you to track customers and document meetings with them.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup Instructions](#setup-instructions)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Application Architecture](#application-architecture)
  - [Backend Architecture](#backend-architecture)
  - [Frontend Architecture](#frontend-architecture)
- [API Endpoints](#api-endpoints)
- [Bulk Upload Functionality](#bulk-upload-functionality)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## Features

- Create, read, update, and delete customer records
- Schedule and document customer meetings
- Filter and search functionality for customers and meetings
- Bulk import of customer and meeting data via CSV or JSON
- Track customer engagement through meeting history
- Responsive UI for desktop and mobile usage

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Jest for testing

### Frontend
- React
- React Bootstrap for UI components
- Axios for API requests
- Moment.js for date handling
- React Testing Library for component testing

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- MongoDB (local instance or MongoDB Atlas)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/customer_meetings_app
   NODE_ENV=development
   ```

4. Start the backend server:
   ```bash
   npm start
   ```
   
   For development with auto-restart:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm start
   ```

4. The application will be available at `http://localhost:3000`

## Application Architecture

### Backend Architecture

The backend is structured following the MVC (Model-View-Controller) pattern:

- **Models**: Define the data structure and validation rules
  - `Customer.js`: Customer data model
  - `Meeting.js`: Meeting data model with relations to customers

- **Controllers**: Handle business logic for each route
  - `customerController.js`: Logic for customer CRUD operations
  - `meetingController.js`: Logic for meeting CRUD operations
  - `bulkUploadController.js`: Handles bulk data imports

- **Routes**: Define API endpoints and map them to controllers
  - `customerRoutes.js`: Customer-related endpoints
  - `meetingRoutes.js`: Meeting-related endpoints
  - `bulkUploadRoutes.js`: Bulk import endpoints

### Frontend Architecture

The frontend is organized by feature and follows React best practices:

- **Components**: Reusable UI elements
  - Customer-related components (`CustomerList.js`, `CustomerForm.js`, etc.)
  - Meeting-related components (`MeetingList.js`, `MeetingForm.js`, etc.)
  - Shared components (`Navigation.js`, `BulkUpload.js`, etc.)

- **Services**: Handles API communication
  - `api.js`: Contains all API call functions

- **Context**: (Optional) Provides state management across components

## API Endpoints

### Customer Endpoints
- `GET /api/customers`: Get all customers
- `GET /api/customers/:id`: Get a specific customer
- `POST /api/customers`: Create a new customer
- `PUT /api/customers/:id`: Update a customer
- `DELETE /api/customers/:id`: Delete a customer

### Meeting Endpoints
- `GET /api/meetings`: Get all meetings
- `GET /api/meetings/:id`: Get a specific meeting
- `POST /api/meetings`: Create a new meeting
- `PUT /api/meetings/:id`: Update a meeting
- `DELETE /api/meetings/:id`: Delete a meeting
- `GET /api/customers/:customerId/meetings`: Get meetings for a specific customer

### Bulk Upload Endpoints
- `POST /api/upload/customers`: Bulk upload customers via CSV or JSON
- `POST /api/upload/meetings`: Bulk upload meetings via CSV or JSON

## Bulk Upload Functionality

The application supports bulk importing of customer and meeting data via:

1. CSV files with headers matching model properties
2. JSON files containing arrays of objects

To use this feature:
1. Navigate to the Bulk Upload page
2. Select the entity type (Customers or Meetings)
3. Upload your CSV or JSON file
4. Review the upload results

## Testing

### Backend Tests

Run backend tests:
```bash
cd backend
npm test
```

### Frontend Tests

Run frontend tests:
```bash
cd frontend
npm test
```

## Troubleshooting

### Common Issues

- **MongoDB Connection Error**: Ensure MongoDB is running and the connection string in `.env` is correct
- **API 404 Errors**: Check that both backend and frontend servers are running
- **CORS Issues**: Ensure the backend is properly configured to allow requests from the frontend origin
- **Bulk Upload Errors**: Verify your CSV headers match the expected property names

For additional help, check the console logs in your browser and the terminal running the backend server.

---

Built with ❤️ (and AI) for efficient customer relationship management

# Transaction-Management-App
A **MERN stack project** for managing product transactions, generating monthly statistics, and visualizing price-based bar chart data using MongoDB, Express, React, and Node.js.

## Features
- Backend API for:
  - Initializing the database with third-party data.
  - Fetching paginated and filtered transactions.
  - Generating monthly statistics.
  - Providing bar chart data by price range.
- Frontend for displaying transactions, statistics, and charts.
- MongoDB for data storage.

---

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/roxiler-mern-project.git
cd roxiler-mern-project
```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies and start the backend:
   ```bash
   npm install
   node app.js
   ```

3. Backend will run on **http://localhost:5000**.

### 3. Frontend Setup
1. Navigate to the frontend directory in a new terminal instance:
   ```bash
   cd frontend
   ```

2. Install dependencies and start the frontend:
   ```bash
   npm install
   npm start
   ```

3. Frontend will run on **http://localhost:3000**.

> **Note**: Keep the backend server running while using the frontend.

---

## API Endpoints

### Initialize Database
- **`GET /api/initialize-database`**
- Populates the database with product transaction data.

### Fetch Transactions
- **`GET /api/transactions?month=<month>&page=<page>&limit=<limit>&search=<search>`**
- Fetches paginated and filtered transactions.

### Fetch Statistics
- **`GET /api/statistics?month=<month>`**
- Provides total sales, sold items, and unsold items for a given month.

### Fetch Bar Chart Data
- **`GET /api/bar-chart?month=<month>`**
- Provides bar chart data by price ranges.

---

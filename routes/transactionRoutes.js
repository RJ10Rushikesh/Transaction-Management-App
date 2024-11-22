const express = require('express');
const router = express.Router();
const {
    fetchAndInitializeDatabase,
    listTransactions,
    getBarChartData,
    getStatistics
} = require('../controllers/transactionController');

// Route to initialize database
router.get('/initialize', fetchAndInitializeDatabase);

// Route to list transactions
router.get('/transactions', listTransactions);

// Route to get bar chart data
router.get('/bar-chart', getBarChartData);

// Route to get statistics
router.get('/statistics', getStatistics);

module.exports = router;
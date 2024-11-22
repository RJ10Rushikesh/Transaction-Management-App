const axios = require('axios');
const ProductTransaction = require('../models/ProductTransaction');

// Initialize the database by fetching data from a third-party API
const fetchAndInitializeDatabase = async (req, res) => {
    try {
        const { data } = await axios.get(process.env.THIRD_PARTY_API);

        await ProductTransaction.deleteMany({});

        const transactions = data.map(item => ({
            productTitle: item.title,
            productDescription: item.description,
            productPrice: item.price,
            category: item.category,
            dateOfSale: new Date(item.dateOfSale),
            isSold: item.sold,
            imageUrl: item.image
        }));
        await ProductTransaction.insertMany(transactions);

        res.status(200).json({ message: 'Database initialized successfully!' });
    } catch (error) {
        console.error('Error initializing database:', error);
        res.status(500).json({ error: 'Error initializing database.' });
    }
};

// List transactions based on filters: month, page, limit, search
const listTransactions = async (req, res) => {
    const { month, page = 1, limit = 10, search = '' } = req.query;

    try {
        // Convert month name to month index
        const monthIndex = new Date(`${month} 1, 2000`).getMonth();
        if (isNaN(monthIndex)) {
            return res.status(400).json({ error: 'Invalid month provided.' });
        }

        const query = {
            $expr: {
                $eq: [{ $month: "$dateOfSale" }, monthIndex + 1]
            }
        };

        if (search) {
            query.$or = [
                { productTitle: { $regex: search, $options: 'i' } },
                { productDescription: { $regex: search, $options: 'i' } }
            ];
        }

        const transactions = await ProductTransaction.find(query)
            .skip((page - 1) * limit)  // Skip based on page and limit
            .limit(Number(limit));     // Limit the number of records returned

        const total = await ProductTransaction.countDocuments(query);

        res.status(200).json({ total, transactions });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Error fetching transactions.' });
    }
};

// Generate bar chart data based on the specified month and product price ranges
const getBarChartData = async (req, res) => {
    const { month } = req.query;

    if (!month) {
        return res.status(400).json({ error: 'Month parameter is required.' });
    }

    const monthIndex = new Date(`${month} 1, 2024`).getMonth();
    if (isNaN(monthIndex)) {
        return res.status(400).json({ error: 'Invalid month provided.' });
    }

    try {
        const barChartData = await ProductTransaction.aggregate([
            {
                $match: {
                    $expr: {
                        $eq: [{ $month: "$dateOfSale" }, monthIndex + 1]
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $switch: {
                            branches: [
                                { case: { $lt: ["$productPrice", 100.0] }, then: "0-100" },
                                { case: { $and: [{ $gte: ["$productPrice", 100.0] }, { $lt: ["$productPrice", 200.0] }] }, then: "101-200" },
                                { case: { $and: [{ $gte: ["$productPrice", 200.0] }, { $lt: ["$productPrice", 300.0] }] }, then: "201-300" },
                                { case: { $and: [{ $gte: ["$productPrice", 300.0] }, { $lt: ["$productPrice", 400.0] }] }, then: "301-400" },
                                { case: { $and: [{ $gte: ["$productPrice", 400.0] }, { $lt: ["$productPrice", 500.0] }] }, then: "401-500" },
                                { case: { $and: [{ $gte: ["$productPrice", 500.0] }, { $lt: ["$productPrice", 600.0] }] }, then: "501-600" },
                                { case: { $and: [{ $gte: ["$productPrice", 600.0] }, { $lt: ["$productPrice", 700.0] }] }, then: "601-700" },
                                { case: { $and: [{ $gte: ["$productPrice", 700.0] }, { $lt: ["$productPrice", 800.0] }] }, then: "701-800" },
                                { case: { $and: [{ $gte: ["$productPrice", 800.0] }, { $lt: ["$productPrice", 900.0] }] }, then: "801-900" },
                                { case: { $gte: ["$productPrice", 900.0] }, then: "901+" }
                            ],
                            default: "Other"
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    range: "$_id",
                    count: 1
                }
            }
        ]);

        const priceRanges = [
            "0-100", "101-200", "201-300", "301-400", "401-500",
            "501-600", "601-700", "701-800", "801-900", "901+"
        ];

        const completeBarChartData = priceRanges.map(range => {
            const existingData = barChartData.find(item => item.range === range);
            return {
                range: range,
                count: existingData ? existingData.count : 0
            };
        });

        res.status(200).json(completeBarChartData);
    } catch (error) {
        console.error('Error fetching bar chart data:', error);
        res.status(500).json({ error: 'Error fetching bar chart data.' });
    }
};

// Generate statistics like total sales, sold and unsold products for the given month
const getStatistics = async (req, res) => {
    const { month } = req.query;

    if (!month) {
        return res.status(400).json({ error: 'Month parameter is required.' });
    }

    const monthIndex = new Date(`${month} 1, 2024`).getMonth();

    try {
        const statistics = await ProductTransaction.aggregate([
            {
                $match: {
                    $expr: {
                        $eq: [{ $month: "$dateOfSale" }, monthIndex + 1]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: { $cond: [{ $eq: ['$isSold', true] }, '$productPrice', 0] } },
                    totalSold: { $sum: { $cond: [{ $eq: ['$isSold', true] }, 1, 0] } },
                    totalUnsold: { $sum: { $cond: [{ $eq: ['$isSold', false] }, 1, 0] } }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalSales: 1,
                    totalSold: 1,
                    totalUnsold: 1
                }
            }
        ]);

        const result = statistics[0] || {
            totalSales: 0,
            totalSold: 0,
            totalUnsold: 0
        };

        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({ error: 'Error fetching statistics.' });
    }
};

module.exports = {
    fetchAndInitializeDatabase,
    listTransactions,
    getBarChartData,
    getStatistics
};

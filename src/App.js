import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, 
  Typography, 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  TextField, 
  Select, 
  MenuItem, 
  Button,
  Grid,
  Card,
  CardContent,
  createTheme,
  ThemeProvider
} from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import './App.css'; // Importing custom CSS

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const months = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Light Theme Setup
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057', 
    },
    background: {
      default: '#f4f6f8',
      paper: '#ffffff', 
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1.2rem',
    },
    body1: {
      fontSize: '1rem',
    },
  },
});

function TransactionDashboard() {
  const [selectedMonth, setSelectedMonth] = useState('March');
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [statistics, setStatistics] = useState({
    totalSales: 0,
    totalSold: 0,
    totalUnsold: 0
  });
  const [barChartData, setBarChartData] = useState({
    labels: [],
    datasets: []
  });

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`/api/transactions?month=${selectedMonth}&page=${page}&search=${searchTerm}`);
      setTransactions(response.data.transactions);
      setTotalPages(Math.ceil(response.data.total / 10));
    } catch (error) {
      console.error('Error fetching transactions', error);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await axios.get(`/api/statistics?month=${selectedMonth}`);
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching statistics', error);
    }
  };

  const fetchBarChartData = async () => {
    try {
      const response = await axios.get(`/api/bar-chart?month=${selectedMonth}`);
      setBarChartData({
        labels: response.data.map(item => item.range),
        datasets: [{
          label: 'Number of Items',
          data: response.data.map(item => item.count),
          backgroundColor: 'rgba(75, 192, 192, 0.6)'
        }]
      });
    } catch (error) {
      console.error('Error fetching bar chart data', error);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchStatistics();
    fetchBarChartData();
  }, [selectedMonth, page, searchTerm]);

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
    setPage(1);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="xl" className="dashboard-container">
        <Typography variant="h4" gutterBottom className="title">
          Transaction Management Dashboard
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <Select
                fullWidth
                value={selectedMonth}
                onChange={handleMonthChange}
                className="select-month"
              >
                {months.map((month) => (
                  <MenuItem key={month} value={month}>
                    {month}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Search Transactions"
                variant="outlined"
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-bar"
              />
            </Grid>
          </Grid>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Paper className="table-paper">
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Date of Sale</TableCell>
                      <TableCell>Sold</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction._id}>
                        <TableCell>{transaction.productTitle}</TableCell>
                        <TableCell>{transaction.productDescription}</TableCell>
                        <TableCell>${transaction.productPrice.toFixed(2)}</TableCell>
                        <TableCell>{new Date(transaction.dateOfSale).toLocaleDateString()}</TableCell>
                        <TableCell>{transaction.isSold ? 'Yes' : 'No'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}>
                <Button 
                  variant="contained" 
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="pagination-button"
                >
                  Previous
                </Button>
                <Button 
                  variant="contained"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="pagination-button"
                >
                  Next
                </Button>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card className="card">
              <CardContent>
                <Typography variant="h6">Statistics ({selectedMonth})</Typography>
                <Typography>Total Sales: ${statistics.totalSales.toFixed(2)}</Typography>
                <Typography>Total Sold Items: {statistics.totalSold}</Typography>
                <Typography>Total Unsold Items: {statistics.totalUnsold}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4 }} className="bar-chart-container">
          <Typography variant="h6">Price Range Distribution</Typography>
          <Bar 
            data={barChartData} 
            options={{
              responsive: true,
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }} 
          />
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default TransactionDashboard;

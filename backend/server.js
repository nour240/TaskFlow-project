require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const morgan    = require('morgan');
const connectDB = require('./config/db');

// Route imports 
const authRoutes = require('./routes/authRoutes');



// Initialize Express 
const app  = express();
const PORT = process.env.PORT || 5000;

// Global Middleware 
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Mount Routes 
app.use('/api/auth', authRoutes);


// Health check 
app.get('/api/health', (_req, res) => res.json({ status: 'ok', ts: new Date() }));

//  Global error handler 
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Start 
connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀  TaskFlow API running on port ${PORT}`));
});

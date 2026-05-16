require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const morgan    = require('morgan');
const connectDB = require('./config/db');

const authRoutes         = require('./routes/authRoutes');
const projectRoutes      = require('./routes/projectRoutes');
const taskRoutes         = require('./routes/taskRoutes');
const memberRoutes       = require('./routes/memberRoutes');
const dashboardRoutes    = require('./routes/dashboardRoutes');
const activityRoutes     = require('./routes/activityRoutes');
const notificationRoutes = require('./routes/notificationRoutes');


const app  = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

//Mount Routes 
app.use('/api/auth',          authRoutes);
app.use('/api/projects',      projectRoutes);
//ajout memberRoutes
app.use('/api/projects',      memberRoutes);   
app.use('/api/projects',      activityRoutes); 
//ajout de taskRoutes 
app.use('/api/tasks',         taskRoutes);
//ajout dashboardRoutes
app.use('/api/dashboard',     dashboardRoutes);
app.use('/api/notifications', notificationRoutes);

//Health check 
app.get('/api/health', (_req, res) => res.json({ status: 'ok', ts: new Date() }));

//Global error handler 
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

//Start 
connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀  TaskFlow API running on port ${PORT}`));
});
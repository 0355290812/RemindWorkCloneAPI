const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { protect } = require('./utils/authUtils');
const database = require('./config/db');
const authRoutes = require('./routers/authRoutes');
const apiRoutes = require('./routers/apiRoutes');
const { confirmMember } = require('./controllers/projectController');
const app = express();
const path = require('path');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again after 15 minutes'
});

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(limiter);

database.connect();

app.use('/auth', authRoutes);
app.use('/api', protect, apiRoutes);
app.get('/confirm/:token', confirmMember);

module.exports = app;

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { protect } = require('./utils/authUtils');
const database = require('./config/db');
const authRoutes = require('./routers/authRoutes');
const apiRoutes = require('./routers/apiRoutes');
const { confirmMember } = require('./controllers/projectController');
const app = express();
const path = require('path');

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

database.connect();

app.use('/auth', authRoutes);
app.use('/api', protect, apiRoutes);
app.get('/confirm/:token', confirmMember)

module.exports = app;

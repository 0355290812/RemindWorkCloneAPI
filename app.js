const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { protect } = require('./utils/authUtils');
const database = require('./config/db');
const authRoutes = require('./routers/authRoutes');
const apiRoutes = require('./routers/apiRoutes');
const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

database.connect();

app.use('/auth', authRoutes);
app.use('/api', protect, apiRoutes);
app.use((err, req, res, next) => {
    console.log(err)
    res.json({ message: `had an error: ${err.message}` })
});

module.exports = app;

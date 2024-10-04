const express = require('express');
const router = express.Router();
const taskRouter = require('./taskRoutes');
const projectRouter = require('./projectRoutes');
const userRouter = require('./userRoutes');

router.use('/projects', projectRouter);
router.use('/tasks', taskRouter);
router.use('/users', userRouter);

module.exports = router;

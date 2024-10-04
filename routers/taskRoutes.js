const express = require('express');
const router = express.Router();
const { deleteMemberFromTask, deleteTask, updateSubTask, toggleSubTaskCompletion, deleteSubTask, addSubTask, addAssigneeToTask, getTask, getTasks, createTask, updateTask, updateTaskStatus } = require('../controllers/taskController');

router.get('/', getTasks);
router.get('/:taskId', getTask);
router.post('/:taskId/assignees/:assigneeId/subtasks', addSubTask);
router.post('/:taskId/assignees', addAssigneeToTask);
router.post('/', createTask);
router.put('/:taskId', updateTask);
router.patch('/:taskId/assignees/:assigneeId/subtasks/:subTaskId/toggle', toggleSubTaskCompletion);
router.patch('/:taskId/assignees/:assigneeId/subtasks/:subTaskId', updateSubTask);
router.patch('/:taskId/status', updateTaskStatus);
router.delete('/:taskId/assignees/:assigneeId/subtasks/:subTaskId', deleteSubTask);
router.delete('/:taskId/assignees/:assigneeId', deleteMemberFromTask);
router.delete('/:taskId', deleteTask);

module.exports = router;

const express = require('express');
const router = express.Router();
const { deleteCommentFromTask, markTaskAsImportant, deleteMemberFromTask, deleteTask, updateSubTask, toggleSubTaskCompletion, deleteSubTask, addSubTask, addAssigneeToTask, getTask, getTasks, createTask, updateTask, updateTaskStatus, addCommentToTask } = require('../controllers/taskController');

router.get('/', getTasks); // Lấy tất cả các Task từ tất cả các project
router.get('/:taskId', getTask);//
router.post('/:taskId/assignees/:assigneeId/subtasks', addSubTask); //4
router.post('/:taskId/assignees', addAssigneeToTask); //3
router.post('/:taskId/comments', addCommentToTask); //
router.post('/', createTask); //1
router.put('/:taskId', updateTask); //2
router.patch('/:taskId/important', markTaskAsImportant); //
router.patch('/:taskId/assignees/:assigneeId/subtasks/:subTaskId/toggle', toggleSubTaskCompletion); //6
router.patch('/:taskId/assignees/:assigneeId/subtasks/:subTaskId', updateSubTask); //5
router.patch('/:taskId/status', updateTaskStatus); //
router.delete('/:taskId/assignees/:assigneeId/subtasks/:subTaskId', deleteSubTask); //7
router.delete('/:taskId/assignees/:assigneeId', deleteMemberFromTask); //8
router.delete('/:taskId/comments/:commentId', deleteCommentFromTask); //
router.delete('/:taskId', deleteTask);

module.exports = router;

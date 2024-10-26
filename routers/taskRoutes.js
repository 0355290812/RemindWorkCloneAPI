const express = require('express');
const router = express.Router();
const { deleteFileFromTask, uploadFilesToTask, deleteCommentFromTask, markTaskAsImportant, deleteMemberFromTask, deleteTask, updateSubTask, toggleSubTaskCompletion, deleteSubTask, addSubTask, addAssigneeToTask, getTask, getTasks, createTask, updateTask, updateTaskStatus, addCommentToTask } = require('../controllers/taskController');
const upload = require('../middlewares/multer');

router.get('/', getTasks);
router.get('/:taskId', getTask);
router.post('/:taskId/files', upload.array('files'), uploadFilesToTask);
router.post('/:taskId/assignees/:assigneeId/subtasks', addSubTask);
router.post('/:taskId/assignees', addAssigneeToTask);
router.post('/:taskId/comments', addCommentToTask);
router.post('/', createTask);
router.put('/:taskId', updateTask);
router.patch('/:taskId/important', markTaskAsImportant);
router.patch('/:taskId/assignees/:assigneeId/subtasks/:subTaskId/toggle', toggleSubTaskCompletion);
router.patch('/:taskId/assignees/:assigneeId/subtasks/:subTaskId', updateSubTask);
router.patch('/:taskId/status', updateTaskStatus);
router.delete('/:taskId/files/:fileId', deleteFileFromTask);
router.delete('/:taskId/assignees/:assigneeId/subtasks/:subTaskId', deleteSubTask);
router.delete('/:taskId/assignees/:assigneeId', deleteMemberFromTask);
router.delete('/:taskId/comments/:commentId', deleteCommentFromTask);
router.delete('/:taskId', deleteTask);

module.exports = router;

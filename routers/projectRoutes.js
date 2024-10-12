const express = require('express');
const router = express.Router();
const { createProject, getProjects, getProject, updateProject, addMembersToProject, updateMemberRoleInProject, removeMemberFromProject, deleteProject } = require('../controllers/projectController');
const { getTasksFromProject, getMyTasksFromProject } = require('../controllers/taskController');

router.get('/:projectId/tasks', getTasksFromProject); // Lấy tất cả các Task của tất cả mọi người
router.get('/:projectId/mytasks', getMyTasksFromProject);
router.get('/:projectId', getProject);
router.get('/', getProjects);
router.post('/', createProject);
router.put('/:projectId', updateProject);
router.patch('/:projectId/members', addMembersToProject);
router.patch('/:projectId/members/:userId/role', updateMemberRoleInProject);
router.delete('/:projectId/members/:userId', removeMemberFromProject);
router.delete('/:projectId', deleteProject);

module.exports = router;

const express = require('express');
const router = express.Router();
const { createProject, getProjects, getProject, updateProject, addMemberToProject, updateMemberRoleInProject, removeMemberFromProject, deleteProject } = require('../controllers/projectController');
const { getTasksFromProject } = require('../controllers/taskController');

router.get('/:projectId/tasks', getTasksFromProject);
router.get('/:projectId', getProject);
router.get('/', getProjects);
router.post('/', createProject);
router.put('/:projectId', updateProject);
router.patch('/:projectId/members', addMemberToProject);
router.patch('/:projectId/members/:userId/role', updateMemberRoleInProject);
router.delete('/:projectId/members/:userId', removeMemberFromProject);
router.delete('/:projectId', deleteProject);

module.exports = router;

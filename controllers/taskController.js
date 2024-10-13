const Task = require('../models/task');
const Project = require('../models/project');

const createTask = async (req, res) => {
    const { title, description, projectId, startDate, endDate } = req.body;

    try {
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Dự án không tồn tại' });
        }

        const task = await Task.create({
            title,
            user: req.user.id,
            description,
            project: projectId,
            status: 'pending',
            log: [{
                user: req.user.id,
                action: 'tạo công việc mới',
                timestamps: new Date()
            }],
            startDate: startDate ? new Date(startDate) : new Date(),
            endDate: endDate ? new Date(endDate) : new Date(startDate.getTime() + 1 * 24 * 60 * 60 * 1000),
            assigness: [
                {
                    user: req.user.id,
                    subTasks: []
                }
            ]
        });

        res.json(task);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Lỗi khi tạo task' });
    }
}

const updateTask = async (req, res) => {
    const { taskId } = req.params;
    const { title, description, startDate, endDate } = req.body;

    try {
        const task = await Task.findByIdAndUpdate(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task không tồn tại' });
        }

        task.title = title;
        task.description = description;
        task.startDate = startDate ? new Date(startDate) : task.startDate;
        task.endDate = endDate ? new Date(endDate) : task.endDate;
        task.log.unshift({
            user: req.user.id,
            action: 'cập nhật thông tin công việc',
            timestamps: new Date()
        });

        await task.save();

        res.json(task);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Lỗi khi cập nhật task' });
    }
};

const updateTaskStatus = async (req, res) => {
    const { taskId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    try {
        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                message: 'Task không tìm thấy'
            });
        }

        task.status = status;

        task.log.unshift({
            user: userId,
            action: `chuyển trạng thái công việc thành ${status}`,
            timestamps: new Date()
        });

        await task.save();

        res.status(200).json({
            message: 'Trạng thái của task đã được cập nhật và log đã được thêm',
            task
        });
    } catch (error) {
        res.status(500).json({
            message: 'Có lỗi xảy ra trong quá trình cập nhật trạng thái và thêm log',
            error: error.message
        });
    }
};

const getTasks = async (req, res) => {
    const userId = req.user.id;

    try {
        const tasks = await Task.find({
            $or: [
                { user: userId },
                { 'assigness.user': userId }
            ]
        })
            .populate({ path: 'project', populate: { path: 'members.user' } })
            .populate('assigness.user')
            .populate('log.user')
            .populate('user')
            .populate('comments.user')

        res.json(tasks);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Lỗi khi lấy task' });
    }
};

const getTasksFromProject = async (req, res) => {
    const { projectId } = req.params;

    try {
        const tasks = await Task.find({
            project: projectId
        })
            .populate({ path: 'project', populate: { path: 'members.user' } })
            .populate('assigness.user')
            .populate({ path: 'assigness.subTasks.toggleBy', select: 'name' })
            .populate('log.user')
            .populate('user')
            .populate('comments.user');

        res.json(tasks);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Lỗi khi lấy task' });
    }
};

const getMyTasksFromProject = async (req, res) => {
    const { projectId } = req.params;
    const userId = req.user.id;

    try {
        const tasks = await Task.find({
            project: projectId,
            $or: [
                { user: userId },
                { 'assigness.user': userId }
            ]
        })
            .populate({ path: 'project', populate: { path: 'members.user' } })
            .populate('assigness.user')
            .populate({ path: 'assigness.subTasks.toggleBy', select: 'name' })
            .populate('log.user')
            .populate('user')
            .populate('comments.user');

        res.json(tasks);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Lỗi khi lấy task' });
    }
};

const getTask = async (req, res) => {
    const { taskId } = req.params;

    try {
        const task = await Task.findById(taskId)
            .populate({ path: 'project', populate: { path: 'members.user' } })
            .populate('assigness.user')
            .populate({ path: 'assigness.subTasks.toggleBy', select: 'name' })
            .populate('log.user')
            .populate('user')
            .populate('comments.user');

        if (!task) {
            return res.status(404).json({ message: 'Task không tồn tại' });
        }

        res.json(task);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Lỗi khi lấy task' });
    }
}

const addAssigneeToTask = async (req, res) => {
    const { taskId } = req.params;
    const { userId } = req.body;

    try {
        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                message: 'Task không tìm thấy'
            });
        }

        const project = await Project.findById(task.project).populate('members.user');

        if (!project) {
            return res.status(404).json({
                message: 'Project không tìm thấy'
            });
        }

        const isMember = project.members.some(member => member.user._id.toString() === userId);

        if (!isMember) {
            return res.status(400).json({
                message: 'Người dùng này không phải là thành viên của project'
            });
        }

        const isAlreadyAssigned = task.assigness.some(assignee => assignee.user.toString() === userId);

        if (isAlreadyAssigned) {
            return res.status(400).json({
                message: 'Người dùng đã được assign cho task này'
            });
        }

        task.assigness.push({
            user: userId,
            subTasks: []
        });

        task.log.unshift({
            user: req.user.id,
            action: `thêm ${project.members.find(member => member.user._id.toString() === userId).user.name} vào công việc`,
            timestamps: new Date()
        });

        await task.save();

        res.status(200).json({
            task,
            message: 'Đã thêm người vào assigness của task'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Có lỗi xảy ra khi thêm người vào assigness',
            error: error.message
        });
    }
};

const addSubTask = async (req, res) => {
    const { taskId, assigneeId } = req.params;
    const { title, dueDate } = req.body;

    try {
        const task = await Task.findById(taskId).populate('assigness.user');

        if (!task) {
            return res.status(404).json({
                message: 'Task không tìm thấy'
            });
        }

        const assignee = task.assigness.find(assign => assign.user._id.toString() === assigneeId);

        if (!assignee) {
            return res.status(404).json({
                message: 'Người dùng không được assign cho task này'
            });
        }

        assignee.subTasks.push({
            title,
            createdAt: new Date(),
            dueDate: dueDate ? new Date(dueDate) : null,
            completed: false,
            toggleAt: new Date(),
            toggleBy: req.user.id
        });

        if (req.user.id !== assignee.user.toString()) {
            task.log.unshift({
                user: req.user.id,
                action: `thêm đầu việc ${title}`,
                timestamps: new Date()
            });
        } else {

            task.log.unshift({
                user: req.user.id,
                action: `thêm đầu việc ${title} cho ${assignee.user.name}`,
                timestamps: new Date()
            });
        }

        await task.save();

        res.status(200).json({
            task,
            message: 'Đã thêm subtask cho assignee thành công'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Có lỗi xảy ra khi thêm subtask cho assignee',
            error: error.message
        });
    }
};

const deleteSubTask = async (req, res) => {
    const { taskId, assigneeId, subTaskId } = req.params;

    try {
        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                message: 'Task không tìm thấy'
            });
        }

        const assignee = task.assigness.find(assign => assign.user.toString() === assigneeId);

        if (!assignee) {
            return res.status(404).json({
                message: 'Người dùng không được assign cho task này'
            });
        }

        const subTaskIndex = assignee.subTasks.findIndex(subTask => subTask._id.toString() === subTaskId);

        if (subTaskIndex === -1) {
            return res.status(404).json({
                message: 'Subtask không tồn tại'
            });
        }

        task.log.unshift({
            user: req.user.id,
            action: `xoá đầu việc ${assignee.subTasks[subTaskIndex].title}`,
            timestamps: new Date()
        });
        assignee.subTasks.splice(subTaskIndex, 1);

        await task.save();

        res.status(200).json({
            message: 'Subtask đã được xóa thành công',
            task
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Có lỗi xảy ra khi xóa subtask',
            error: error.message
        });
    }
};

const toggleSubTaskCompletion = async (req, res) => {
    const { taskId, assigneeId, subTaskId } = req.params;

    try {
        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task không tìm thấy'
            });
        }

        const assignee = task.assigness.find(assign => assign.user.toString() === assigneeId);

        if (!assignee) {
            return res.status(404).json({
                message: 'Người dùng không được assign cho task này'
            });
        }

        const subTask = assignee.subTasks.find(subTask => subTask._id.toString() === subTaskId);

        if (!subTask) {
            return res.status(404).json({
                message: 'Subtask không tồn tại'
            });
        }

        subTask.completed = !subTask.completed;
        subTask.toggleAt = new Date();
        subTask.toggleBy = req.user.id;

        task.log.unshift({
            user: req.user.id,
            action: `đánh dấu ${subTask.completed ? 'hoàn thành' : 'chưa hoàn thành'} đầu việc ${subTask.title}`,
            timestamps: new Date()
        });

        await task.save();

        res.status(200).json({
            message: `Subtask đã được ${subTask.completed ? 'hoàn thành' : 'chưa hoàn thành'}`,
            task
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Có lỗi xảy ra khi cập nhật trạng thái subtask',
            error: error.message
        });
    }
};

const updateSubTask = async (req, res) => {
    const { taskId, assigneeId, subTaskId } = req.params;
    const { title, dueDate } = req.body;

    try {
        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                message: 'Task không tìm thấy'
            });
        }

        const assignee = task.assigness.find(assign => assign.user.toString() === assigneeId);

        if (!assignee) {
            return res.status(404).json({
                message: 'Người dùng không được assign cho task này'
            });
        }

        const subTask = assignee.subTasks.find(subTask => subTask._id.toString() === subTaskId);

        if (!subTask) {
            return res.status(404).json({
                message: 'Subtask không tồn tại'
            });
        }

        if (title) subTask.title = title;
        if (dueDate) subTask.dueDate = new Date(dueDate);
        task.log.unshift({
            user: req.user.id,
            action: `cập nhật thông tin đầu việc ${subTask.title}`,
            timestamps: new Date()
        });

        await task.save();

        res.status(200).json({
            message: 'Subtask đã được cập nhật thành công',
            subTask
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Có lỗi xảy ra khi cập nhật subtask',
            error: error.message
        });
    }
};

const deleteTask = async (req, res) => {
    const { taskId } = req.params;

    try {
        const task = await Task.findByIdAndDelete(taskId);

        if (!task) {
            return res.status(404).json({
                message: 'Task không tìm thấy'
            });
        }

        res.status(200).json({
            message: 'Task đã được xoá thành công'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Có lỗi xảy ra khi xoá task',
            error: error.message
        });
    }
};

const deleteMemberFromTask = async (req, res) => {
    const { taskId, assigneeId } = req.params;

    try {
        const task = await Task.findById(taskId).populate('assigness.user');

        if (!task) {
            return res.status(404).json({
                message: 'Task không tìm thấy'
            });
        }

        const assigneeIndex = task.assigness.findIndex(assign => assign.user._id.toString() === assigneeId);

        if (assigneeIndex === -1) {
            return res.status(404).json({
                message: 'Người dùng không phải là thành viên của task này'
            });
        }

        task.log.unshift({
            user: req.user.id,
            action: `xoá ${task.assigness[assigneeIndex].user.name} khỏi công việc`,
            timestamps: new Date()
        });
        task.assigness.splice(assigneeIndex, 1);

        await task.save();

        res.status(200).json({
            message: 'Đã xoá thành viên khỏi task thành công',
            task
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Có lỗi xảy ra khi xoá thành viên khỏi task',
            error: error.message
        });
    }
};

const addCommentToTask = async (req, res) => {
    const { taskId } = req.params;
    const { comment } = req.body;

    try {
        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                message: 'Task không tìm thấy'
            });
        }

        task.comments.unshift({
            user: req.user.id,
            comment,
            timestamps: new Date()
        });

        await task.save();

        res.status(200).json({
            message: 'Đã thêm comment vào task',
            task
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Có lỗi xảy ra khi thêm comment vào task',
            error: error.message
        });
    }
}

const markTaskAsImportant = async (req, res) => {
    const { taskId } = req.params;

    try {
        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({ message: 'Task không tồn tại' });
        }

        task.isImportant = !task.isImportant;
        await task.save();

        res.json({ message: 'Cập nhật thành công', task });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Đã có lỗi xảy ra' });
    }
};

const deleteCommentFromTask = async (req, res) => {
    const { taskId, commentId } = req.params;

    try {
        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({ message: 'Task không tồn tại' });
        }

        const commentIndex = task.comments.findIndex(comment => comment._id.toString() === commentId);

        if (commentIndex === -1) {
            return res.status(404).json({ message: 'Comment không tồn tại' });
        }

        task.comments.splice(commentIndex, 1);
        await task.save();

        res.json({ message: 'Xoá comment thành công', task });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Đã có lỗi xảy ra' });
    }
}

module.exports = {
    createTask,
    updateTask,
    updateTaskStatus,
    getTasks,
    getTask,
    getTasksFromProject,
    addAssigneeToTask,
    addSubTask,
    deleteSubTask,
    toggleSubTaskCompletion,
    updateSubTask,
    deleteTask,
    deleteMemberFromTask,
    addCommentToTask,
    getMyTasksFromProject,
    markTaskAsImportant,
    deleteCommentFromTask
};

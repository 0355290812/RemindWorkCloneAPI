const Project = require('../models/project');

const createProject = async (req, res) => {
    const { title, description } = req.body;

    try {
        const project = await Project.create({
            title,
            description,
            members: [
                {
                    user: req.user.id,
                    role: 'admin',
                }
            ],
        });

        res.json(project);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Lỗi khi tạo dự án' });
    }
}

const getProjects = async (req, res) => {
    try {
        const projects = await Project.find({ 'members.user': req.user.id }).populate('members.user');
        res.json(projects);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Lỗi khi lấy dự án' });
    }
}

const updateProject = async (req, res) => {
    const { projectId } = req.params;
    const { title, description } = req.body;

    try {
        const updatedProject = await Project.findByIdAndUpdate(
            projectId,
            { title, description },
            { new: true }
        );

        if (!updatedProject) {
            return res.status(404).json({
                message: 'Project không tìm thấy'
            });
        }

        res.status(200).json(updatedProject);
    } catch (error) {
        res.status(500).json({
            message: 'Có lỗi xảy ra trong quá trình cập nhật project'
        });
    }
};

const addMemberToProject = async (req, res) => {
    const { projectId } = req.params;
    const { userId, role = 'employee' } = req.body;

    try {
        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                message: 'Project không tìm thấy'
            });
        }

        const userExists = project.members.some(member => member.user.toString() === userId);

        if (userExists) {
            return res.status(400).json({
                message: 'Người dùng đã là thành viên trong dự án này'
            });
        }

        const updatedProject = await Project.findByIdAndUpdate(
            projectId,
            { $addToSet: { members: { user: userId, role } } }, // Thêm thành viên mới
            { new: true }
        );

        res.status(200).json({
            project: updatedProject
        });
    } catch (error) {
        res.status(500).json({
            message: 'Có lỗi xảy ra trong quá trình thêm thành viên vào project'
        });
    }
};

const updateMemberRoleInProject = async (req, res) => {
    const { projectId, userId } = req.params;
    const { role } = req.body;

    try {
        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project không tìm thấy'
            });
        }

        const memberIndex = project.members.findIndex(member => member.user.toString() === userId);

        if (memberIndex === -1) {
            return res.status(404).json({
                message: 'Người dùng không phải là thành viên của dự án này'
            });
        }

        project.members[memberIndex].role = role;
        await project.save();

        res.status(200).json({
            project
        });
    } catch (error) {
        res.status(500).json({
            message: 'Có lỗi xảy ra trong quá trình cập nhật quyền thành viên'
        });
    }
};

const removeMemberFromProject = async (req, res) => {
    const { projectId, userId } = req.params; // Lấy projectId và userId từ params

    try {
        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                message: 'Project không tìm thấy'
            });
        }

        const memberIndex = project.members.findIndex(member => member.user.toString() === userId);

        if (memberIndex === -1) {
            return res.status(404).json({
                message: 'Người dùng không phải là thành viên của dự án này'
            });
        }

        project.members.splice(memberIndex, 1);
        await project.save();

        res.status(200).json({
            message: 'Người dùng đã được xóa khỏi dự án',
            project
        });
    } catch (error) {
        res.status(500).json({
            message: 'Có lỗi xảy ra trong quá trình xóa thành viên khỏi project'
        });
    }
};

const deleteProject = async (req, res) => {
    const { projectId } = req.params;

    try {
        const project = await Project.findByIdAndDelete(projectId);

        if (!project) {
            return res.status(404).json({
                message: 'Project không tìm thấy'
            });
        }

        res.status(200).json({
            message: 'Project đã được xóa'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Có lỗi xảy ra trong quá trình xóa project'
        });
    }
};

const getProject = async (req, res) => {
    const { projectId } = req.params;

    try {
        const project = await Project.findById(projectId).populate('members.user');

        if (!project) {
            return res.status(404).json({ message: 'Project không tìm thấy' });
        }

        res.json(project);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Lỗi khi lấy project' });
    }
}

module.exports = {
    getProjects,
    createProject,
    updateProject,
    addMemberToProject,
    updateMemberRoleInProject,
    removeMemberFromProject,
    deleteProject,
    getProject
};
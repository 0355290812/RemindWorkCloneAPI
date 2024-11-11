const Project = require('../models/project');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const nodemailer = require('nodemailer');
const Task = require('../models/task');
const { sendNotificationFS, sendNotificationToMultipleUsers } = require('../utils/firebaseUtils');

const createProject = async (req, res) => {
    const { title, description, startDate, endDate } = req.body;

    try {
        const project = await Project.create({
            title,
            description,
            members: [
                {
                    user: req.user.id,
                    role: 'admin',
                    status: 'accepted'
                }
            ],
            startDate: startDate ? new Date(startDate) : new Date(),
            endDate: endDate ? new Date(endDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        res.json(project);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Lỗi khi tạo dự án' });
    }
}

const getProjects = async (req, res) => {
    try {
        const projects = await Project.find({
            $or: [
                { 'members': { $elemMatch: { user: req.user.id, status: 'accepted' } } }
            ]
        }).populate('members.user');

        res.json(projects);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Lỗi khi lấy dự án' });
    }
}


const updateProject = async (req, res) => {
    const { projectId } = req.params;
    const { title, description, startDate, endDate } = req.body;

    try {
        const tasks = await Task.find({ project: projectId });

        for (let task of tasks) {
            if (endDate && new Date(task.endDate) > new Date(endDate)) {
                return res.status(400).json({
                    message: 'Ngày kết thúc dự án không thể nhỏ hơn ngày kết thúc công việc'
                });
            }
            if (startDate && new Date(task.startDate) > new Date(startDate)) {
                return res.status(400).json({
                    message: 'Ngày bắt đầu dự án không thể nhỏ hơn ngày bắt đầu công việc'
                });
            }
        }

        const updatedProject = await Project.findByIdAndUpdate(
            projectId,
            { title, description, startDate, endDate },
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
            message: 'Có lỗi xảy ra trong quá trình cập nhật project',
            error: error.message
        });
    }
};

const addMembersToProject = async (req, res) => {
    const { projectId } = req.params;
    const { userIds, role = 'employee' } = req.body;

    try {
        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                message: 'Project không tìm thấy'
            });
        }

        const membersToAdd = userIds.filter(userId => {
            return !project.members.some(member => member.user.toString() === userId);
        });

        if (membersToAdd.length === 0) {
            return res.status(400).json({
                message: 'Tất cả người dùng đã là thành viên trong dự án này'
            });
        }

        const updatedProject = await Project.findByIdAndUpdate(
            projectId,
            {
                $addToSet: {
                    members: membersToAdd.map(userId => ({ user: userId, role }))
                }
            },
            { new: true }
        );

        for (const userId of membersToAdd) {
            const token = jwt.sign({ userId, projectId }, process.env.JWT_SECRET, { expiresIn: '1d' });
            const confirmationLink = `${process.env.HOST}/confirm/${token}`;
            sendConfirmationEmail(userId, confirmationLink);
            const user = await User.findById(userId);

            if (user.deviceToken) {
                sendNotificationFS(
                    userName = req.user.name,
                    body = `đã mời bạn vào dự án ${project.title}`,
                    avatar = req.user.avatar,
                    to = user._id.toString(),
                    activeLink = `${process.env.CLIENT_URL}/projects/${project._id}`
                );

                sendNotificationToMultipleUsers([user.deviceToken], {
                    title: req.user.name,
                    body: `đã mời bạn vào dự án ${project.title}`,
                }, {
                    userName: req.user.name,
                    body: `đã mời bạn vào dự án ${project.title}`,
                    avatar: req.user.avatar,
                });
            }
        }

        res.status(200).json({
            project: updatedProject,
            message: `${membersToAdd.length} thành viên đã được thêm vào dự án`
        });
    } catch (error) {
        console.log(error);
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

        if (project.members[memberIndex].status != 'accepted') {
            return res.status(400).json({
                message: 'Người dùng chưa chấp nhận tham gia dự án, không thể phân quyền'
            });
        }

        project.members[memberIndex].role = role;
        await project.save();

        const user = await User.findById(userId);

        sendNotificationFS(
            userName = req.user.name,
            body = `đã cập nhật quyền của bạn trong dự án ${project.title} thành ${role === 'admin' ? 'trưởng dự án' : (role === 'teamlead' ? 'trưởng nhóm' : 'nhân viên')}`,
            avatar = req.user.avatar,
            to = user._id.toString(),
            activeLink = `${process.env.CLIENT_URL}/projects/${project._id}`
        );

        user.deviceToken && sendNotificationToMultipleUsers([user.deviceToken], {
            title: req.user.name,
            body: `đã cập nhật quyền của bạn trong dự án ${project.title} thành ${role === 'admin' ? 'trưởng dự án' : (role === 'teamlead' ? 'trưởng nhóm' : 'nhân viên')}`,
        }, {
            userName: req.user.name,
            body: `đã cập nhật quyền của bạn trong dự án ${project.title} thành ${role === 'admin' ? 'trưởng dự án' : (role === 'teamlead' ? 'trưởng nhóm' : 'nhân viên')}`,
            avatar: req.user.avatar,
        });

        res.status(200).json({
            project
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Có lỗi xảy ra trong quá trình cập nhật quyền thành viên'
        });
    }
};


const removeMemberFromProject = async (req, res) => {
    const { projectId, userId } = req.params;

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

        const countAdmins = project.members.filter(member => member.role === 'admin').length;

        if (project.members[memberIndex].role === 'admin' && countAdmins === 1) {
            return res.status(400).json({
                message: 'Không thể xoá trưởng dự án cuối cùng'
            });
        }

        const tasks = await Task.find({ project: projectId, 'assigness.user': userId });

        for (let task of tasks) {
            task.assigness = task.assigness.filter(assignee => assignee.user.toString() !== userId);
            await task.save();
        }

        project.members.splice(memberIndex, 1);
        await project.save();

        const user = await User.findById(userId);

        sendNotificationFS(
            userName = req.user.name,
            body = `đã xoá bạn khỏi dự án ${project.title}`,
            avatar = req.user.avatar,
            to = user._id.toString(),
            activeLink = `${process.env.CLIENT_URL}/home`
        );

        user.deviceToken && sendNotificationToMultipleUsers([user.deviceToken], {
            title: req.user.name,
            body: `đã xoá bạn khỏi dự án ${project.title}`,
        }, {
            userName: req.user.name,
            body: `đã xoá bạn khỏi dự án ${project.title}`,
            avatar: req.user.avatar,
        });

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

        const tasks = await Task.find({ project: projectId });

        for (let task of tasks) {
            await task.remove();
        }

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

const sendConfirmationEmail = async (userId, confirmationLink) => {
    try {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Xác nhận tham gia dự án',
            html: `
            <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; background-color: #f4f4f4;">
                <h2 style="color: #333;">Chào mừng bạn đến với dự án của chúng tôi!</h2>
                <p style="font-size: 16px;">Bạn đã được thêm vào một dự án. Vui lòng xác nhận tham gia dự án bằng cách nhấn vào liên kết bên dưới:</p>
                <a href="${confirmationLink}" style="display: inline-block; padding: 10px 20px; background-color: #1a73e8; color: #fff; text-decoration: none; border-radius: 5px;">Xác nhận Tham gia</a>
                <p style="font-size: 14px; color: #777;">Nếu bạn không muốn tham gia dự án, bạn có thể bỏ qua email này.</p>
                <p style="font-size: 12px; color: #999;">Cảm ơn! <br> Đội ngũ phát triển</p>
            </div>
        `,
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending confirmation email:', error);
    }
};

const confirmMember = async (req, res) => {
    const { token } = req.params;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { userId, projectId } = decoded;

        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: 'Không tìm thấy dự án' });

        const member = project.members.find(member => member.user.toString() === userId);
        if (!member) return res.status(404).json({ message: 'Người dùng đã được xoá khỏi dự án' });

        member.status = 'accepted';
        await project.save();

        return res.status(200).redirect(`${process.env.CLIENT_URL}/home`);
    } catch (error) {
        console.error('Error confirming member:', error);
        return res.status(400).json({ message: 'Invalid or expired token' });
    }
};


module.exports = {
    getProjects,
    createProject,
    updateProject,
    addMembersToProject,
    updateMemberRoleInProject,
    removeMemberFromProject,
    deleteProject,
    getProject,
    confirmMember
};
const User = require('../models/user');
const Task = require('../models/task');
const Project = require('../models/project');
const { comparePasswords, createJWT, hashPassword } = require('../utils/authUtils');
const crypto = require('crypto');

const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        res.status(401);
        res.json({ message: 'Tài khoản không tồn tại' });
        return;
    }

    const valid = await comparePasswords(password, user.passwordHash);

    if (!valid) {
        res.status(401);
        res.json({ message: 'Sai mật khẩu' });
        return;
    }

    const token = createJWT(user);

    res.json({ token });
}

const register = async (req, res) => {
    const { email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Nguời dùng đã tồn tại' });
        }

        const trimmedEmail = email.trim().toLowerCase();
        const hash = crypto.createHash('sha256').update(trimmedEmail).digest('hex');
        const avatar = `https://www.gravatar.com/avatar/${hash}?d=identicon`;

        const user = await User.create({
            email,
            passwordHash: await hashPassword(password),
            name: email.split('@')[0],
            avatar: avatar
        });

        const project = await Project.create({
            title: 'Dự án mẫu',
            description: 'Đây là dự án mẫu để làm quen với ứng dụng',
            members: [{ user: user._id, role: 'admin', status: 'accepted' }],
            startDate: new Date(),
            endDate: new Date(new Date().setDate(new Date().getDate() + 7))
        });

        const task = await Task.create({
            title: 'Công việc mẫu',
            user: user._id,
            description: 'Đây là công việc mẫu để làm quen với ứng dụng',
            startDate: new Date(),
            endDate: new Date(new Date().setDate(new Date().getDate() + 6)),
            assigness: [{
                user: user._id, subTasks: [
                    { title: 'Công việc phụ mẫu', createdAt: new Date(), completed: false, toggleAt: new Date(), toggleBy: user._id, dueDate: null }
                ]
            }],
            comments: [],
            logs: [{
                user: user._id,
                action: 'tạo công việc',
                timestamps: new Date()
            }],
            project: project._id,
            status: 'pending'
        });

        const token = createJWT(user);

        res.json({ token });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Lỗi khi tạo người dùng' });
    }
}

module.exports = {
    login,
    register
};
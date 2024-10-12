const User = require('../models/user');
const { comparePasswords, hashPassword } = require('../utils/authUtils');

const changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const { email } = req.user;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            res.status(401);
            res.json({ message: 'Tài khoản không tồn tại' });
            return;
        }

        const valid = await comparePasswords(oldPassword, user.passwordHash);

        if (!valid) {
            res.status(401);
            res.json({ message: 'Sai mật khẩu' });
            return;
        }

        user.passwordHash = await hashPassword(newPassword);
        await user.save();

        res.json({ message: 'Đổi mật khẩu thành công' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Đã có lỗi xảy ra' });
    }
}

const getUsers = async (req, res) => {
    const { email } = req.query;

    try {
        if (email) {
            const users = await User
                .find({ email: { $regex: email, $options: 'i' } })
                .select('-passwordHash')
                .limit(10);

            res.json(users);
        } else {
            const users = await User.find().select('-passwordHash');
            res.json(users);
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Đã có lỗi xảy ra' });
    }
}

const getInformation = async (req, res) => {
    const { id } = req.user;

    try {
        const user = await User.findById(id).select('-passwordHash');
        res.json(user);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Đã có lỗi xảy ra' });
    }
}

const changeInformation = async (req, res) => {
    const { name } = req.body;
    const { id } = req.user;

    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }

        if (name) user.name = name;

        if (req.file) {
            user.avatar = req.file.path;
        }

        await user.save();
        res.json({ message: 'Cập nhật thông tin thành công', user });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Đã có lỗi xảy ra' });
    }
}


module.exports = {
    changePassword,
    getUsers,
    getInformation,
    changeInformation
};
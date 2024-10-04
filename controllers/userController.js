const User = require('../models/user');
const { comparePasswords, hashPassword } = require('../utils/authUtils');

const changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const { email } = req.user;
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
}

module.exports = {
    changePassword
};
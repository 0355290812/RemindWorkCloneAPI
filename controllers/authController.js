const User = require('../models/user');
const { comparePasswords, createJWT, hashPassword } = require('../utils/authUtils');

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

        const user = await User.create({
            email,
            passwordHash: await hashPassword(password),
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
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const comparePasswords = (password, hash) => {
    return bcrypt.compare(password, hash)
}

const hashPassword = (password) => {
    return bcrypt.hash(password, 5)
}

const createJWT = (user) => {
    const name = user.email.split('@')[0];
    const token = jwt.sign({
        id: user.id,
        email: user.email,
        name: name
    },
        process.env.JWT_SECRET
    )
    return token
}

const protect = (req, res, next) => {
    const bearer = req.headers.authorization

    if (!bearer) {
        res.status(401)
        res.json({ message: 'Not Authorized' })
        return
    }

    const [, token] = bearer.split(' ')

    if (!token) {
        res.status(401)
        res.json({ message: 'Not Valid Token' })
        return
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET)
        req.user = user
        next()
    } catch (e) {
        console.error(e)
        res.status(401)
        res.json({ message: 'Not Valid Token' })
        return
    }
}

module.exports = {
    comparePasswords,
    hashPassword,
    createJWT,
    protect
};
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'secret123';

function authenticate(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ message: 'No token provided' });
    const token = auth.split(' ')[1];
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
}

function authorize(roles = []) {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
        if (typeof roles === 'string') roles = [roles];
        if (roles.length && !roles.includes(req.user.role))
            return res.status(403).json({ message: 'Forbidden' });
        next();
    };
}

module.exports = { authenticate, authorize };

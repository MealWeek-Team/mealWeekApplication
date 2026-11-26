const jwt = require('jsonwebtoken');
const User = require('../models/User');

function requireAuth(req, res, next) {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({
            message: 'Authorization token required'
        });
    }

    try {
        const payload = jwt.verify(
            header.slice(7),
            process.env.JWT_SECRET
        );

        req.userId = payload.userId;
        next();
    } catch {
        return res.status(401).json({
            message: 'Invalid or expired token'
        });
    }
}

async function requireAdmin(req, res, next) {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(401).json({
                message: 'User not found'
            });
        }

        if (user.role !== 'admin') {
            return res.status(403).json({
                message: 'Admin access required'
            });
        }

        next();
    } catch (error) {
        console.error('Admin authorization error:', error);

        return res.status(500).json({
            message: 'Authorization check failed'
        });
    }
}

module.exports = {
    requireAuth,
    requireAdmin
};


const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function signToken(user) {
    return jwt.sign(
        { userId: user._id.toString(), role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
}

router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name?.trim() || !email?.trim() || !password || password.length < 6) {
            return res.status(400).json({ message: 'Name, email and password (min 6 chars) are required' });
        }

        const existing = await User.findOne({ email: email.toLowerCase().trim() });
        if (existing) {
            return res.status(409).json({ message: 'User with this email already exists' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            passwordHash,
            authProvider: 'local',
        });

        res.status(201).json({ token: signToken(user), user: user.toPublicJSON() });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user || !user.passwordHash) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        res.json({ token: signToken(user), user: user.toPublicJSON() });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/google', async (req, res) => {
    try {
        const { credential } = req.body;
        if (!credential) {
            return res.status(400).json({ message: 'Google credential is required' });
        }

        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload?.email) {
            return res.status(400).json({ message: 'Google account has no email' });
        }

        let user = await User.findOne({ email: payload.email.toLowerCase() });
        if (!user) {
            user = await User.create({
                name: payload.name || payload.email.split('@')[0],
                email: payload.email.toLowerCase(),
                googleId: payload.sub,
                avatarUrl: payload.picture,
                authProvider: 'google',
            });
        } else if (!user.googleId) {
            user.googleId = payload.sub;
            user.avatarUrl = user.avatarUrl || payload.picture;
            await user.save();
        }

        res.json({ token: signToken(user), user: user.toPublicJSON() });
    } catch {
        console.error('Google auth error:', err);
        res.status(401).json({ message: err.message || 'Google authentication failed' })
    }
});

router.get('/me', requireAuth, async (req, res) => {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user: user.toPublicJSON() });
});

module.exports = router;

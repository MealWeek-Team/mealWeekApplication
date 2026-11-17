
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        passwordHash: { type: String },
        googleId: { type: String, unique: true, sparse: true },
        authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
        role: { type: String, enum: ['user', 'admin'], default: 'user' }
    },
    { timestamps: true }
);

userSchema.methods.toPublicJSON = function () {
    return {
        id: this._id.toString(),
        name: this.name,
        email: this.email,
        role: this.role,
    };
};

module.exports = mongoose.model('User', userSchema);
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    full_name: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        default: null
    },
    role: {
        type: String,
        enum: ['customer', 'admin'],
        default: 'customer'
    },
    avatar_url: {
        type: String,
        default: null
    },
    address: {
        type: String,
        default: null
    },
    // Password reset fields
    reset_code: {
        type: String,
        default: null
    },
    reset_code_expires: {
        type: Date,
        default: null
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.reset_code;
    delete obj.reset_code_expires;
    return obj;
};

module.exports = mongoose.model('User', userSchema);

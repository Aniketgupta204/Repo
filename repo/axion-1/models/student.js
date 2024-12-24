// models/Student.js
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    studentId: {
        type: String,
        required: [true, 'Student ID is required'],
        unique: true,
        trim: true
    },
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true
    },
    dateOfBirth: {
        type: Date,
        required: [true, 'Date of birth is required']
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        required: [true, 'Gender is required']
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    classroom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classroom'
    },
    enrollmentHistory: [{
        school: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'School'
        },
        enrollmentDate: Date,
        exitDate: Date,
        status: String,
        reason: String
    }],
    status: {
        type: String,
        enum: ['active', 'inactive', 'transferred', 'graduated'],
        default: 'active'
    },
    contactInfo: {
        guardianName: {
            type: String,
            required: [true, 'Guardian name is required']
        },
        relationship: {
            type: String,
            required: [true, 'Guardian relationship is required']
        },
        email: String,
        phone: {
            type: String,
            required: [true, 'Guardian phone number is required']
        },
        address: {
            street: String,
            city: String,
            state: String,
            zipCode: String
        }
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);

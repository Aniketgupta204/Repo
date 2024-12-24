// controllers/schoolController.js
const School = require('../models/School');

class SchoolController {
    // Create new school (Superadmin only)
    async createSchool(req, res) {
        try {
            const school = new School({
                ...req.body,
                createdBy: req.user._id
            });
            await school.save();
            res.status(201).json({
                success: true,
                data: school
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    // Get all schools (Superadmin only)
    async getAllSchools(req, res) {
        try {
            const schools = await School.find()
                .populate('administrators', 'name email')
                .sort('-createdAt');
            
            res.status(200).json({
                success: true,
                count: schools.length,
                data: schools
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Get single school
    async getSchool(req, res) {
        try {
            const school = await School.findById(req.params.id)
                .populate('administrators', 'name email');

            if (!school) {
                return res.status(404).json({
                    success: false,
                    error: 'School not found'
                });
            }

            res.status(200).json({
                success: true,
                data: school
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Update school
    async updateSchool(req, res) {
        try {
            const school = await School.findByIdAndUpdate(
                req.params.id,
                req.body,
                {
                    new: true,
                    runValidators: true
                }
            );

            if (!school) {
                return res.status(404).json({
                    success: false,
                    error: 'School not found'
                });
            }

            res.status(200).json({
                success: true,
                data: school
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    // Delete school (Superadmin only)
    async deleteSchool(req, res) {
        try {
            const school = await School.findById(req.params.id);

            if (!school) {
                return res.status(404).json({
                    success: false,
                    error: 'School not found'
                });
            }

            await school.remove();

            res.status(200).json({
                success: true,
                data: {}
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = new SchoolController();

// controllers/classroomController.js
const Classroom = require('../models/Classroom');

class ClassroomController {
    // Create classroom
    async createClassroom(req, res) {
        try {
            const classroom = new Classroom({
                ...req.body,
                school: req.user.schoolId // From auth middleware
            });
            await classroom.save();
            res.status(201).json({ success: true, data: classroom });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    // Get classrooms by school
    async getSchoolClassrooms(req, res) {
        try {
            const classrooms = await Classroom.find({ school: req.params.schoolId });
            res.status(200).json({ success: true, data: classrooms });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // Update classroom
    async updateClassroom(req, res) {
        try {
            const classroom = await Classroom.findOneAndUpdate(
                { _id: req.params.id, school: req.user.schoolId },
                req.body,
                { new: true, runValidators: true }
            );
            if (!classroom) {
                return res.status(404).json({ success: false, error: 'Classroom not found' });
            }
            res.status(200).json({ success: true, data: classroom });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    // Manage classroom resources
    async updateResources(req, res) {
        try {
            const classroom = await Classroom.findOne({
                _id: req.params.id,
                school: req.user.schoolId
            });
            if (!classroom) {
                return res.status(404).json({ success: false, error: 'Classroom not found' });
            }
            classroom.resources = req.body.resources;
            await classroom.save();
            res.status(200).json({ success: true, data: classroom });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
}

module.exports = new ClassroomController();

// controllers/studentController.js
const Student = require('../models/Student');

class StudentController {
    // Enroll new student
    async enrollStudent(req, res) {
        try {
            const student = new Student({
                ...req.body,
                school: req.user.schoolId,
                enrollmentHistory: [{
                    school: req.user.schoolId,
                    enrollmentDate: new Date(),
                    status: 'active'
                }]
            });
            await student.save();
            res.status(201).json({ success: true, data: student });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    // Transfer student
    async transferStudent(req, res) {
        try {
            const student = await Student.findById(req.params.id);
            if (!student) {
                return res.status(404).json({ success: false, error: 'Student not found' });
            }

            // Update current enrollment history
            const currentEnrollment = student.enrollmentHistory[student.enrollmentHistory.length - 1];
            currentEnrollment.exitDate = new Date();
            currentEnrollment.status = 'transferred';

            // Add new enrollment
            student.enrollmentHistory.push({
                school: req.body.newSchool,
                enrollmentDate: new Date(),
                status: 'active'
            });

            student.school = req.body.newSchool;
            student.classroom = null;
            await student.save();

            res.status(200).json({ success: true, data: student });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    // Update student profile
    async updateStudent(req, res) {
        try {
            const student = await Student.findOneAndUpdate(
                { _id: req.params.id, school: req.user.schoolId },
                req.body,
                { new: true, runValidators: true }
            );
            if (!student) {
                return res.status(404).json({ success: false, error: 'Student not found' });
            }
            res.status(200).json({ success: true, data: student });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    // Get student profile
    async getStudent(req, res) {
        try {
            const student = await Student.findOne({
                _id: req.params.id,
                school: req.user.schoolId
            }).populate('school classroom');
            
            if (!student) {
                return res.status(404).json({ success: false, error: 'Student not found' });
            }
            res.status(200).json({ success: true, data: student });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

module.exports = new StudentController();

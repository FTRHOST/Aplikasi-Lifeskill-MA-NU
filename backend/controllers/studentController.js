const db = require('../config/db');
const { v4: uuidv4 } = require('uuid'); // To be compatible with frontend's crypto.randomUUID

// @desc    Get all students
// @route   GET /api/students
// @access  Private
const getStudents = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM students ORDER BY fullName ASC');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add a new student
// @route   POST /api/students
// @access  Private
const addStudent = async (req, res) => {
    const { fullName, classLevel, whatsappNumber, lifeSkill, jenisKelamin } = req.body;
    
    if (!fullName || !classLevel || !whatsappNumber || !lifeSkill || !jenisKelamin) {
        return res.status(400).json({ message: 'Please fill all fields' });
    }

    const id = uuidv4();

    try {
        const query = 'INSERT INTO students (id, fullName, classLevel, whatsappNumber, lifeSkill, jenisKelamin) VALUES (?, ?, ?, ?, ?, ?)';
        await db.execute(query, [id, fullName, classLevel, whatsappNumber, lifeSkill, jenisKelamin]);
        
        const [newStudent] = await db.query('SELECT * FROM students WHERE id = ?', [id]);
        res.status(201).json(newStudent[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update a student
// @route   PUT /api/students/:id
// @access  Private
const updateStudent = async (req, res) => {
    const { id } = req.params;
    const { fullName, classLevel, whatsappNumber, lifeSkill, jenisKelamin } = req.body;
    
    if (!fullName || !classLevel || !whatsappNumber || !lifeSkill || !jenisKelamin) {
        return res.status(400).json({ message: 'Please fill all fields' });
    }

    try {
        const query = 'UPDATE students SET fullName = ?, classLevel = ?, whatsappNumber = ?, lifeSkill = ?, jenisKelamin = ? WHERE id = ?';
        const [result] = await db.execute(query, [fullName, classLevel, whatsappNumber, lifeSkill, jenisKelamin, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }
        
        const [updatedStudent] = await db.query('SELECT * FROM students WHERE id = ?', [id]);
        res.json(updatedStudent[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a student
// @route   DELETE /api/students/:id
// @access  Private
const deleteStudent = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.execute('DELETE FROM students WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json({ message: 'Student removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getStudents,
    addStudent,
    updateStudent,
    deleteStudent,
};

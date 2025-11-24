const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { verifyLogin, updateUserProfile } = require('../CRUD/crud_login');
const { getAllCoursesList, getCourseById, enrollUserInCourse } = require('../CRUD/crud_course');
const { getChaptersByCourse, getMaterialsByChapter, getLibraryMaterials, getScheduleByCourse, addMaterial, deleteMaterial, addChapter } = require('../CRUD/crud_course_content');
const pool = require('./database');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/materials'));
    },
    filename: (req, file, cb) => {
        // Generate unique filename: timestamp_originalname
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['application/pdf', 'video/mp4', 'video/avi', 'video/quicktime', 'video/x-matroska'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF and video files are allowed.'));
        }
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }
        
        const user = await verifyLogin(email, password);
        
        if (user) {
            res.json({ success: true, user });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update user profile
router.put('/profile/:userID', async (req, res) => {
    try {
        const { name, current_role, email, more_detail } = req.body;
        const { userID } = req.params;
        
        if (!name || !current_role || !email) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        
        const result = await updateUserProfile(userID, name, current_role, email, more_detail || '');
        res.json({ success: true, message: 'User profile updated', result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get first 3 courses for home page
router.get('/courses/home', async (req, res) => {
    try {
        const courses = await getAllCoursesList();
        
        if (courses) {
            const firstThree = courses.slice(0, 3);
            res.json({ success: true, courses: firstThree });
        } else {
            res.status(404).json({ success: false, message: 'No courses found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all courses for home page
router.get('/all_courses', async (req, res) => {
    try {
        const courses = await getAllCoursesList();
        
        if (courses) {
            res.json({ success: true, courses: courses });
        } else {
            res.status(404).json({ success: false, message: 'No courses found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get course by ID
router.get('/courses/:courseId', async (req, res) => {
    try {
        const { courseId } = req.params;
        const course = await getCourseById(courseId);
        
        if (course) {
            res.json({ success: true, course: course });
        } else {
            res.status(404).json({ success: false, message: 'Course not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Check if user is enrolled in a course
router.get('/enrollment/:courseId/:userId', async (req, res) => {
    try {
        const { courseId, userId } = req.params;
        const connection = await pool.getConnection();
        
        const [rows] = await connection.execute(`
            SELECT COUNT(*) as count FROM tutor_course_enrollment 
            WHERE tutor_courseID = ? AND userID = ?
        `, [courseId, userId]);
        
        connection.release();
        
        const enrolled = rows[0].count > 0;
        res.json({ success: true, enrolled: enrolled });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Enroll user in course
router.get('/enrol', async (req, res) => {
    try{
        const {courseId, userID} = req.body;
        if(!courseId || !userID) return res.json({success: false, message:'CourseID and UserID are required'})
        const enroll = await enrollUserInCourse();
        if(enroll){
            res.json({success: true, enrolled: enroll});
        }else{
            res.status(404).json({success: false, message: 'Enrollment failed' });
        }


    }catch (error){
        res.status(500).json({ success: false, error: error.message });
    }
});
// Get course chapters/sections
router.get('/course/:courseId/chapters', async (req, res) => {
    try {
        const { courseId } = req.params;
        const chapters = await getChaptersByCourse(courseId);
        res.json({ success: true, chapters: chapters });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create a new chapter/section
router.post('/course/:courseId/chapter', async (req, res) => {
    try {
        const { courseId } = req.params;
        const { chapterNum, chapterName } = req.body;

        if (!chapterNum || !chapterName) {
            return res.status(400).json({ success: false, message: 'chapterNum and chapterName are required' });
        }

        const created = await addSection(courseId, chapterNum, chapterName);
        if (created) {
            res.json({ success: true, message: 'Chapter created successfully' });
        } else {
            res.status(500).json({ success: false, message: 'Failed to create chapter' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get materials for a specific chapter
router.get('/course/:courseId/chapter/:chapterNum/materials', async (req, res) => {
    try {
        const { courseId, chapterNum } = req.params;
        const materials = await getMaterialsByChapter(courseId, chapterNum);
        res.json({ success: true, materials: materials });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Upload/add material for a chapter (supports both file upload and URL)
router.post('/course/:courseId/chapter/:chapterNum/upload-material', upload.single('file'), async (req, res) => {
    try {
        const { courseId, chapterNum } = req.params;
        const { material_title, type } = req.body;
        let material_link = req.body.material_link || '';

        if (!material_title) {
            return res.status(400).json({ success: false, message: 'material_title is required' });
        }

        // If file is uploaded, use the file path; otherwise use the URL
        if (req.file) {
            material_link = `/materials/${req.file.filename}`;
        } else if (!material_link) {
            return res.status(400).json({ success: false, message: 'Either file or URL is required' });
        }

        const added = await addMaterial(courseId, chapterNum, material_title, material_link, type || 'PDF');
        if (added) {
            res.json({ success: true, message: 'Material added', material_link: material_link });
        } else {
            res.status(500).json({ success: false, message: 'Failed to add material' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete material from chapter
router.delete('/course/:courseId/chapter/:chapterNum/delete-material', async (req, res) => {
    try {
        const { courseId, chapterNum } = req.params;
        const { material_link } = req.body;

        if (!material_link) {
            return res.status(400).json({ success: false, message: 'material_link is required' });
        }

        const deleted = await deleteMaterial(courseId, chapterNum, material_link);
        if (deleted) {
            res.json({ success: true, message: 'Material deleted' });
        } else {
            res.status(404).json({ success: false, message: 'Material not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get library materials
router.get('/library-materials', async (req, res) => {
    try {
        const materials = await getLibraryMaterials();
        res.json({ success: true, materials: materials });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get course schedule
router.get('/course/:courseId/schedule', async (req, res) => {
    try {
        const { courseId } = req.params;
        const schedule = await getScheduleByCourse(courseId);
        res.json({ success: true, schedule: schedule });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Send enrollment request (for Permission courses)
router.post('/enroll-request', async (req, res) => {
    try {
        const { courseId, userId } = req.body;
        
        if (!courseId || !userId) {
            return res.status(400).json({ success: false, message: 'courseId and userId are required' });
        }
        
        const connection = await pool.getConnection();
        
        // Add to waiting_queue with 'Waiting' status
        await connection.execute(`
            INSERT INTO waiting_queue (tutor_courseID, userID, status) 
            VALUES (?, ?, 'Waiting')
            ON DUPLICATE KEY UPDATE status = 'Waiting'
        `, [courseId, userId]);
        
        connection.release();
        
        res.json({ success: true, message: 'Enrollment request sent' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/rate-course', async (req, res) => {
    try {
        const { userID, courseID, rating, review } = req.body;
        if (!userID || !courseID || rating == null) {
            return res.status(400).json({ success: false, message: 'userID, courseID, and rating are required' });
        }
        const success = await RateCourse(userID, courseID, rating, review);
        if (success) {
            res.json({ success: true, message: 'Course rated successfully' });
        } else {
            res.status(500).json({ success: false, message: 'Failed to rate course' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
module.exports = router;
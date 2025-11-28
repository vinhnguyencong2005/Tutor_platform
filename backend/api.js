const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { verifyLogin, updateUserProfile } = require('../CRUD/crud_login');
const { getAllCoursesList, getCourseById, enrollUserInCourse, createCourse, getManagedCourses } = require('../CRUD/crud_course');
const { getChaptersByCourse, getMaterialsByChapter, getLibraryMaterials, getScheduleByCourse, addMaterial, deleteMaterial, addSection, deleteSection, addSchedule } = require('../CRUD/crud_course_content');
const { getForumThreads, getForumThreadDetail, createForumThread, addForumAnswer, deleteForumThread, deleteForumAnswer, createFollowUpQuestion, getFollowUpQuestions } = require('../CRUD/crud_forum');
const { getCourseRatings, getAverageRating, getUserRating, addOrUpdateRating, deleteRating } = require('../CRUD/crud_rating');
const { 
    getDashboardOverview, 
    getEnrolledCoursesWithActivity, 
    getRecentSchedule, 
    getWaitingQueueRequests,
    getRecentForumActivity,
    getUserUniversityCourses,
    getCourseProgress,
    getChapterMaterials,
    getCourseChapters
} = require('../CRUD/crud_dashboard');
const { getUnreadNotifications, getAllNotifications, markNotificationAsRead, markAllNotificationsAsRead, getUnreadNotificationCount, deleteNotification, notifyEnrolledUsers } = require('../CRUD/crud_notification');
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
router.post('/login', async (req, res) => { // request and response
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

// Delete a chapter/section
router.delete('/course/:courseId/chapter/:chapterNum', async (req, res) => {
    try {
        const { courseId, chapterNum } = req.params;

        if (!courseId || !chapterNum) {
            return res.status(400).json({ success: false, message: 'courseId and chapterNum are required' });
        }

        const deleted = await deleteSection(courseId, chapterNum);
        if (deleted) {
            res.json({ success: true, message: 'Chapter deleted successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Chapter not found' });
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
            try {
                // Get course name for notification
                const connection = await pool.getConnection();
                const [courseData] = await connection.execute(`
                    SELECT course_title FROM tutor_course WHERE tutor_courseID = ?
                `, [courseId]);
                connection.release();
                
                const courseName = courseData[0]?.course_title || 'Unknown Course';
                
                // Send notification to all course members with course name
                const message = `📄 New material added to "${courseName}": "${material_title}"`;
                await notifyEnrolledUsers(courseId, 'material', message, null, null);
            } catch (notifyError) {
                console.error('Error sending notification:', notifyError);
            }
            
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
        
        console.log('📝 Enrollment request received:', { courseId, userId });
        
        if (!courseId || !userId) {
            return res.status(400).json({ success: false, message: 'courseId and userId are required' });
        }
        
        const connection = await pool.getConnection();
        
        // Add to waiting_queue with 'Waiting' status
        const [result] = await connection.execute(`
            INSERT INTO waiting_queue (tutor_courseID, userID, status) 
            VALUES (?, ?, 'Waiting')
            ON DUPLICATE KEY UPDATE status = 'Waiting'
        `, [courseId, userId]);
        
        connection.release();
        
        console.log('✅ Enrollment request saved:', { courseId, userId, affectedRows: result.affectedRows });
        res.json({ success: true, message: 'Enrollment request sent' });
    } catch (error) {
        console.error('❌ Error processing enrollment request:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/enroll
 * Direct enroll student in Open access course
 */
router.post('/enroll', async (req, res) => {
    try {
        const { courseId, userId } = req.body;
        
        console.log('📝 Direct enrollment received:', { courseId, userId });
        
        if (!courseId || !userId) {
            return res.status(400).json({ success: false, message: 'courseId and userId are required' });
        }
        
        const connection = await pool.getConnection();
        
        // Add directly to tutor_course_enrollment
        const [result] = await connection.execute(`
            INSERT INTO tutor_course_enrollment (tutor_courseID, userID)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE tutor_courseID = tutor_courseID
        `, [courseId, userId]);
        
        connection.release();
        
        console.log('✅ Student directly enrolled:', { courseId, userId, affectedRows: result.affectedRows });
        res.json({ success: true, message: 'Successfully enrolled' });
    } catch (error) {
        console.error('❌ Error processing enrollment:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/enrollment-status/:courseId/:userId
 * Check if student has already requested enrollment or is enrolled
 */
router.get('/enrollment-status/:courseId/:userId', async (req, res) => {
    try {
        const { courseId, userId } = req.params;
        
        const connection = await pool.getConnection();
        
        // Check if already enrolled
        const [enrolled] = await connection.execute(`
            SELECT COUNT(*) as count FROM tutor_course_enrollment
            WHERE tutor_courseID = ? AND userID = ?
        `, [courseId, userId]);
        
        if (enrolled[0].count > 0) {
            connection.release();
            return res.json({ success: true, status: 'enrolled', message: 'Already enrolled' });
        }
        
        // Check if already requested
        const [requested] = await connection.execute(`
            SELECT status FROM waiting_queue
            WHERE tutor_courseID = ? AND userID = ?
        `, [courseId, userId]);
        
        connection.release();
        
        if (requested.length > 0) {
            console.log('📋 Student already requested:', { courseId, userId, status: requested[0].status });
            return res.json({ 
                success: true, 
                status: 'requested',
                enrollmentStatus: requested[0].status,
                message: `Request status: ${requested[0].status}` 
            });
        }
        
        console.log('✅ No previous enrollment or request found');
        res.json({ success: true, status: 'none', message: 'Can enroll' });
    } catch (error) {
        console.error('❌ Error checking enrollment status:', error);
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

router.get('/dashboard/:userID', async (req, res) => {
    try {
        const { userID } = req.params;
        
        const overview = await getDashboardOverview(userID);
        res.json(overview);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============ DASHBOARD ENDPOINTS ============

/**
 * GET /api/dashboard/:userID
 * Get complete dashboard overview for user
 */
router.get('/dashboard/:userID', async (req, res) => {
    try {
        const { userID } = req.params;
        
        const overview = await getDashboardOverview(userID);
        res.json(overview);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/dashboard/:userID/enrolled-courses
 * Get all courses enrolled by user with activity info
 */
router.get('/dashboard/:userID/enrolled-courses', async (req, res) => {
    try {
        const { userID } = req.params;
        
        const courses = await getEnrolledCoursesWithActivity(userID);
        res.json({ success: true, courses });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/dashboard/:userID/schedule
 * Get upcoming schedule/events for enrolled courses
 */
router.get('/dashboard/:userID/schedule', async (req, res) => {
    try {
        const { userID } = req.params;
        const limit = req.query.limit || 10;
        
        const schedule = await getRecentSchedule(userID, limit);
        res.json({ success: true, schedule });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/dashboard/:userID/waiting-queue
 * Get user's course enrollment requests waiting for approval
 */
router.get('/dashboard/:userID/waiting-queue', async (req, res) => {
    try {
        const { userID } = req.params;
        
        const requests = await getWaitingQueueRequests(userID);
        res.json({ success: true, requests });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/dashboard/:userID/forum-activity
 * Get recent forum activity from enrolled courses
 */
router.get('/dashboard/:userID/forum-activity', async (req, res) => {
    try {
        const { userID } = req.params;
        const limit = req.query.limit || 5;
        
        const activity = await getRecentForumActivity(userID, limit);
        res.json({ success: true, activity });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/dashboard/:userID/university-courses
 * Get user's university courses and GPA performance
 */
router.get('/dashboard/:userID/university-courses', async (req, res) => {
    try {
        const { userID } = req.params;
        
        const courses = await getUserUniversityCourses(userID);
        res.json({ success: true, courses });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/dashboard/:userID/course/:courseID/progress
 * Get learning progress for a specific course
 */
router.get('/dashboard/:userID/course/:courseID/progress', async (req, res) => {
    try {
        const { userID, courseID } = req.params;
        
        const progress = await getCourseProgress(userID, courseID);
        res.json({ success: true, ...progress });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/dashboard/course/:courseID/chapters
 * Get all chapters for a course
 */
router.get('/dashboard/course/:courseID/chapters', async (req, res) => {
    try {
        const { courseID } = req.params;
        
        const chapters = await getCourseChapters(courseID);
        res.json({ success: true, chapters });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/dashboard/course/:courseID/chapter/:chapterNum/materials
 * Get materials for a specific chapter
 */
router.get('/dashboard/course/:courseID/chapter/:chapterNum/materials', async (req, res) => {
    try {
        const { courseID, chapterNum } = req.params;
        
        const materials = await getChapterMaterials(courseID, chapterNum);
        res.json({ success: true, materials });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// ==================== Schedule Management ====================
/**
 * POST /api/schedule/create
 * Create a new schedule for a course
 */
router.post('/schedule/create', async (req, res) => {
    try {
        const { tutor_courseID, schedule_title, schedule_content, start_date, start_time, end_date, end_time, location } = req.body;
        
        // Validation: Check required fields
        if (!tutor_courseID || !schedule_title || !schedule_content || !start_date || !start_time || !end_date || !end_time || !location) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }
        
        // Validation: Check if start_date + start_time is before end_date + end_time
        // Parse dates and times properly
        const [startYear, startMonth, startDay] = start_date.split('-').map(Number);
        const [startHour, startMin] = start_time.split(':').map(Number);
        const startDateTime = new Date(startYear, startMonth - 1, startDay, startHour, startMin, 0);
        
        const [endYear, endMonth, endDay] = end_date.split('-').map(Number);
        const [endHour, endMin] = end_time.split(':').map(Number);
        const endDateTime = new Date(endYear, endMonth - 1, endDay, endHour, endMin, 0);
        
        if (startDateTime >= endDateTime) {
            return res.status(400).json({ success: false, message: 'Start date must be before end date' });
        }
        
        const result = await addSchedule(tutor_courseID, schedule_title, schedule_content, start_date, start_time, end_date, end_time, location);
        
        if (result.success && result.affectedRows > 0) {
            try {
                // Get course name for notification
                const connection = await pool.getConnection();
                const [courseData] = await connection.execute(`
                    SELECT course_title FROM tutor_course WHERE tutor_courseID = ?
                `, [tutor_courseID]);
                connection.release();
                
                const courseName = courseData[0]?.course_title || 'Unknown Course';
                
                // Send notification to all course members with course name
                const message = `📅 New schedule in "${courseName}": "${schedule_title}" on ${start_date}`;
                await notifyEnrolledUsers(tutor_courseID, 'schedule', message, null, null);
            } catch (notifyError) {
                console.error('Error sending notification:', notifyError);
            }
            
            res.json({ success: true, message: 'Schedule created successfully' });
        } else {
            res.status(500).json({ success: false, message: 'Failed to create schedule' });
        }
    } catch (error) {
        console.error('Error creating schedule:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/schedule/:courseID
 * Get all schedules for a course
 */
router.get('/schedule/:courseID', async (req, res) => {
    try {
        const { courseID } = req.params;
        const schedules = await getScheduleByCourse(courseID);
        res.json({ success: true, schedules });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/user/:userID
 * Get user information
 */
router.get('/user/:userID', async (req, res) => {
    try {
        const { userID } = req.params;
        const connection = await pool.getConnection();
        
        const [rows] = await connection.execute(`
            SELECT userID, name, current_role, email, more_detail
            FROM user_profile
            WHERE userID = ?
        `, [userID]);
        
        connection.release();
        
        if (rows.length > 0) {
            res.json({ success: true, user: rows[0] });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/courses/create
 * Create a new course (only Lecturer, Graduated, Senior Undergraduated allowed)
 */
router.post('/courses/create', async (req, res) => {
    try {
        console.log('📥 POST /api/courses/create - Request body:', req.body);
        
        const { ownerID, course_title, description, open_state } = req.body;
        
        // Validation: Check required fields
        if (!ownerID || !course_title || !description || !open_state) {
            console.error('❌ Missing required fields:', { ownerID, course_title, description, open_state });
            return res.status(400).json({ success: false, message: 'All fields are required: ownerID, course_title, description, open_state' });
        }
        
        // Get user info to check role
        const connection = await pool.getConnection();
        const [userRows] = await connection.execute(`
            SELECT current_role FROM user_profile WHERE userID = ?
        `, [ownerID]);
        
        if (userRows.length === 0) {
            connection.release();
            console.error('❌ User not found:', ownerID);
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        console.log('✅ User found:', { ownerID, role: userRows[0].current_role });
        
        // Check if user has permission
        const allowedRoles = ['Lecturer', 'Graduated', 'Senior Undergraduated'];
        if (!allowedRoles.includes(userRows[0].current_role)) {
            connection.release();
            console.error('❌ Access Denied - Invalid role:', userRows[0].current_role);
            return res.status(403).json({ 
                success: false, 
                message: `Access Denied! Only Lecturers, Graduated students, and Senior Undergraduated students can create courses. Your role: ${userRows[0].current_role}` 
            });
        }
        
        connection.release();
        
        console.log('🔓 User authorized - Creating course:', { course_title, description, open_state });
        
        // Create the course
        const result = await createCourse(ownerID, course_title, description, open_state);
        
        console.log('✅ Course created successfully:', result);
        
        if (result.success) {
            res.json({ success: true, message: 'Course created successfully', courseID: result.courseID });
        } else {
            res.status(500).json({ success: false, message: 'Failed to create course' });
        }
    } catch (error) {
        console.error('❌ Error creating course:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
// ==================== FORUM ROUTES ====================

// Get all forum threads for a course
router.get('/course/:courseId/forum/threads', async (req, res) => {
    try {
        const { courseId } = req.params;
        const threads = await getForumThreads(courseId);
        res.json({ success: true, threads });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get a specific forum thread with all answers
router.get('/course/:courseId/forum/threads/:threadId', async (req, res) => {
    try {
        const { threadId } = req.params;
        const threadDetail = await getForumThreadDetail(threadId);
        res.json({ success: true, data: threadDetail });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create a new forum thread (student asks a question)
router.post('/course/:courseId/forum/threads', async (req, res) => {
    try {
        const { courseId } = req.params;
        const { questionBody, user_id } = req.body;
        
        if (!questionBody || questionBody.trim() === '') {
            return res.status(400).json({ success: false, message: 'Question body is required' });
        }
        
        if (!user_id) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }
        
        const threadId = await createForumThread(courseId, questionBody, user_id);
        res.json({ success: true, threadId, message: 'Forum thread created successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add a reply to a forum thread (tutor or student answer)
router.post('/course/:courseId/forum/threads/:threadId/reply', async (req, res) => {
    try {
        const { threadId } = req.params;
        const { answerBody, user_id, parent_answerID } = req.body;
        
        if (!answerBody || answerBody.trim() === '') {
            return res.status(400).json({ success: false, message: 'Answer body is required' });
        }
        
        if (!user_id) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }
        
        const answerId = await addForumAnswer(threadId, answerBody, user_id, parent_answerID || null);
        res.json({ success: true, answerId, message: 'Reply added successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete a forum thread
router.delete('/course/:courseId/forum/threads/:threadId', async (req, res) => {
    try {
        const { threadId } = req.params;
        await deleteForumThread(threadId);
        res.json({ success: true, message: 'Forum thread deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete a forum answer
router.delete('/course/:courseId/forum/answers/:answerId', async (req, res) => {
    try {
        const { answerId } = req.params;
        await deleteForumAnswer(answerId);
        res.json({ success: true, message: 'Forum answer deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create a follow-up question to a tutor answer
router.post('/course/:courseId/forum/answers/:answerId/followup', async (req, res) => {
    try {
        const { answerId } = req.params;
        const { AnswerBody, user_id } = req.body;
        
        if (!AnswerBody || AnswerBody.trim() === '') {
            return res.status(400).json({ success: false, message: 'Follow-up question is required' });
        }
        
        if (!user_id) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }
        
        const followUpId = await createFollowUpQuestion(answerId, AnswerBody, user_id);
        res.json({ success: true, followUpId, message: 'Follow-up question created successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== WAITING QUEUE / APPROVAL ROUTES ====================

/**
 * GET /api/waiting-queue/:courseID
 * Get all pending enrollment requests for a course
 */
router.get('/waiting-queue/:courseID', async (req, res) => {
    try {
        const { courseID } = req.params;
        const connection = await pool.getConnection();
        
        const [requests] = await connection.execute(`
            SELECT 
                wq.userID,
                up.name,
                up.email,
                wq.status,
                wq.tutor_courseID
            FROM waiting_queue wq
            JOIN user_profile up ON wq.userID = up.userID
            WHERE wq.tutor_courseID = ? AND wq.status = 'Waiting'
            ORDER BY wq.userID ASC
        `, [courseID]);
        
        connection.release();
        res.json({ success: true, requests: requests });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/waiting-queue/approve
 * Approve student enrollment
 */
router.post('/waiting-queue/approve', async (req, res) => {
    try {
        const { courseID, userID } = req.body;
        
        if (!courseID || !userID) {
            return res.status(400).json({ success: false, message: 'courseID and userID are required' });
        }
        
        const connection = await pool.getConnection();
        
        // Update waiting queue status
        await connection.execute(`
            UPDATE waiting_queue 
            SET status = 'Approved'
            WHERE tutor_courseID = ? AND userID = ?
        `, [courseID, userID]);
        
        // Add to enrollment
        await connection.execute(`
            INSERT INTO tutor_course_enrollment (tutor_courseID, userID)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE tutor_courseID = tutor_courseID
        `, [courseID, userID]);
        
        connection.release();
        res.json({ success: true, message: 'Student approved and enrolled' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/waiting-queue/decline
 * Decline student enrollment
 */
router.post('/waiting-queue/decline', async (req, res) => {
    try {
        const { courseID, userID } = req.body;
        
        if (!courseID || !userID) {
            return res.status(400).json({ success: false, message: 'courseID and userID are required' });
        }
        
        const connection = await pool.getConnection();
        
        // Update waiting queue status
        await connection.execute(`
            UPDATE waiting_queue 
            SET status = 'Denied'
            WHERE tutor_courseID = ? AND userID = ?
        `, [courseID, userID]);
        
        connection.release();
        res.json({ success: true, message: 'Student enrollment declined' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== NOTIFICATION ROUTES ====================

/**
 * GET /api/notifications/:userID
 * Get all notifications for a user
 */
router.get('/notifications/:userID', async (req, res) => {
    try {
        const { userID } = req.params;
        
        const notifications = await getAllNotifications(userID);
        const unreadCount = await getUnreadNotificationCount(userID);
        
        res.json({ 
            success: true, 
            notifications: notifications,
            unreadCount: unreadCount
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/notifications/:userID/unread
 * Get unread notifications for a user
 */
router.get('/notifications/:userID/unread', async (req, res) => {
    try {
        const { userID } = req.params;
        
        const notifications = await getUnreadNotifications(userID);
        
        res.json({ 
            success: true, 
            notifications: notifications,
            count: notifications.length
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * PUT /api/notifications/:notificationID/read
 * Mark a notification as read
 */
router.put('/notifications/:notificationID/read', async (req, res) => {
    try {
        const { notificationID } = req.params;
        
        const result = await markNotificationAsRead(notificationID);
        
        if (result) {
            res.json({ success: true, message: 'Notification marked as read' });
        } else {
            res.status(404).json({ success: false, message: 'Notification not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * PUT /api/notifications/:userID/read-all
 * Mark all notifications as read for a user
 */
router.put('/notifications/:userID/read-all', async (req, res) => {
    try {
        const { userID } = req.params;
        
        const count = await markAllNotificationsAsRead(userID);
        
        res.json({ 
            success: true, 
            message: 'All notifications marked as read',
            count: count
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * DELETE /api/notifications/:notificationID
 * Delete a notification
 */
router.delete('/notifications/:notificationID', async (req, res) => {
    try {
        const { notificationID } = req.params;
        
        const result = await deleteNotification(notificationID);
        
        if (result) {
            res.json({ success: true, message: 'Notification deleted' });
        } else {
            res.status(404).json({ success: false, message: 'Notification not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== RATING ROUTES ====================

// Get all ratings for a course
router.get('/course/:courseId/ratings', async (req, res) => {
    try {
        const { courseId } = req.params;
        const ratings = await getCourseRatings(courseId);
        const avgData = await getAverageRating(courseId);
        res.json({ success: true, ratings, averageRating: avgData.averageRating, totalRatings: avgData.totalRatings });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get user's rating for a course
router.get('/course/:courseId/ratings/:userId', async (req, res) => {
    try {
        const { courseId, userId } = req.params;
        const userRating = await getUserRating(courseId, userId);
        res.json({ success: true, userRating });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add or update rating
router.post('/course/:courseId/ratings', async (req, res) => {
    try {
        const { courseId } = req.params;
        const { userID, rating, review } = req.body;
        
        if (!userID) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }
        
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
        }
        
        const result = await addOrUpdateRating(courseId, userID, rating, review || '');
        res.json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete rating
router.delete('/course/:courseId/ratings/:userId', async (req, res) => {
    try {
        const { courseId, userId } = req.params;
        await deleteRating(courseId, userId);
        res.json({ success: true, message: 'Rating deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


module.exports = router;
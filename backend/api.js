const express = require('express');
const router = express.Router();
const { verifyLogin, updateUserProfile, getUserProfile } = require('../CRUD/crud_login');
const { getAllCoursesList, getEnrolledCourses, getCourseById } = require('../CRUD/crud_course');
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

module.exports = router;
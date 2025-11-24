const pool = require('../backend/database');

async function getAllCoursesList() {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute(`
            SELECT 
                tc.tutor_courseID,
                tc.course_title as name,
                tc.description,
                up.name as tutor,
                tc.open_state,
                COUNT(tce.userID) as enrolledCount
            FROM tutor_course tc
            LEFT JOIN user_profile up ON tc.ownerID = up.userID
            LEFT JOIN tutor_course_enrollment tce ON tc.tutor_courseID = tce.tutor_courseID
            WHERE tc.open_state != 'Private'
            GROUP BY tc.tutor_courseID
            ORDER BY tc.tutor_courseID DESC
        `);
        connection.release();
        return rows;
    } catch (error) {
        console.error('Error fetching courses:', error);
        throw error;
    }
}

/**
 * Get course by ID
 */
async function getCourseById(courseID) {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute(`
            SELECT 
                tc.*,
                up.name as tutor
            FROM tutor_course tc
            LEFT JOIN user_profile up ON tc.ownerID = up.userID
            WHERE tc.tutor_courseID = ?
        `, [courseID]);
        connection.release();
        return rows[0] || null;
    } catch (error) {
        console.error('Error fetching course:', error);
        throw error;
    }
}

/**
 * Get courses by user ID (enrolled courses)
 */
async function getEnrolledCourses(userID) {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute(`
            SELECT 
                tc.tutor_courseID,
                tc.course_title as name,
                tc.description,
                up.name as tutor
            FROM tutor_course tc
            JOIN tutor_course_enrollment tce ON tc.tutor_courseID = tce.tutor_courseID
            LEFT JOIN user_profile up ON tc.ownerID = up.userID
            WHERE tce.userID = ?
            ORDER BY tc.tutor_courseID DESC
        `, [userID]);
        connection.release();
        return rows;
    } catch (error) {
        console.error('Error fetching enrolled courses:', error);
        throw error;
    }
}

/**
 * Create new course
 */
async function createCourse(ownerID, courseTitle, description, openState = 'Open') {
    try {
        const connection = await pool.getConnection();
        const [result] = await connection.execute(
            'INSERT INTO tutor_course (ownerID, course_title, description, open_state) VALUES (?, ?, ?, ?)',
            [ownerID, courseTitle, description, openState]
        );
        connection.release();
        return { success: true, courseID: result.insertId };
    } catch (error) {
        console.error('Error creating course:', error);
        throw error;
    }
}

/**
 * Update course
 */
async function updateCourse(courseID, courseTitle, description, openState) {
    try {
        const connection = await pool.getConnection();
        await connection.execute(
            'UPDATE tutor_course SET course_title = ?, description = ?, open_state = ? WHERE tutor_courseID = ?',
            [courseTitle, description, openState, courseID]
        );
        connection.release();
        return { success: true, courseID };
    } catch (error) {
        console.error('Error updating course:', error);
        throw error;
    }
}

/**
 * Enroll user in course
 */
async function enrollUserInCourse(courseID, userID) {
    try{
        const connect = await pool.getConnection();
        await connect.execute(
            'INSERT INTO tutor_course_enrollment(tutor_courseID, userID) VALUES(?,?)'[courseID,userID]
        )
        connect.release();
         return {success: true}; 
    }catch (error) {
        console.error('Error enrolling user in course:', error);
        throw error;
    }
}

module.exports = {
    getAllCoursesList,
    getCourseById,
    getEnrolledCourses,
    createCourse,
    updateCourse,
    enrollUserInCourse
};
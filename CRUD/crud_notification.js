const pool = require('../backend/database');

/**
 * Create a new notification
 */
async function createNotification(userID, courseID, type, message, relatedID = null) {
    try {
        const connection = await pool.getConnection();
        const [result] = await connection.execute(`
            INSERT INTO notification (userID, tutor_courseID, notification_type, message, related_id, created_at)
            VALUES (?, ?, ?, ?, ?, NOW())
        `, [userID, courseID, type, message, relatedID]);
        connection.release();
        console.log(`Notification created: user=${userID}, course=${courseID}, type=${type}`);
        return result.insertId;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
}

/**
 * Get unread notifications for a user
 */
async function getUnreadNotifications(userID, limit = 20) {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute(`
            SELECT 
                notificationID,
                tutor_courseID,
                notification_type,
                message,
                related_id,
                is_read,
                created_at
            FROM notification
            WHERE userID = ? AND is_read = 0
            ORDER BY created_at DESC
            LIMIT ${parseInt(limit)}`
        , [userID]);
        connection.release();
        return rows;
    } catch (error) {
        console.error('Error fetching unread notifications:', error);
        throw error;
    }
}

/**
 * Get all notifications for a user
 */
async function getAllNotifications(userID, limit = 50) {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute(`
            SELECT 
                notificationID,
                tutor_courseID,
                notification_type,
                message,
                related_id,
                is_read,
                created_at
            FROM notification
            WHERE userID = ?
            ORDER BY created_at DESC
            LIMIT ${parseInt(limit)}`
        , [userID]);
        connection.release();
        return rows;
    } catch (error) {
        console.error('Error fetching all notifications:', error);
        throw error;
    }
}

/**
 * Mark notification as read
 */
async function markNotificationAsRead(notificationID) {
    try {
        const connection = await pool.getConnection();
        const [result] = await connection.execute(`
            UPDATE notification
            SET is_read = 1
            WHERE notificationID = ?
        `, [notificationID]);
        connection.release();
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
    }
}

/**
 * Mark all notifications as read for a user
 */
async function markAllNotificationsAsRead(userID) {
    try {
        const connection = await pool.getConnection();
        const [result] = await connection.execute(`
            UPDATE notification
            SET is_read = 1
            WHERE userID = ? AND is_read = 0
        `, [userID]);
        connection.release();
        return result.affectedRows;
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
    }
}

/**
 * Get unread notification count for a user
 */
async function getUnreadNotificationCount(userID) {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute(`
            SELECT COUNT(*) as count
            FROM notification
            WHERE userID = ? AND is_read = 0
        `, [userID]);
        connection.release();
        return rows[0].count;
    } catch (error) {
        console.error('Error getting unread notification count:', error);
        throw error;
    }
}

/**
 * Notify all enrolled users of a course
 */
async function notifyEnrolledUsers(courseID, type, message, relatedID = null, excludeUserID = null) {
    try {
        const connection = await pool.getConnection();
        
        // Get all enrolled users + course owner
        const [enrolledUsers] = await connection.execute(`
            SELECT DISTINCT u.userID
            FROM tutor_course_enrollment e
            JOIN user_profile u ON e.userID = u.userID
            WHERE e.tutor_courseID = ?
            UNION
            SELECT ownerID as userID
            FROM tutor_course
            WHERE tutor_courseID = ?
        `, [courseID, courseID]);
        
        // Insert notifications for each user
        for (const user of enrolledUsers) {
            if (excludeUserID && user.userID === excludeUserID) continue;
            
            try {
                await connection.execute(`
                    INSERT INTO notification (userID, tutor_courseID, notification_type, message, related_id, created_at)
                    VALUES (?, ?, ?, ?, ?, NOW())
                `, [user.userID, courseID, type, message, relatedID]);
            } catch (err) {
                console.error(`Failed to notify user ${user.userID}:`, err);
            }
        }
        
        connection.release();
        console.log(`Notifications sent to ${enrolledUsers.length} users for course ${courseID}`);
        return enrolledUsers.length;
    } catch (error) {
        console.error('Error notifying enrolled users:', error);
        throw error;
    }
}

/**
 * Delete a notification
 */
async function deleteNotification(notificationID) {
    try {
        const connection = await pool.getConnection();
        const [result] = await connection.execute(`
            DELETE FROM notification
            WHERE notificationID = ?
        `, [notificationID]);
        connection.release();
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error deleting notification:', error);
        throw error;
    }
}

module.exports = {
    createNotification,
    getUnreadNotifications,
    getAllNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    getUnreadNotificationCount,
    notifyEnrolledUsers,
    deleteNotification
};

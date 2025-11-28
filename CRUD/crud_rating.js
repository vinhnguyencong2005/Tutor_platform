const db = require('../backend/database');

// Get all ratings for a course (with user information)
async function getCourseRatings(courseID) {
    try {
        const [ratings] = await db.query(
            `SELECT rr.tutor_courseID, rr.userID, rr.rating, rr.review, up.name as user_name
             FROM review_rating rr
             LEFT JOIN user_profile up ON rr.userID = up.userID
             WHERE rr.tutor_courseID = ?
             ORDER BY rr.userID DESC`,
            [courseID]
        );
        return ratings;
    } catch (error) {
        console.error('Error fetching course ratings:', error);
        throw error;
    }
}

// Get average rating for a course
async function getAverageRating(courseID) {
    try {
        const [result] = await db.query(
            `SELECT AVG(rating) as averageRating, COUNT(*) as totalRatings
             FROM review_rating
             WHERE tutor_courseID = ?`,
            [courseID]
        );
        return {
            averageRating: result[0].averageRating || 0,
            totalRatings: result[0].totalRatings || 0
        };
    } catch (error) {
        console.error('Error fetching average rating:', error);
        throw error;
    }
}

// Check if user has already reviewed this course
async function getUserRating(courseID, userID) {
    try {
        const [result] = await db.query(
            `SELECT * FROM review_rating
             WHERE tutor_courseID = ? AND userID = ?`,
            [courseID, userID]
        );
        return result.length > 0 ? result[0] : null;
    } catch (error) {
        console.error('Error fetching user rating:', error);
        throw error;
    }
}

// Add or update a rating
async function addOrUpdateRating(courseID, userID, rating, review) {
    try {
        // Check if rating already exists
        const existingRating = await getUserRating(courseID, userID);
        
        if (existingRating) {
            // Update existing rating
            await db.query(
                `UPDATE review_rating 
                 SET rating = ?, review = ?
                 WHERE tutor_courseID = ? AND userID = ?`,
                [rating, review, courseID, userID]
            );
            return { success: true, message: 'Rating updated successfully' };
        } else {
            // Insert new rating
            await db.query(
                `INSERT INTO review_rating (tutor_courseID, userID, rating, review)
                 VALUES (?, ?, ?, ?)`,
                [courseID, userID, rating, review]
            );
            return { success: true, message: 'Rating added successfully' };
        }
    } catch (error) {
        console.error('Error adding/updating rating:', error);
        throw error;
    }
}

// Delete a rating
async function deleteRating(courseID, userID) {
    try {
        await db.query(
            `DELETE FROM review_rating
             WHERE tutor_courseID = ? AND userID = ?`,
            [courseID, userID]
        );
        return true;
    } catch (error) {
        console.error('Error deleting rating:', error);
        throw error;
    }
}

module.exports = {
    getCourseRatings,
    getAverageRating,
    getUserRating,
    addOrUpdateRating,
    deleteRating
};

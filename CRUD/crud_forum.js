const db = require('../backend/database');

// Get all threads for a course
async function getForumThreads(courseID) {
    try {
        const [threads] = await db.query(
            `SELECT forumID, createDate, inner_body 
             FROM forum_thread 
             WHERE tutor_courseID = ? 
             ORDER BY createDate DESC`,
            [courseID]
        );
        return threads;
    } catch (error) {
        console.error('Error fetching forum threads:', error);
        throw error;
    }
}

// Get a single thread with all its answers and follow-ups
async function getForumThreadDetail(threadID) {
    try {
        const [thread] = await db.query(
            `SELECT forumID, createDate, inner_body, tutor_courseID 
             FROM forum_thread 
             WHERE forumID = ?`,
            [threadID]
        );

        if (thread.length === 0) {
            throw new Error('Thread not found');
        }

        const [answers] = await db.query(
            `SELECT answerID, answer_body 
             FROM forum_answer 
             WHERE forumID = ? 
             ORDER BY answerID ASC`,
            [threadID]
        );

        // Fetch follow-ups for each answer
        const answersWithFollowUps = await Promise.all(
            answers.map(async (answer) => {
                const followUps = await getFollowUpQuestions(answer.answerID);
                return { ...answer, followUps };
            })
        );

        return {
            thread: thread[0],
            answers: answersWithFollowUps
        };
    } catch (error) {
        console.error('Error fetching forum thread detail:', error);
        throw error;
    }
}

// Create a new forum thread (new conversation/question)
async function createForumThread(courseID, questionBody) {
    try {
        const [result] = await db.query(
            `INSERT INTO forum_thread (tutor_courseID, inner_body, createDate) 
             VALUES (?, ?, NOW())`,
            [courseID, questionBody]
        );
        return result.insertId;
    } catch (error) {
        console.error('Error creating forum thread:', error);
        throw error;
    }
}

// Add a reply to a forum thread (tutor answer)
async function addForumAnswer(threadID, answerBody) {
    try {
        const [result] = await db.query(
            `INSERT INTO forum_answer (forumID, answer_body) 
             VALUES (?, ?)`,
            [threadID, answerBody]
        );
        return result.insertId;
    } catch (error) {
        console.error('Error adding forum answer:', error);
        throw error;
    }
}

// Delete a forum thread (admin/tutor only)
async function deleteForumThread(threadID) {
    try {
        // Delete all answers first
        await db.query(
            `DELETE FROM forum_answer WHERE forumID = ?`,
            [threadID]
        );
        // Delete the thread
        await db.query(
            `DELETE FROM forum_thread WHERE forumID = ?`,
            [threadID]
        );
        return true;
    } catch (error) {
        console.error('Error deleting forum thread:', error);
        throw error;
    }
}

// Delete a forum answer
async function deleteForumAnswer(answerID) {
    try {
        await db.query(
            `DELETE FROM forum_answer WHERE answerID = ?`,
            [answerID]
        );
        return true;
    } catch (error) {
        console.error('Error deleting forum answer:', error);
        throw error;
    }
}

// Create a follow-up question to a tutor answer (student asking for clarification)
async function createFollowUpQuestion(answerID, followupBody) {
    try {
        const [result] = await db.query(
            `INSERT INTO forum_answer_followup (answerID, followup_body, createDate) 
             VALUES (?, ?, NOW())`,
            [answerID, followupBody]
        );
        return result.insertId;
    } catch (error) {
        console.error('Error creating follow-up question:', error);
        throw error;
    }
}

// Get follow-up questions for an answer
async function getFollowUpQuestions(answerID) {
    try {
        const [followUps] = await db.query(
            `SELECT followupID, followup_body, createDate 
             FROM forum_answer_followup 
             WHERE answerID = ? 
             ORDER BY createDate ASC`,
            [answerID]
        );
        return followUps;
    } catch (error) {
        console.error('Error fetching follow-up questions:', error);
        throw error;
    }
}

module.exports = {
    getForumThreads,
    getForumThreadDetail,
    createForumThread,
    addForumAnswer,
    deleteForumThread,
    deleteForumAnswer,
    createFollowUpQuestion,
    getFollowUpQuestions
};

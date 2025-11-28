const pool = require('../backend/database');

/**
 * Get all chapters/sections for a course
 */
async function getChaptersByCourse(courseID) {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute(`
            SELECT 
                chapter_num,
                chapter_name
            FROM chapter
            WHERE tutor_courseID = ?
            ORDER BY chapter_num ASC
        `, [courseID]);
        connection.release();
        return rows;
    } catch (error) {
        console.error('Error fetching chapters:', error);
        throw error;
    }
}

/**
 * Get all materials for a specific chapter
 */
async function getMaterialsByChapter(courseID, chapterNum) {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute(`
            SELECT 
                material_title,
                material_link,
                type
            FROM material
            WHERE tutor_courseID = ? AND chapter_num = ?
            ORDER BY material_title ASC
        `, [courseID, chapterNum]);
        connection.release();
        return rows;
    } catch (error) {
        console.error('Error fetching materials:', error);
        throw error;
    }
}

/**
 * Add a new chapter/section to a course
 */
async function addSection(courseID, chapterNum, chapterName) {
    try {
        const connection = await pool.getConnection();
        const [result] = await connection.execute(`
            INSERT INTO chapter (tutor_courseID, chapter_num, chapter_name)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE chapter_name = ?
        `, [courseID, chapterNum, chapterName, chapterName]);
        connection.release();
        console.log(`Chapter created/updated: Course ${courseID}, Chapter ${chapterNum}, Name: ${chapterName}`);
        return true;
    } catch (error) {
        console.error('Error adding chapter:', error);
        throw error;
    }
}

/**
 * Get all library materials
 */
async function getLibraryMaterials() {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute(`
            SELECT 
                material_name,
                Lmaterial_link as material_link
            FROM library_material
            ORDER BY material_name ASC
        `);
        connection.release();
        return rows;
    } catch (error) {
        console.error('Error fetching library materials:', error);
        throw error;
    }
}

/**
 * Get all schedule items for a course
 */
async function getScheduleByCourse(courseID) {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute(`
            SELECT 
                schedule_title,
                schedule_content,
                start_date,
                end_date,
                location
            FROM schedule
            WHERE tutor_courseID = ?
            ORDER BY start_date ASC
        `, [courseID]);
        connection.release();
        return rows;
    } catch (error) {
        console.error('Error fetching schedule:', error);
        throw error;
    }
}



/**
 * Add a material to a chapter
 */
async function addMaterial(courseID, chapterNum, material_title, material_link, type) {
    try {
        const connection = await pool.getConnection();
        const [result] = await connection.execute(`
            INSERT INTO material (chapter_num, tutor_courseID, material_title, material_link, type)
            VALUES (?, ?, ?, ?, ?)
        
        `, [chapterNum, courseID, material_title, material_link, type]);
        connection.release();
        console.log(`Material added: course=${courseID}, chapter=${chapterNum}, title=${material_title}`);
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error adding material:', error.message);
        throw error;
    }
}

/**
 * Delete a material from a chapter
 */
async function deleteMaterial(courseID, chapterNum, material_link) {
    try {
        const connection = await pool.getConnection();
        const [result] = await connection.execute(`
            DELETE FROM material WHERE tutor_courseID = ? AND chapter_num = ? AND material_link = ?
        `, [courseID, chapterNum, material_link]);
        connection.release();
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error deleting material:', error);
        throw error;
    }
}

// export the new functions
module.exports = {
    getChaptersByCourse,
    getMaterialsByChapter,
    getLibraryMaterials,
    getScheduleByCourse,
    addMaterial,
    deleteMaterial,
    addSection
};

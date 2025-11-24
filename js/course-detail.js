// Get course_id and user_id from local storage
const courseId = localStorage.getItem("course_id");
const userId = localStorage.getItem("currentUserID"); // From login
const userRole = localStorage.getItem("currentUserRole"); // Lecturer or Student

let courseData = null;

// ============================================
// ACCESS CONTROL & ROUTING
// ============================================

// Check if user owns this course (for lecturers)
function checkCourseOwnership(course) {
    if (!userId || userRole !== 'Lecturer') {
        return false;
    }
    // Check if current user is the owner
    return course.ownerID == userId;
}

// Check if user is enrolled in the course
async function checkEnrollment() {
    if (!userId) {
        return false; // User not logged in
    }

    try {
        const response = await fetch(`http://localhost:3000/api/enrollment/${courseId}/${userId}`);
        const data = await response.json();
        return data.success && data.enrolled;
    } catch (error) {
        console.error("Error checking enrollment:", error);
        return false;
    }
}

// ============================================
// COURSE DETAIL LOADING & ROUTING
// ============================================

// Load course details and handle routing based on user type
async function loadCourseDetail() {
    if (!courseId) {
        console.error("No course_id found in local storage");
        document.querySelector(".section-one").innerHTML = "<p>Course not found</p>";
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/courses/${courseId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();

        if (data.success && data.course) {
            courseData = data.course;
            
            // ROUTING LOGIC:
            
            // 1. Check if lecturer owns this course
            if (checkCourseOwnership(courseData)) {
                // Redirect to lecturer editing interface
                window.location.href = "enter-course-from-tutor.html";
                return;
            }
            
            // 2. Check if user is enrolled
            const isEnrolled = await checkEnrollment();
            if (isEnrolled) {
                // Redirect to student view
                window.location.href = "enter-course-from-students.html";
                return;
            }
            
            // 3. If NOT enrolled -> show preview page
            displayPreview();
            
        } else {
            console.error("Course not found or invalid response");
            document.querySelector(".section-one").innerHTML = "<p>Course not found</p>";
        }
    } catch (error) {
        console.error("Error loading course details:", error);
        document.querySelector(".section-one").innerHTML = `<p>Error loading course. Make sure the backend server is running.</p>`;
    }
}

// ============================================
// PREVIEW PAGE (FOR UNENROLLED STUDENTS)
// ============================================

// Display course preview for unenrolled students
function displayPreview() {
    // Section One - Course title, description, instructor, and Join button
    const innerTitle = document.querySelector(".section-one .inner-title");
    const innerDesc = document.querySelector(".section-one .inner-desc");
    const innerTutor = document.querySelector(".section-one .inner-tutor");
    const joinBtn = document.querySelector(".section-one .btn-join");
    
    if (innerTitle) innerTitle.textContent = courseData.name || courseData.course_title;
    if (innerDesc) innerDesc.textContent = courseData.description;
    if (innerTutor) innerTutor.textContent = `Created by ${courseData.tutor || 'Unknown'}, Developer and Lead Instructor`;
    if (joinBtn) {
        joinBtn.textContent = "Join now";
        joinBtn.addEventListener("click", enrollCourse);
    }
    
    // Section Three - Description
    const sectionThreeDesc = document.querySelector(".section-three .inner-desc");
    if (sectionThreeDesc) {
        sectionThreeDesc.textContent = courseData.description;
    }
}

// ============================================
// ENROLLMENT HANDLER
// ============================================

// Enroll user in course (handles both Open and Permission access states)
async function enrollCourse() {
    if (!userId) {
        alert("Please log in first to enroll in this course");
        window.location.href = "login.html";
        return;
    }

    try {
        const enrollType = courseData.open_state; // Get access state (Open or Permission)
        let endpoint = '';
        let requestData = { courseId: courseId, userId: userId };
        
        // Determine endpoint based on access state
        if (enrollType === 'Open') {
            endpoint = '/api/enroll'; // Direct enrollment
        } else if (enrollType === 'Permission') {
            endpoint = '/api/enroll-request'; // Request enrollment
        } else {
            alert("This course is not available for enrollment");
            return;
        }

        const response = await fetch(`http://localhost:3000${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        const data = await response.json();

        if (data.success) {
            if (enrollType === 'Open') {
                alert("Successfully enrolled in course!");
                // Redirect to student course view
                window.location.href = "enter-course-from-students.html";
            } else if (enrollType === 'Permission') {
                alert("Enrollment request sent! Waiting for tutor approval...");
                // Change button to show waiting status
                const joinBtn = document.querySelector(".section-one .btn-join");
                if (joinBtn) {
                    joinBtn.textContent = "Waiting for approval";
                    joinBtn.disabled = true;
                    joinBtn.classList.add('btn-warning');
                }
            }
        } else {
            alert("Failed to enroll: " + (data.message || "Unknown error"));
        }
    } catch (error) {
        console.error("Error enrolling in course:", error);
        alert("Error enrolling in course. Please try again.");
    }
}

// ============================================
// INITIALIZATION
// ============================================

// Load course details when page loads
loadCourseDetail();
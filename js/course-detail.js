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
    if (!userId || (userRole !== 'Lecturer' && userRole !== 'Senior Undergraduated')) {
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

    // Section Two - Load course chapters and materials
    loadCourseChapters();

    // Section Four - Load instructor information
    loadInstructorInfo();

    // Section Six - Load ratings (no feedback form for unenrolled users)
    const feedbackSection = document.getElementById("feedback-section");
    if (feedbackSection) {
        feedbackSection.style.display = "none"; // Hide feedback form for unenrolled users
    }
    // Initialize ratings using course-rating.js
    initializeRating(courseId);
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
// INSTRUCTOR INFORMATION LOADER
// ============================================

// Load and display course chapters with materials
async function loadCourseChapters() {
    if (!courseId) {
        console.error("No course_id found");
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/course/${courseId}/chapters`);
        const data = await response.json();

        const accordion = document.getElementById('courseAccordion');
        if (!accordion) return;

        // Clear loading message
        accordion.innerHTML = '';

        if (data.success && data.chapters && data.chapters.length > 0) {
            data.chapters.forEach((chapter, index) => {
                const chapterId = `chapter-${chapter.chapter_num}`;
                
                // Create accordion item
                const accordionItem = document.createElement('div');
                accordionItem.className = 'accordion-item';
                accordionItem.innerHTML = `
                    <h2 class="accordion-header">
                        <button class="accordion-button ${index === 0 ? '' : 'collapsed'}" type="button" data-bs-toggle="collapse" data-bs-target="#${chapterId}">
                            ${chapter.chapter_name}
                        </button>
                    </h2>
                    <div id="${chapterId}" class="accordion-collapse collapse ${index === 0 ? 'show' : ''}" data-bs-parent="#courseAccordion">
                        <div class="accordion-body" id="body-${chapterId}">
                            <p class="text-muted">Loading materials...</p>
                        </div>
                    </div>
                `;
                accordion.appendChild(accordionItem);

                // Load materials for this chapter
                loadChapterMaterials(chapter.chapter_num, chapterId);
            });
        } else {
            accordion.innerHTML = '<p class="text-muted">No course content available yet.</p>';
        }
    } catch (error) {
        console.error("Error loading course chapters:", error);
        const accordion = document.getElementById('courseAccordion');
        if (accordion) {
            accordion.innerHTML = '<p class="text-muted">Error loading course content.</p>';
        }
    }
}

// Load materials for a specific chapter
async function loadChapterMaterials(chapterNum, chapterId) {
    try {
        const response = await fetch(`http://localhost:3000/api/course/${courseId}/chapter/${chapterNum}/materials`);
        const data = await response.json();

        const bodyEl = document.getElementById(`body-${chapterId}`);
        if (!bodyEl) return;

        if (data.success && data.materials && data.materials.length > 0) {
            let materialsHtml = '';
            data.materials.forEach(material => {
                materialsHtml += `
                    <div class="lecture">
                        <strong>${material.material_name}</strong>
                        ${material.material_type ? `<span class="badge bg-secondary ms-2">${material.material_type}</span>` : ''}
                    </div>
                `;
            });
            bodyEl.innerHTML = materialsHtml;
        } else {
            bodyEl.innerHTML = '<p class="text-muted">No materials for this chapter.</p>';
        }
    } catch (error) {
        console.error("Error loading chapter materials:", error);
        const bodyEl = document.getElementById(`body-${chapterId}`);
        if (bodyEl) {
            bodyEl.innerHTML = '<p class="text-muted">Error loading materials.</p>';
        }
    }
}

// ============================================
// INSTRUCTOR INFORMATION LOADER
// ============================================

// Load and display instructor information from database
async function loadInstructorInfo() {
    if (!courseData || !courseData.ownerID) {
        console.error("No instructor information available");
        return;
    }

    try {
        const instructorId = parseInt(courseData.ownerID); // Ensure it's a number
        console.log("Loading instructor with ID:", instructorId);
        
        // Fetch instructor details from users API
        const response = await fetch(`http://localhost:3000/api/user/${instructorId}`);
        const data = await response.json();

        if (data.success && data.user) {
            const instructor = data.user;
            
            // Update instructor information in section-four
            const nameEl = document.getElementById('instructor-name');
            const emailEl = document.getElementById('instructor-email');
            const phoneEl = document.getElementById('instructor-phone');
            const titleEl = document.getElementById('instructor-title');
            const bioEl = document.getElementById('instructor-bio');

            if (nameEl) nameEl.textContent = instructor.full_name || 'Unknown';
            if (emailEl) emailEl.textContent = instructor.email || 'Not provided';
            if (phoneEl) phoneEl.textContent = instructor.phone || 'Not provided';
            if (titleEl) titleEl.textContent = instructor.professional_title || 'Instructor';
            if (bioEl) bioEl.textContent = instructor.bio || 'No bio provided';
        } else {
            console.log("Instructor information not found");
        }
    } catch (error) {
        console.error("Error loading instructor information:", error);
        // Fallback: use data from course object if available
        if (courseData.tutor) {
            const nameEl = document.getElementById('instructor-name');
            if (nameEl) nameEl.textContent = courseData.tutor;
        }
    }
}

// ============================================
// INITIALIZATION
// ============================================

// Load course details when page loads
loadCourseDetail();

// ============================================
// RATING & FEEDBACK SYSTEM
// ============================================

let rating = 0; // Store the current rating

// Initialize star rating functionality
function initializeStarRating() {
    const stars = document.querySelectorAll('.star');
    const feedbackInput = document.getElementById('feedback-input');
    const sendBtn = document.getElementById('send-feedback-btn');
    
    if (!stars.length) return;
    
    // Add click event to each star
    stars.forEach(star => {
        star.addEventListener('click', function() {
            rating = parseInt(this.getAttribute('data-rating'));
            updateStars(rating);
        });
        
        // Add hover effect
        star.addEventListener('mouseenter', function() {
            const hoverRating = parseInt(this.getAttribute('data-rating'));
            updateStars(hoverRating);
        });
    });
    
    // Reset to current rating when mouse leaves
    const starContainer = document.getElementById('star-rating');
    if (starContainer) {
        starContainer.addEventListener('mouseleave', function() {
            updateStars(rating);
        });
    }
    
    // Handle send button click
    if (sendBtn) {
        sendBtn.addEventListener('click', function() {
            const feedback = feedbackInput ? feedbackInput.value.trim() : '';
            
            if (rating === 0) {
                alert('Please select a rating (1-5 stars)');
                return;
            }
            
            if (feedback === '') {
                alert('Please write your feedback');
                return;
            }
            
            // Call function to send feedback and rating to database
            sendFeedbackToDatabase(feedback, rating);
        });
    }
}

// Update star display (filled or empty)
function updateStars(count) {
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < count) {
            star.classList.remove('fa-regular');
            star.classList.add('fa-solid', 'text-warning');
        } else {
            star.classList.remove('fa-solid', 'text-warning');
            star.classList.add('fa-regular', 'text-secondary');
        }
    });
}

// Send feedback and rating to database
async function sendFeedbackToDatabase(feedback, rating) {
    if (!userId) {
        alert('Please log in to submit feedback');
        return;
    }
    
    if (!courseId) {
        alert('Course information not found');
        return;
    }
    
    console.log('Sending feedback to database:');
    console.log('Course ID:', courseId);
    console.log('User ID:', userId);
    console.log('Rating:', rating);
    console.log('Feedback:', feedback);
    
    try {
        // TODO: Replace with your actual API endpoint
        const response = await fetch('http://localhost:3000/api/feedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                courseId: courseId,
                userId: userId,
                rating: rating,
                feedback: feedback
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Thank you for your feedback!');
            // Reset form
            document.getElementById('feedback-input').value = '';
            rating = 0;
            updateStars(0);
        } else {
            alert('Failed to submit feedback: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error submitting feedback:', error);
        alert('Error submitting feedback. Please try again.');
    }
}

// Initialize star rating when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeStarRating);
} else {
    initializeStarRating();
}
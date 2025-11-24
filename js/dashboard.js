// Get userID from localStorage (set during login)
const userID = localStorage.getItem('userID') || 2312345; // Default for testing

/**
 * Load dashboard overview (stats)
 */
async function loadDashboardOverview() {
    try {
        const response = await fetch(`http://localhost:3000/api/dashboard/${userID}`);
        const data = await response.json();
        
        if (data.success) {
            displayOverviewStats(data);
        } else {
            console.error('Failed to load dashboard overview:', data.error);
        }
    } catch (error) {
        console.error('Error loading dashboard overview:', error);
    }
}

/**
 * Display overview statistics on dashboard
 */
function displayOverviewStats(data) {
    const overviewContainer = document.querySelector('.dashboard-overview');
    if (overviewContainer) {
        overviewContainer.innerHTML = `
            <div class="stat-card">
                <h3>${data.enrolledCoursesCount}</h3>
                <p>Enrolled Courses</p>
            </div>
            <div class="stat-card">
                <h3>${data.universitaryCoursesCount}</h3>
                <p>University Courses</p>
            </div>
            <div class="stat-card">
                <h3>${data.averageGPA.toFixed(2)}</h3>
                <p>Average GPA</p>
            </div>
            <div class="stat-card">
                <h3>${data.user?.name || 'User'}</h3>
                <p>${data.user?.current_role || 'Role'}</p>
            </div>
        `;
    }
}

/**
 * Load and display enrolled courses
 */
async function loadEnrolledCourses() {
    try {
        const response = await fetch(`http://localhost:3000/api/dashboard/${userID}/enrolled-courses`);
        const data = await response.json();
        
        if (data.success) {
            displayEnrolledCourses(data.courses);
        } else {
            console.error('Failed to load enrolled courses:', data.error);
        }
    } catch (error) {
        console.error('Error loading enrolled courses:', error);
    }
}

/**
 * Display enrolled courses in HTML
 */
function displayEnrolledCourses(courses) {
    const coursesContainer = document.querySelector('.enrolled-courses-list');
    if (!coursesContainer) return;
    
    if (courses.length === 0) {
        coursesContainer.innerHTML = '<p>No enrolled courses yet.</p>';
        return;
    }
    
    const coursesHTML = courses.map(course => `
        <div class="course-card">
            <h4>${course.name}</h4>
            <p class="tutor">Tutor: ${course.tutor}</p>
            <p class="description">${course.description}</p>
            <div class="course-meta">
                <span class="badge">${course.open_state}</span>
                <span class="chapters">📚 ${course.chaptersCount} Chapters</span>
                <span class="forum">💬 ${course.forumThreadsCount} Discussions</span>
            </div>
            <small>Last updated: ${course.lastUpdated ? new Date(course.lastUpdated).toLocaleDateString() : 'Never'}</small>
        </div>
    `).join('');
    
    coursesContainer.innerHTML = coursesHTML;
}

/**
 * Load and display upcoming schedule
 */
async function loadUpcomingSchedule() {
    try {
        const response = await fetch(`http://localhost:3000/api/dashboard/${userID}/schedule?limit=5`);
        const data = await response.json();
        
        if (data.success) {
            displaySchedule(data.schedule);
        } else {
            console.error('Failed to load schedule:', data.error);
        }
    } catch (error) {
        console.error('Error loading schedule:', error);
    }
}

/**
 * Display schedule/events
 */
function displaySchedule(schedule) {
    const scheduleContainer = document.querySelector('.dashboard-list') || document.querySelector('.schedule-list');
    if (!scheduleContainer) return;
    
    if (schedule.length === 0) {
        scheduleContainer.innerHTML = '<p>No upcoming events.</p>';
        return;
    }
    
    const scheduleHTML = schedule.map(event => {
        const startDate = new Date(event.start_date);
        const day = startDate.toLocaleDateString('en-US', { weekday: 'short' });
        const date = startDate.toLocaleDateString();
        
        return `
            <div class="day-block">
                <div class="day-header">${day}, ${date}</div>
                <div class="course-item">
                    <p class="course-title"><strong>${event.course_title}</strong></p>
                    <p class="schedule-title">${event.schedule_title}</p>
                    <p class="content">${event.schedule_content}</p>
                    <p class="location">📍 ${event.location || 'Online'}</p>
                    <p class="time">⏰ ${startDate.toLocaleTimeString()}</p>
                </div>
            </div>
        `;
    }).join('');
    
    scheduleContainer.innerHTML = scheduleHTML;
}

/**
 * Load and display forum activity
 */
async function loadForumActivity() {
    try {
        const response = await fetch(`http://localhost:3000/api/dashboard/${userID}/forum-activity?limit=5`);
        const data = await response.json();
        
        if (data.success) {
            displayForumActivity(data.activity);
        } else {
            console.error('Failed to load forum activity:', data.error);
        }
    } catch (error) {
        console.error('Error loading forum activity:', error);
    }
}

/**
 * Display recent forum activity
 */
function displayForumActivity(threads) {
    const forumContainer = document.querySelector('.forum-activity-list');
    if (!forumContainer) return;
    
    if (threads.length === 0) {
        forumContainer.innerHTML = '<p>No forum activity yet.</p>';
        return;
    }
    
    const forumHTML = threads.map(thread => `
        <div class="forum-thread">
            <p class="course-name">${thread.course_title}</p>
            <p class="thread-body">${thread.inner_body}</p>
            <div class="thread-meta">
                <span class="answer-count">💬 ${thread.answerCount} Answers</span>
                <small>${new Date(thread.createDate).toLocaleDateString()}</small>
            </div>
        </div>
    `).join('');
    
    forumContainer.innerHTML = forumHTML;
}

/**
 * Load and display waiting queue requests
 */
async function loadWaitingQueue() {
    try {
        const response = await fetch(`http://localhost:3000/api/dashboard/${userID}/waiting-queue`);
        const data = await response.json();
        
        if (data.success && data.requests.length > 0) {
            displayWaitingQueue(data.requests);
        }
    } catch (error) {
        console.error('Error loading waiting queue:', error);
    }
}

/**
 * Display waiting queue requests
 */
function displayWaitingQueue(requests) {
    const queueContainer = document.querySelector('.waiting-queue-list');
    if (!queueContainer) return;
    
    const queueHTML = requests.map(request => `
        <div class="queue-item ${request.status.toLowerCase()}">
            <h5>${request.course_title}</h5>
            <p>${request.description}</p>
            <p class="tutor">Tutor: ${request.tutor}</p>
            <span class="status-badge">${request.status}</span>
        </div>
    `).join('');
    
    queueContainer.innerHTML = queueHTML;
}

/**
 * Load and display university courses performance
 */
async function loadUniversityCourses() {
    try {
        const response = await fetch(`http://localhost:3000/api/dashboard/${userID}/university-courses`);
        const data = await response.json();
        
        if (data.success) {
            displayUniversityCourses(data.courses);
        }
    } catch (error) {
        console.error('Error loading university courses:', error);
    }
}

/**
 * Display university courses and GPA
 */
function displayUniversityCourses(courses) {
    const uniContainer = document.querySelector('.university-courses-list');
    if (!uniContainer) return;
    
    if (courses.length === 0) {
        uniContainer.innerHTML = '<p>No university courses taken yet.</p>';
        return;
    }
    
    const coursesHTML = courses.map(course => `
        <div class="uni-course">
            <p class="course-name">${course.course_name}</p>
            <p class="course-id">${course.courseID}</p>
            <div class="gpa-display">
                <span class="gpa-value">${course.GPA.toFixed(2)}</span>
                <span class="gpa-label">/4.0</span>
            </div>
        </div>
    `).join('');
    
    uniContainer.innerHTML = coursesHTML;
}

/**
 * Initialize dashboard - Load all sections
 */
function initDashboard() {
    loadDashboardOverview();
    loadEnrolledCourses();
    loadUpcomingSchedule();
    loadForumActivity();
    loadWaitingQueue();
    loadUniversityCourses();
}

// Load dashboard when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
} else {
    initDashboard();
}
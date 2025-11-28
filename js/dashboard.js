// Get userID from localStorage (set during login)
const userID = localStorage.getItem('currentUserID') || 2312345; // Default for testing

/**
 * Load all schedules for upcoming view
 */
async function loadAllUpcomingSchedules() {
    try {
        const response = await fetch(`http://localhost:3000/courses/managed/${userID}`);
        const data = await response.json();
        
        const courses = data.courses || data;
        let allSchedules = [];
        
        // Fetch schedules for each managed course
        for (const course of courses) {
            try {
                const scheduleRes = await fetch(`http://localhost:3000/api/schedule/${course.tutor_courseID}`);
                const scheduleData = await scheduleRes.json();
                
                if (scheduleData.success && scheduleData.schedules) {
                    allSchedules = allSchedules.concat(
                        scheduleData.schedules.map(s => ({
                            ...s,
                            course_name: course.name,
                            course_id: course.tutor_courseID
                        }))
                    );
                }
            } catch (error) {
                console.error(`Error loading schedules for course ${course.tutor_courseID}:`, error);
            }
        }
        
        displayUpcomingSchedules(allSchedules);
    } catch (error) {
        console.error('Error loading all upcoming schedules:', error);
    }
}

/**
 * Display upcoming schedules and deadlines
 */
function displayUpcomingSchedules(schedules) {
    const scheduleList = document.getElementById('scheduleList');
    if (!scheduleList) return;
    
    if (!schedules || schedules.length === 0) {
        scheduleList.innerHTML = '<p style="text-align: center; padding: 20px;">No upcoming events.</p>';
        return;
    }
    
    // Sort by start_date
    const sortedSchedules = schedules.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
    
    // Create individual cards for each schedule
    const scheduleHTML = sortedSchedules.map(event => {
        let startDateTime;
        let endDateTime;
        
        // Handle different date formats for start_date
        if (event.start_time) {
            try {
                // Extract date from start_date (handle both YYYY-MM-DD and ISO format)
                let dateStr = event.start_date;
                if (dateStr.includes('T')) {
                    // ISO format: extract date part only
                    dateStr = dateStr.split('T')[0];
                }
                
                const [year, month, day] = dateStr.split('-').map(Number);
                const [hour, minute, second] = event.start_time.split(':').map(Number);
                startDateTime = new Date(year, month - 1, day, hour, minute, second || 0);
            } catch (e) {
                console.error('Error parsing date/time:', event, e);
                startDateTime = new Date(event.start_date);
            }
        } else {
            startDateTime = new Date(event.start_date);
        }
        
        // Handle different date formats for end_date
        if (event.end_time) {
            try {
                // Extract date from end_date (handle both YYYY-MM-DD and ISO format)
                let dateStr = event.end_date;
                if (dateStr.includes('T')) {
                    // ISO format: extract date part only
                    dateStr = dateStr.split('T')[0];
                }
                
                const [year, month, day] = dateStr.split('-').map(Number);
                const [hour, minute, second] = event.end_time.split(':').map(Number);
                endDateTime = new Date(year, month - 1, day, hour, minute, second || 0);
            } catch (e) {
                console.error('Error parsing end date/time:', event, e);
                endDateTime = new Date(event.end_date);
            }
        } else {
            endDateTime = new Date(event.end_date);
        }
        
        const dayName = startDateTime.toLocaleDateString('en-US', { weekday: 'short' });
        const dateStr = startDateTime.toLocaleDateString();
        const startTimeStr = startDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const endTimeStr = endDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        return `
            <div class="schedule-card">
                <div class="schedule-date-header">${dayName}, ${dateStr}</div>
                <div class="schedule-content">
                    <div class="schedule-time">
                        <div style="display: flex; gap: 20px; align-items: center;">
                            <div>
                                <div style="font-size: 12px; color: #666;">Start</div>
                                <div style="font-weight: 600;">${startTimeStr}</div>
                            </div>
                            <div style="color: #ccc;">→</div>
                            <div>
                                <div style="font-size: 12px; color: #666;">End</div>
                                <div style="font-weight: 600;">${endTimeStr}</div>
                            </div>
                        </div>
                    </div>
                    <div class="course-item">
                        <p class="course-title"><strong>${event.course_name}</strong> - ${event.schedule_title}</p>
                        <p class="content">${event.schedule_content}</p>
                        <p class="location">📍 ${event.location || 'Online'}</p>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    scheduleList.innerHTML = scheduleHTML;
}

/**
 * Initialize dashboard - Load all sections
 */
function initDashboard() {
    if (!userID || userID === '2312345') {
        // Check if not logged in
        const storedUserID = localStorage.getItem('currentUserID');
        if (!storedUserID) {
            alert('Please log in first');
            window.location.href = 'login.html';
            return;
        }
    }
    
    loadAllUpcomingSchedules();
}

// Load dashboard when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
} else {
    initDashboard();
}

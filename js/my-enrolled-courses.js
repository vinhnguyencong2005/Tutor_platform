(async function() {
    try {
        // Get userID from localStorage; if not present redirect to login
        const userID = localStorage.getItem('currentUserID');
        if (!userID) {
            // Redirect to login page so the user can authenticate
            window.location.href = 'login.html';
            return;
        }

        const response = await fetch(`http://localhost:3000/courses/enrolled/${encodeURIComponent(userID)}`);
        const data = await response.json();
        const courses = data.courses || data;

        if (!courses || courses.length === 0) {
            document.querySelector('.course-list').innerHTML = '<p>No enrolled courses found.</p>';
            return;
        }

        const newArray = courses.map(item => {
            const courseId = item.tutor_courseID || item.courseID || item.id;
            return `
            <div class="col-xl-4 col-lg-6 col-md-12">
                <div class="course-card">
                    <img src="../assets/images/course_thumbnail.png" alt="Course Image" style="width: 100%; height: 200px; object-fit: cover;"/>
                    <div class="inner-course-title">${item.name}</div>
                    <div class="inner-course-desc">${item.description || ''}</div>
                    <div class="inner-course-tutor">${item.tutor ? 'Dr.' + item.tutor : ''}</div>
                    <a href="course-detail.html?courseID=${courseId}"><button class="btn btn-join">View</button></a>
                </div>
            </div>
            `;
        });

        document.querySelector('.course-list').innerHTML = newArray.join('');
    } catch (error) {
        console.error('Error loading enrolled courses:', error);
        document.querySelector('.course-list').innerHTML = '<p>Error loading courses. Check console for details.</p>';
    }
})();

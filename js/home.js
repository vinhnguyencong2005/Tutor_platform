// Load first 3 courses from API
async function loadCourses() {
    try {
        const response = await fetch("http://localhost:3000/api/courses/home");
        const data = await response.json();

        if (data.success && data.courses) {
            const newArray = data.courses.map(item => {
                return `
                    <div class="col-xl-3 col-lg-4 col-md-6">
                        <a href="#">
                            <div class="course-card">
                                <img src="../assets/images/course_thumbnail.png" alt="Course Image" style="width: 100%; height: 200px; object-fit: cover;"/>
                                <div class="inner-course-title">${item.name}</div>
                                <div class="inner-course-desc">${item.description}</div>
                                <div class="inner-course-tutor">${item.tutor || 'Unknown'}</div>
                            </div>
                        </a>
                    </div>
                `;
            });
            document.querySelector(".course-list").innerHTML = newArray.join("");
        } else {
            console.error("No courses found");
            document.querySelector(".course-list").innerHTML = "<p>No courses available</p>";
        }
    } catch (error) {
        console.error("Error loading courses:", error);
        document.querySelector(".course-list").innerHTML = "<p>Error loading courses</p>";
    }
}

// Load courses when page loads
loadCourses();

// Profile button click handler
document.getElementById("profile-button").addEventListener("click", (event) => {
    event.preventDefault();
    window.location.href = "user-profile.html";
});
fetch("http://localhost:3000/courses")
.then(response => response.json())
.then(data => {
    const newArray = data.map(item => {
        return `
            <div class="col-xl-4 col-lg-6 col-md-12">
                <a href="#">
                    <div class="course-card">
                        <img src="../assets/images/course_thumbnail.png" alt="Course Image" style="width: 100%; height: 200px; object-fit: cover;"/>
                        <div class="inner-course-title">${item.name}</div>
                        <div class="inner-course-desc">${item.description}</div>
                        <div class="inner-course-tutor">Dr.${item.tutor}</div>
                        <a href="#"><button class="btn btn-join">View</button></a>
                    </div>
                </a>
            </div>
        `;
    });
    document.querySelector(".course-list").innerHTML = newArray.join("");
});
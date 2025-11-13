fetch("http://localhost:3000/courses")
.then(response => response.json())
.then(data => {
    const firstFour = data.slice(0, 4);
    const newArray = firstFour.map(item => {
        return `
            <div class="col-xl-3 col-lg-4 col-md-6">
                <a href="course-detail.html">
                    <div class="course-card">
                        <div class="inner-course-img">
                            <img src="../assets/images/course-img.png" alt="" width="100%" height="auto">
                        </div>
                        <div class="inner-course-content">
                            <div class="inner-course-title">${item.name}</div>
                        </div>
                    </div>
                </a>
            </div>
        `;
    });
    document.querySelector(".course-list").innerHTML = newArray.join("");
});
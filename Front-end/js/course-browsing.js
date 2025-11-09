fetch("http://localhost:3000/courses")
.then(response => response.json())
.then(data => {
    const newArray = data.map(item => {
        return `
            <div class="col-xl-3  col-lg-6 col-md-6">
                <a href="#">
                    <div class="course-card">
                        <div class="inner-course-title">${item.name}</div>
                        <div class="inner-course-desc">${item.description}</div>
                        <div class="inner-course-tutor">Dr.${item.tutor}</div>
                        <a href="#"><button class="btn btn-join">Request to join</button></a>
                    </div>
                </a>
            </div>
        `;
    });
    document.querySelector(".course-list").innerHTML = newArray.join("");
});
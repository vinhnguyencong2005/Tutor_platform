fetch("http://localhost:3000/dashboard")
.then(response => response.json())
.then(data => {
    const newArray = data.map(item => {
        return `
            <div class="day-block">
                <div class="day-header">${item.day}</div>
                <div class="course-item">
                    <p class="time">${item.time}</p>
                    <p><strong>Course:</strong> ${item.course}</p>
                    <p><em>Description:</em> ${item.task}</p>
                </div>
            </div>
        `;
    });
    document.querySelector(".dashboard-list").innerHTML = newArray.join("");
});
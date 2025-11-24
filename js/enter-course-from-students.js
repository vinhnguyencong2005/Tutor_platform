// Get user info from local storage
const userId = localStorage.getItem("currentUserID");
const courseId = localStorage.getItem("course_id");

// Check access and initialization
function initializeStudentCourseView() {
    if (!userId) {
        alert("Please log in first");
        window.location.href = "login.html";
        return false;
    }

    if (!courseId) {
        alert("No course selected");
        window.location.href = "home.html";
        return false;
    }

    return true;
}

// Load course details
async function loadCourseDetails() {
    try {
        const response = await fetch(`http://localhost:3000/api/courses/${courseId}`);
        const data = await response.json();

        if (data.success && data.course) {
            const course = data.course;
            document.querySelector(".inner-title").textContent = course.course_title || course.name;
            
            // Get instructor info
            const instructorName = course.instructor_name || "Instructor";
            document.querySelector(".inner-tutor").textContent = `Created by ${instructorName}, Developer and Lead Instructor`;

            // Load chapters and materials
            loadCourseContent();
        } else {
            alert("Course not found");
            window.location.href = "my-enrolled-courses.html";
        }
    } catch (error) {
        console.error("Error loading course details:", error);
        alert("Error loading course details. Please try again.");
    }
}

// Load course chapters and materials
async function loadCourseContent() {
    try {
        const response = await fetch(`http://localhost:3000/api/course/${courseId}/chapters`);
        const data = await response.json();

        if (data.success && data.chapters) {
            displayChapters(data.chapters);
        } else {
            document.getElementById("courseAccordion").innerHTML = "<p class='text-muted'>No course content available yet.</p>";
        }
    } catch (error) {
        console.error("Error loading course content:", error);
        document.getElementById("courseAccordion").innerHTML = "<p class='text-muted'>Error loading course content.</p>";
    }
}

// Display chapters with materials
async function displayChapters(chapters) {
    const accordion = document.getElementById("courseAccordion");
    accordion.innerHTML = '';

    for (const chapter of chapters) {
        const accordionItem = document.createElement('div');
        accordionItem.className = 'accordion-item';
        
        const accordionHeader = document.createElement('h2');
        accordionHeader.className = 'accordion-header';
        
        const button = document.createElement('button');
        button.className = 'accordion-button collapsed';
        button.type = 'button';
        button.setAttribute('data-bs-toggle', 'collapse');
        button.setAttribute('data-bs-target', `#section${chapter.chapter_num}`);
        button.textContent = chapter.chapter_name;
        
        accordionHeader.appendChild(button);
        accordionItem.appendChild(accordionHeader);

        const accordionBody = document.createElement('div');
        accordionBody.id = `section${chapter.chapter_num}`;
        accordionBody.className = 'accordion-collapse collapse';
        accordionBody.setAttribute('data-bs-parent', '#courseAccordion');

        const bodyContent = document.createElement('div');
        bodyContent.className = 'accordion-body';
        bodyContent.innerHTML = '<p class="text-muted">Loading materials...</p>';

        accordionBody.appendChild(bodyContent);
        accordionItem.appendChild(accordionBody);
        accordion.appendChild(accordionItem);

        // Load materials for this chapter
        try {
            const materialsResponse = await fetch(`http://localhost:3000/api/course/${courseId}/chapter/${chapter.chapter_num}/materials`);
            const materialsData = await materialsResponse.json();

            if (materialsData.success && materialsData.materials) {
                displayMaterials(chapter.chapter_num, materialsData.materials, bodyContent);
            } else {
                bodyContent.innerHTML = '<p class="text-muted">No materials available for this chapter.</p>';
            }
        } catch (error) {
            console.error(`Error loading materials for chapter ${chapter.chapter_num}:`, error);
            bodyContent.innerHTML = '<p class="text-muted">Error loading materials.</p>';
        }
    }
}

// Display materials within a chapter
function displayMaterials(chapterNum, materials, bodyContent) {
    if (!materials || materials.length === 0) {
        bodyContent.innerHTML = '<p class="text-muted">No materials available for this chapter.</p>';
        return;
    }

    bodyContent.innerHTML = '';
    
    const materialList = document.createElement('ul');
    materialList.className = 'list-group list-group-flush';

    materials.forEach(material => {
        const item = document.createElement('li');
        item.className = 'list-group-item d-flex justify-content-between align-items-center';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'flex-grow-1';
        
        const titleDiv = document.createElement('div');
        titleDiv.className = 'fw-bold mb-2';
        titleDiv.textContent = material.material_title;
        
        const typeSpan = document.createElement('span');
        typeSpan.className = 'badge bg-info me-2';
        typeSpan.textContent = material.type;
        
        let actionButton = '';
        if (material.material_link) {
            actionButton = `<a href="${material.material_link}" target="_blank" class="btn btn-sm btn-outline-primary">
                <i class="fas fa-external-link-alt"></i> View ${material.type}
            </a>`;
        }
        
        contentDiv.innerHTML = `
            <div class="fw-bold mb-2">${material.material_title}</div>
            <div>
                <span class="badge bg-info me-2">${material.type}</span>
                ${actionButton}
            </div>
        `;
        
        item.appendChild(contentDiv);
        materialList.appendChild(item);
    });

    bodyContent.appendChild(materialList);
}

// Load ratings and reviews
async function loadRatingsAndReviews() {
    try {
        const response = await fetch(`http://localhost:3000/api/course/${courseId}/reviews`);
        const data = await response.json();

        if (data.success && data.reviews) {
            displayReviews(data.reviews, data.averageRating, data.ratingCount);
        }
    } catch (error) {
        console.error("Error loading reviews:", error);
    }
}

// Display reviews
function displayReviews(reviews, averageRating, ratingCount) {
    const reviewsContainer = document.querySelector('.section-six');
    if (!reviewsContainer) return;

    // Update rating header
    const ratingHeader = reviewsContainer.querySelector('.inner-title');
    if (ratingHeader) {
        ratingHeader.innerHTML = `
            <span class="text-warning fs-2">★</span>
            ${averageRating || '4.7'} course rating <span class="text-muted">(${ratingCount || '455,678'} ratings)</span>
        `;
    }

    // Display reviews
    const reviewsContent = reviewsContainer.innerHTML;
    const reviewsDisplay = reviewsContainer.querySelector('.border');
    
    if (reviewsDisplay && reviews.length > 0) {
        const container = reviewsDisplay.parentElement;
        container.innerHTML = '';

        reviews.slice(0, 3).forEach(review => {
            const reviewDiv = document.createElement('div');
            reviewDiv.className = 'border p-3 mb-3 rounded';
            reviewDiv.innerHTML = `
                <h5 class="fw-bold">${review.user_name || 'Anonymous'}</h5>
                <div class="text-warning mb-2">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
                <p>${review.comment || review.review_text}</p>
            `;
            container.appendChild(reviewDiv);
        });
    }
}

// Submit review/rating
async function submitReview() {
    const reviewInput = document.querySelector('.input-group input[placeholder="Feedback/Rating"]');
    const feedback = reviewInput?.value || '';

    if (!feedback) {
        alert("Please enter your feedback");
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/course/${courseId}/review`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: userId,
                comment: feedback,
                rating: 5 // Default rating, can be updated to use star selection
            })
        });

        const data = await response.json();

        if (data.success) {
            alert("Thank you for your feedback!");
            reviewInput.value = '';
            loadRatingsAndReviews(); // Reload reviews
        } else {
            alert("Error submitting feedback");
        }
    } catch (error) {
        console.error("Error submitting review:", error);
        alert("Error submitting feedback. Please try again.");
    }
}

// Handle forum posts
async function submitForumPost() {
    const forumInput = document.querySelector('.section-seven .input-group input[placeholder="Join the conversation"]');
    const message = forumInput?.value || '';

    if (!message) {
        alert("Please enter a message");
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/course/${courseId}/forum`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: userId,
                message: message
            })
        });

        const data = await response.json();

        if (data.success) {
            forumInput.value = '';
            loadForumPosts(); // Reload forum
        } else {
            alert("Error posting message");
        }
    } catch (error) {
        console.error("Error posting to forum:", error);
        alert("Error posting message. Please try again.");
    }
}

// Load forum posts
async function loadForumPosts() {
    try {
        const response = await fetch(`http://localhost:3000/api/course/${courseId}/forum`);
        const data = await response.json();

        if (data.success && data.posts) {
            displayForumPosts(data.posts);
        }
    } catch (error) {
        console.error("Error loading forum posts:", error);
    }
}

// Display forum posts
function displayForumPosts(posts) {
    const forumContainer = document.querySelector('.section-seven');
    if (!forumContainer) return;

    // Find comments container and replace with new posts
    const commentsContainer = forumContainer.querySelector('.comment');
    if (commentsContainer) {
        commentsContainer.parentElement.innerHTML = '';

        posts.forEach(post => {
            const commentDiv = document.createElement('div');
            commentDiv.className = 'comment mb-4';
            commentDiv.innerHTML = `
                <h6 class="fw-bold">${post.user_name || 'Anonymous'}</h6>
                <p class="comment-text">${post.message || post.post_text}</p>
                <div class="reply-btn text-muted small mb-2">
                    <i class="bi bi-reply me-1"></i> Reply
                </div>
            `;
            commentsContainer.parentElement.appendChild(commentDiv);
        });
    }
}

// Setup event listeners
document.addEventListener('DOMContentLoaded', () => {
    if (!initializeStudentCourseView()) {
        return;
    }

    // Load initial data
    loadCourseDetails();
    loadRatingsAndReviews();
    loadForumPosts();

    // Setup button handlers
    const sendReviewBtn = document.querySelector('.section-six .btn-primary');
    if (sendReviewBtn) {
        sendReviewBtn.addEventListener('click', submitReview);
    }

    const sendForumBtn = document.querySelector('.section-seven .btn-primary');
    if (sendForumBtn) {
        sendForumBtn.addEventListener('click', submitForumPost);
    }

    // Profile button
    const profileBtn = document.getElementById("button-header-profile");
    if (profileBtn) {
        profileBtn.addEventListener("click", (event) => {
            event.preventDefault();
            window.location.href = "user-profile.html";
        });
    }
});

async function rateCourse(rating) {
    try {
        const response = await fetch(`http://localhost:3000/api/course/${courseId}/rate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userID: userId,
                courseID: courseId,
                rating: rating,
                review: '' // You can add a review input if needed
            })
        });

        const data = await response.json();

        if (data.success) {
            alert("Thank you for rating the course!");
            loadRatingsAndReviews(); // Reload ratings and reviews
        } else {
            alert("Error submitting rating");
        }
    } catch (error) {
        console.error("Error submitting rating:", error);
        alert("Error submitting rating. Please try again.");
    }
}
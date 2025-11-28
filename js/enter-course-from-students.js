// Get user info from local storage
const userId = localStorage.getItem("currentUserID");
const courseId = localStorage.getItem("course_id");
let selectedRating = 0; // GLOBAL variable for star rating

// Initialize page on load
document.addEventListener('DOMContentLoaded', () => {
    if (initializeStudentCourseView()) {
        loadCourseDetails();
        initializeRating(courseId); // Load ratings
        setupStarRatingHandler(); // Setup rating form
        checkUserRating(); // Check if user already rated
        setupForumHandler(); // Setup forum Send button
        loadForumQuestions(); // Load forum questions
    }
});

// Setup forum Send button handler
function setupForumHandler() {
    const forumBtn = document.querySelector('.section-seven .btn-primary');
    if (forumBtn) {
        forumBtn.addEventListener('click', submitForumQuestion);
    }
}

// Check if user already rated this course
async function checkUserRating() {
    try {
        const response = await fetch(`http://localhost:3000/api/course/${courseId}/ratings/${userId}`);
        const data = await response.json();
        
        if (data.success && data.userRating) {
            // User already rated - disable the send button
            const sendBtn = document.getElementById('send-feedback-btn');
            const feedbackInput = document.getElementById('feedback-input');
            const stars = document.querySelectorAll('#star-rating .star');
            
            sendBtn.disabled = true;
            sendBtn.textContent = 'Already Rated';
            feedbackInput.disabled = true;
            stars.forEach(star => star.style.pointerEvents = 'none');
        }
    } catch (error) {
        console.error('Error checking user rating:', error);
    }
}

// Disable rating form if user already rated
function disableRatingForm() {
    const sendBtn = document.getElementById('send-feedback-btn');
    const feedbackInput = document.getElementById('feedback-input');
    const stars = document.querySelectorAll('#star-rating .star');
    
    sendBtn.disabled = true;
    sendBtn.textContent = 'Already Rated';
    feedbackInput.disabled = true;
    stars.forEach(star => star.style.pointerEvents = 'none');
}

// Setup star rating input handler
function setupStarRatingHandler() {
    const stars = document.querySelectorAll('#star-rating .star');

    stars.forEach(star => {
        star.addEventListener('click', () => {
            selectedRating = parseInt(star.dataset.rating);
            console.log('Rating selected:', selectedRating);
            updateStarDisplay(selectedRating);
        });

        star.addEventListener('mouseover', () => {
            updateStarDisplay(parseInt(star.dataset.rating));
        });
    });

    document.getElementById('star-rating').addEventListener('mouseleave', () => {
        updateStarDisplay(selectedRating);
    });

    // Handle Send button
    document.getElementById('send-feedback-btn').addEventListener('click', () => {
        const feedbackText = document.getElementById('feedback-input').value.trim();
        const sendBtn = document.getElementById('send-feedback-btn');
        
        console.log('Send clicked - feedback:', feedbackText, 'rating:', selectedRating);
        
        // Check if form is already disabled (already rated)
        if (sendBtn.disabled) {
            alert('You have already rated this course!');
            return;
        }
        
        // Validate feedback text first
        if (!feedbackText || feedbackText === '') {
            alert('Please enter your feedback');
            return;
        }
        
        // Then validate rating
        if (selectedRating === 0) {
            alert('Please select a rating by clicking on stars');
            return;
        }
        
        submitQuickRating(selectedRating, feedbackText);
    });
}

// Update star display
function updateStarDisplay(rating) {
    const stars = document.querySelectorAll('#star-rating .star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.remove('fa-regular');
            star.classList.add('fa-solid');
        } else {
            star.classList.remove('fa-solid');
            star.classList.add('fa-regular');
        }
    });
}

// Submit quick rating
async function submitQuickRating(rating, reviewText) {
    try {
        const response = await fetch(`http://localhost:3000/api/course/${courseId}/ratings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userID: userId,
                rating: parseInt(rating),
                review: reviewText
            })
        });

        const data = await response.json();

        if (data.success || response.ok) {
            alert('Rating submitted successfully!');
            // Reset form
            document.getElementById('feedback-input').value = '';
            updateStarDisplay(0);
            // Disable form after rating
            disableRatingForm();
            // Reload ratings
            await loadCourseRatings();
        } else if (data.error) {
            // Check if error is because user already rated
            if (data.error.includes('already') || data.message.includes('already')) {
                alert('You have already rated this course! You can only rate once.');
                disableRatingForm();
            } else {
                alert('Error: ' + (data.message || data.error));
            }
        }
    } catch (error) {
        console.error('Error submitting rating:', error);
        alert('Error submitting rating. Please try again.');
    }
}

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
        if (!response.ok) {
            console.warn("Reviews endpoint not available");
            return; // Silently return if endpoint doesn't exist
        }
        const data = await response.json();

        if (data.success && data.reviews) {
            displayReviews(data.reviews, data.averageRating, data.ratingCount);
        }
    } catch (error) {
        console.warn("Error loading reviews (using defaults):", error);
        // Use default values if reviews can't be loaded
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

// =============== FORUM FUNCTIONS ===============

// Load forum questions for display
async function loadForumQuestions() {
    try {
        const response = await fetch(`http://localhost:3000/api/course/${courseId}/forum/threads`);
        const data = await response.json();

        if (data.success && data.threads) {
            displayForumQuestions(data.threads);
        } else {
            document.getElementById('forumQuestionsList').innerHTML = '<p class="text-muted">No questions yet. Be the first to ask!</p>';
        }
    } catch (error) {
        console.error('Error loading forum questions:', error);
        document.getElementById('forumQuestionsList').innerHTML = '<p class="text-danger">Error loading forum.</p>';
    }
}

// Display forum questions as clickable items
function displayForumQuestions(threads) {
    const container = document.getElementById('forumQuestionsList');
    container.innerHTML = '';

    if (threads.length === 0) {
        container.innerHTML = '<p class="text-muted">No questions yet. Be the first to ask!</p>';
        return;
    }

    threads.forEach(thread => {
        const date = new Date(thread.createDate);
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const questionDiv = document.createElement('div');
        questionDiv.className = 'comment mb-4';
        questionDiv.style.cursor = 'pointer';
        
        const askerName = thread.user_name || 'Anonymous';
        questionDiv.innerHTML = `
            <h6 class="fw-bold" style="color: #667eea;">Question by ${askerName}</h6>
            <p class="comment-text">${escapeHtml(thread.inner_body)}</p>
            <div class="reply-btn text-muted small">
                <i class="bi bi-reply me-1"></i> View Replies - ${formattedDate}
            </div>
        `;
        
        // Set onclick AFTER setting innerHTML to ensure it works
        questionDiv.onclick = () => viewForumDetail(thread.forumID);
        
        container.appendChild(questionDiv);
    });
}

// Submit new forum question
async function submitForumQuestion() {
    const input = document.getElementById('forumInput');
    const questionBody = input.value.trim();

    if (!questionBody) {
        alert('Please enter your question');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/course/${courseId}/forum/threads`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                questionBody: questionBody,
                user_id: userId
            })
        });

        const data = await response.json();

        if (data.success) {
            input.value = '';
            await loadForumQuestions(); // Reload to show new question
            // Success - no error message needed
        } else {
            alert('Error posting question: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error submitting question:', error);
        alert('Error posting question. Please try again.');
    }
}

// View forum question detail (go to detail page)
function viewForumDetail(threadId) {
    window.location.href = `forum-detail.html?courseId=${courseId}&threadId=${threadId}`;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
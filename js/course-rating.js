// =============== COURSE RATING FUNCTIONS ===============

let currentUserId = null;
let currentUserRole = null;
let ratingCourseId = null;

// Initialize rating system
function initializeRating(cId) {
    ratingCourseId = cId;
    currentUserId = localStorage.getItem('currentUserID');
    currentUserRole = localStorage.getItem('currentUserRole');
    
    if (!ratingCourseId || !currentUserId) {
        console.error('Missing courseId or userId for rating');
        return;
    }
    
    loadCourseRatings();
}

// Load all ratings for the course
async function loadCourseRatings() {
    try {
        const response = await fetch(`http://localhost:3000/api/course/${ratingCourseId}/ratings`);
        const data = await response.json();
        
        if (data.success) {
            displayAverageRating(data.averageRating, data.totalRatings);
            displayCourseRatings(data.ratings, data.averageRating, data.totalRatings);
        } else {
            console.error('Failed to load ratings:', data.error);
        }
    } catch (error) {
        console.error('Error loading ratings:', error);
    }
}

// Display average rating at the top
function displayAverageRating(averageRating, totalRatings) {
    const avgDisplay = document.getElementById('averageRatingDisplay');
    if (!avgDisplay) return;
    
    const avgRating = averageRating ? parseFloat(averageRating) : 0;
    const totalCount = totalRatings || 0;
    
    avgDisplay.innerHTML = `
        <h5 style="font-size: 1.5rem; font-weight: 700;">
            ${generateStars(avgRating)} ${avgRating.toFixed(1)} course rating (${totalCount.toLocaleString()} ${totalCount === 1 ? 'rating' : 'ratings'})
        </h5>
    `;
}

// Load current user's rating
async function loadUserRating() {
    try {
        const response = await fetch(`http://localhost:3000/api/course/${ratingCourseId}/ratings/${currentUserId}`);
        const data = await response.json();
        
        if (data.success && data.userRating) {
            displayUserRating(data.userRating);
        }
    } catch (error) {
        console.error('Error loading user rating:', error);
    }
}

// Display all ratings (student feedback list)
function displayCourseRatings(ratings, averageRating, totalRatings) {
    const ratingContainer = document.getElementById('courseRatingsContainer');
    if (!ratingContainer) return;
    
    let html = `<div class="ratings-section">`;
    
    if (ratings && ratings.length > 0) {
        html += '<div class="ratings-list">';
        ratings.forEach(rating => {
            html += `
                <div class="rating-item p-3 mb-3 border rounded">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="flex-grow-1">
                            <div class="mb-2">
                                <strong>${rating.user_name || 'Anonymous'}</strong>
                                <div class="rating-stars text-warning" style="font-size: 1.2rem;">${generateStars(rating.rating)}</div>
                            </div>
                            ${rating.review ? `<p class="rating-review text-muted mb-0">${escapeHtml(rating.review)}</p>` : ''}
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
    } else {
        html += '<p class="text-muted">No ratings yet. Be the first to rate this course!</p>';
    }
    
    html += '</div>';
    ratingContainer.innerHTML = html;
}

// Display user's own rating (for edit/delete)
function displayUserRating(userRating) {
    const userRatingContainer = document.getElementById('userRatingContainer');
    if (!userRatingContainer) return;
    
    userRatingContainer.innerHTML = `
        <div class="alert alert-info mb-3">
            <strong>Your Rating:</strong>
            <div class="mt-2">
                <span class="rating-stars text-warning">${generateStars(userRating.rating)}</span>
                <span class="badge bg-primary">${userRating.rating}/5</span>
            </div>
            ${userRating.review ? `<p class="mt-2 mb-0"><strong>Your Review:</strong> ${escapeHtml(userRating.review)}</p>` : ''}
            <button class="btn btn-sm btn-warning mt-2" onclick="editRating()">Edit Rating</button>
            <button class="btn btn-sm btn-danger mt-2" onclick="deleteUserRating()">Delete Rating</button>
        </div>
    `;
}

// Submit rating (add or update)
async function submitRating() {
    const ratingValue = document.getElementById('ratingInput').value;
    const reviewText = document.getElementById('reviewInput').value.trim();
    
    if (!ratingValue) {
        alert('Please select a rating');
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:3000/api/course/${ratingCourseId}/ratings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userID: currentUserId,
                rating: parseInt(ratingValue),
                review: reviewText
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(data.message);
            // Clear form
            document.getElementById('ratingInput').value = '';
            document.getElementById('reviewInput').value = '';
            // Reload ratings
            loadCourseRatings();
            loadUserRating();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error submitting rating:', error);
        alert('Error submitting rating');
    }
}

// Edit rating
function editRating() {
    const ratingForm = document.getElementById('ratingFormContainer');
    if (ratingForm) {
        ratingForm.style.display = 'block';
        ratingForm.scrollIntoView({ behavior: 'smooth' });
    }
}

// Delete user's rating
async function deleteUserRating() {
    if (!confirm('Are you sure you want to delete your rating?')) return;
    
    try {
        const response = await fetch(`http://localhost:3000/api/course/${ratingCourseId}/ratings/${currentUserId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Rating deleted successfully');
            const userRatingContainer = document.getElementById('userRatingContainer');
            if (userRatingContainer) {
                userRatingContainer.innerHTML = '';
            }
            loadCourseRatings();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error deleting rating:', error);
        alert('Error deleting rating');
    }
}

// Generate star rating display
function generateStars(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    for (let i = fullStars + (hasHalfStar ? 1 : 0); i < 5; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    return stars;
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

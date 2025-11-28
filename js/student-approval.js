/**
 * Student Approval System
 * Handles enrollment requests for Permission courses
 */

class StudentApprovalManager {
    constructor() {
        this.courseID = this.getCourseIDFromURL();
        this.userID = localStorage.getItem('currentUserID');
        this.approvalRequests = [];
        this.init();
    }

    /**
     * Initialize the approval system
     */
    init() {
        console.log('🔍 StudentApprovalManager init - courseID:', this.courseID, 'userID:', this.userID);
        
        if (!this.courseID || !this.userID) {
            console.warn('⚠️ Cannot initialize approval system - missing courseID or userID');
            return;
        }
        
        // Check if course is Permission type
        if (!this.isCoursePermission()) {
            console.log('ℹ️ This is an Open course - approval system not needed');
            return;
        }
        
        console.log('✅ This is a Permission course - loading approval system');
        
        // Load enrollment requests
        this.loadEnrollmentRequests();
        
        // Refresh every 15 seconds
        setInterval(() => this.loadEnrollmentRequests(), 15000);
    }

    /**
     * Check if course is Permission type
     */
    isCoursePermission() {
        // Try to get open_state from window.courseData (set by enter-course-from-tutor.js)
        if (window.courseData && window.courseData.open_state) {
            const openState = window.courseData.open_state.toLowerCase();
            console.log('📋 Course open_state:', openState);
            return openState === 'permission';
        }
        
        console.warn('⚠️ courseData not available yet, waiting...');
        // If courseData not available, we'll assume it might be Permission and load anyway
        // The updateUI will hide if there are no requests
        return true;
    }

    /**
     * Get course ID from URL
     */
    getCourseIDFromURL() {
        const params = new URLSearchParams(window.location.search);
        return params.get('courseId');
    }

    /**
     * Load enrollment requests (waiting queue)
     */
    async loadEnrollmentRequests() {
        try {
            console.log('📥 Loading approval requests for courseID:', this.courseID);
            
            const response = await fetch(`http://localhost:3000/api/waiting-queue/${this.courseID}`);
            const data = await response.json();
            
            console.log('📦 API response:', data);
            
            if (data.success) {
                this.approvalRequests = data.requests || [];
                console.log(`✅ Loaded ${this.approvalRequests.length} enrollment requests`);
                this.updateUI();
            } else {
                console.warn('❌ API returned error:', data);
            }
        } catch (error) {
            console.error('❌ Error loading enrollment requests:', error);
        }
    }

    /**
     * Update UI with requests
     */
    updateUI() {
        const box = document.getElementById('studentApprovalBox');
        const list = document.getElementById('approvalList');
        const count = document.getElementById('requestCount');
        
        console.log('🎨 Updating UI - requests found:', this.approvalRequests.length);
        console.log('DOM elements - box:', !!box, 'list:', !!list, 'count:', !!count);
        
        if (!box || !list) {
            console.warn('⚠️ Cannot update UI - missing DOM elements');
            return;
        }
        
        // Only show box if there are requests
        if (this.approvalRequests.length === 0) {
            box.style.display = 'none';
            console.log('ℹ️ No requests - hiding approval box');
            return;
        }
        
        box.style.display = 'block';
        count.textContent = this.approvalRequests.length;
        console.log('✅ Showing approval box with', this.approvalRequests.length, 'requests');
        
        // Render requests
        if (this.approvalRequests.length === 0) {
            list.innerHTML = `
                <div class="approval-empty">
                    <div class="approval-empty-icon">✓</div>
                    <p>No pending requests</p>
                </div>
            `;
            return;
        }
        
        list.innerHTML = this.approvalRequests.map(request => `
            <div class="student-request-item" data-userid="${request.userID}">
                <div class="student-avatar">${this.getInitials(request.name)}</div>
                <div class="student-info">
                    <div class="student-name">${request.name}</div>
                    <div class="student-email">${request.email}</div>
                </div>
                <div class="approval-buttons">
                    <button class="btn-approve" onclick="studentApprovalManager.approveRequest(${request.userID})" title="Approve">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn-decline" onclick="studentApprovalManager.declineRequest(${request.userID})" title="Decline">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Get initials from name
     */
    getInitials(name) {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    }

    /**
     * Approve student enrollment
     */
    async approveRequest(userID) {
        try {
            const response = await fetch(`http://localhost:3000/api/waiting-queue/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    courseID: this.courseID,
                    userID: userID,
                    status: 'Approved'
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                console.log(`✓ Student ${userID} approved`);
                // Remove from list
                this.approvalRequests = this.approvalRequests.filter(r => r.userID !== userID);
                this.updateUI();
                // Send notification to student
                this.sendNotificationToStudent(userID, 'approved');
            } else {
                alert('Error: ' + (data.message || 'Could not approve request'));
            }
        } catch (error) {
            console.error('Error approving request:', error);
            alert('Error approving student');
        }
    }

    /**
     * Decline student enrollment
     */
    async declineRequest(userID) {
        if (!confirm('Are you sure you want to decline this request?')) return;
        
        try {
            const response = await fetch(`http://localhost:3000/api/waiting-queue/decline`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    courseID: this.courseID,
                    userID: userID,
                    status: 'Denied'
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                console.log(`✗ Student ${userID} declined`);
                // Remove from list
                this.approvalRequests = this.approvalRequests.filter(r => r.userID !== userID);
                this.updateUI();
                // Send notification to student
                this.sendNotificationToStudent(userID, 'declined');
            } else {
                alert('Error: ' + (data.message || 'Could not decline request'));
            }
        } catch (error) {
            console.error('Error declining request:', error);
            alert('Error declining student');
        }
    }

    /**
     * Send notification to student about approval/decline
     */
    async sendNotificationToStudent(userID, status) {
        try {
            const message = status === 'approved' 
                ? `✓ Your enrollment request for course ${this.courseID} has been approved!`
                : `✗ Your enrollment request for course ${this.courseID} has been declined.`;
            
            // This would send a notification to the student
            console.log(`Notification sent to user ${userID}: ${message}`);
        } catch (error) {
            console.error('Error sending notification:', error);
        }
    }
}

// Initialize approval manager
let studentApprovalManager;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        studentApprovalManager = new StudentApprovalManager();
    });
} else {
    studentApprovalManager = new StudentApprovalManager();
}

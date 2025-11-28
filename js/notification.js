/**
 * Notification System
 * Handles notification UI and interactions
 */

class NotificationManager {
    constructor() {
        this.userID = localStorage.getItem('currentUserID');
        this.notifications = [];
        this.unreadCount = 0;
        this.isDropdownOpen = false;
        this.pollInterval = null;
        this.init();
    }

    /**
     * Initialize notification system
     */
    init() {
        if (!this.userID) return;
        
        // Create notification UI if not exists
        this.createNotificationUI();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load initial notifications
        this.loadNotifications();
        
        // Poll for new notifications every 10 seconds
        this.startPolling();
    }

    /**
     * Create notification UI elements
     */
    createNotificationUI() {
        // Check if notification system already exists
        if (document.getElementById('notificationBell')) return;
        
        // Find the header element with notification bell
        const bellButton = document.querySelector('.button-header-bell');
        if (!bellButton) return;
        
        // Create wrapper
        const wrapper = document.createElement('div');
        wrapper.id = 'notificationBell';
        wrapper.style.position = 'relative';
        
        // Add bell icon with badge
        bellButton.innerHTML = `
            <i class="fa-solid fa-bell"></i>
            <div class="notification-badge" id="notificationBadge" style="display: none;">0</div>
        `;
        
        // Create dropdown
        const dropdown = document.createElement('div');
        dropdown.id = 'notificationDropdown';
        dropdown.className = 'notification-dropdown';
        dropdown.innerHTML = `
            <div class="notification-dropdown-header">
                <h3>Notifications</h3>
                <button id="markAllAsRead">Mark all as read</button>
            </div>
            <div class="notification-list" id="notificationList">
                <div class="notification-empty">
                    <div class="notification-empty-icon">🔔</div>
                    <p>No notifications yet</p>
                </div>
            </div>
        `;
        
        bellButton.parentElement.appendChild(dropdown);
        bellButton.parentElement.style.position = 'relative';
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        const bellButton = document.querySelector('.button-header-bell');
        const markAllBtn = document.getElementById('markAllAsRead');
        
        if (bellButton) {
            bellButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleDropdown();
            });
        }
        
        if (markAllBtn) {
            markAllBtn.addEventListener('click', () => this.markAllAsRead());
        }
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.button-header-bell') && 
                !e.target.closest('.notification-dropdown')) {
                this.closeDropdown();
            }
        });
    }

    /**
     * Toggle notification dropdown
     */
    toggleDropdown() {
        this.isDropdownOpen ? this.closeDropdown() : this.openDropdown();
    }

    /**
     * Open notification dropdown
     */
    openDropdown() {
        const dropdown = document.getElementById('notificationDropdown');
        if (dropdown) {
            dropdown.classList.add('active');
            this.isDropdownOpen = true;
            this.loadNotifications();
        }
    }

    /**
     * Close notification dropdown
     */
    closeDropdown() {
        const dropdown = document.getElementById('notificationDropdown');
        if (dropdown) {
            dropdown.classList.remove('active');
            this.isDropdownOpen = false;
        }
    }

    /**
     * Load notifications from API
     */
    async loadNotifications() {
        try {
            const response = await fetch(`http://localhost:3000/api/notifications/${this.userID}`);
            const data = await response.json();
            
            if (data.success) {
                this.notifications = data.notifications || [];
                this.unreadCount = data.unreadCount || 0;
                this.updateUI();
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }

    /**
     * Update notification UI
     */
    updateUI() {
        this.updateBadge();
        this.updateNotificationList();
    }

    /**
     * Update badge with unread count
     */
    updateBadge() {
        const badge = document.getElementById('notificationBadge');
        if (badge) {
            if (this.unreadCount > 0) {
                badge.textContent = this.unreadCount;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    /**
     * Update notification list display
     */
    updateNotificationList() {
        const list = document.getElementById('notificationList');
        if (!list) return;
        
        if (this.notifications.length === 0) {
            list.innerHTML = `
                <div class="notification-empty">
                    <div class="notification-empty-icon">🔔</div>
                    <p>No notifications</p>
                </div>
            `;
            return;
        }
        
        console.log('📬 Rendering notifications:', this.notifications);
        
        list.innerHTML = this.notifications.map(notif => {
            const date = new Date(notif.created_at);
            const timeStr = this.formatTime(date);
            const isUnread = notif.is_read === 0;
            
            console.log('📧 Notification:', { 
                message: notif.message, 
                type: notif.notification_type,
                unread: isUnread
            });
            
            return `
                <div class="notification-item ${isUnread ? 'unread' : ''}" data-id="${notif.notificationID}">
                    <div class="notification-item-content">
                        <div class="notification-item-text">
                            <p class="notification-item-message notification-type-${notif.notification_type}">
                                ${notif.message}
                            </p>
                            <span class="notification-item-type">${notif.notification_type}</span>
                        </div>
                        <span class="notification-item-time">${timeStr}</span>
                        <button class="notification-item-close" onclick="notificationManager.deleteNotification(${notif.notificationID})">×</button>
                    </div>
                </div>
            `;
        }).join('');
        
        // Add click listeners to mark as read
        list.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.closest('.notification-item-close')) return;
                const notifId = item.dataset.id;
                this.markAsRead(notifId);
            });
        });
    }

    /**
     * Format time for display
     */
    formatTime(date) {
        const now = new Date();
        const diff = now - date;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (seconds < 60) return 'just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        
        return date.toLocaleDateString();
    }

    /**
     * Mark notification as read
     */
    async markAsRead(notificationID) {
        try {
            const response = await fetch(`http://localhost:3000/api/notifications/${notificationID}/read`, {
                method: 'PUT'
            });
            
            if (response.ok) {
                this.loadNotifications();
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }

    /**
     * Mark all notifications as read
     */
    async markAllAsRead() {
        try {
            const response = await fetch(`http://localhost:3000/api/notifications/${this.userID}/read-all`, {
                method: 'PUT'
            });
            
            if (response.ok) {
                this.loadNotifications();
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    }

    /**
     * Delete notification
     */
    async deleteNotification(notificationID) {
        try {
            const response = await fetch(`http://localhost:3000/api/notifications/${notificationID}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                this.loadNotifications();
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    }

    /**
     * Start polling for new notifications
     */
    startPolling() {
        this.pollInterval = setInterval(() => {
            this.loadNotifications();
        }, 10000); // Poll every 10 seconds
    }

    /**
     * Stop polling
     */
    stopPolling() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }
    }

    /**
     * Destroy notification manager
     */
    destroy() {
        this.stopPolling();
    }
}

// Initialize notification manager when DOM is ready
let notificationManager;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        notificationManager = new NotificationManager();
    });
} else {
    notificationManager = new NotificationManager();
}

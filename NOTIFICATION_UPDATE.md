# Notification System Update

## Changes Made

### 1. Backend API Updates

#### Material Upload Notification (`backend/api.js`)
- **Endpoint**: POST `/course/:courseId/chapter/:chapterNum/add-material`
- **Change**: Updated notification message to include course name
- **Before**: `📄 New material added: "Material Title"`
- **After**: `📄 New material added to "Course Name": "Material Title"`
- **How**: 
  - Query database to get `course_title` from `tutor_course` table
  - Include course name in the notification message
  - Send to all enrolled users via `notifyEnrolledUsers()`

#### Schedule Creation Notification (`backend/api.js`)
- **Endpoint**: POST `/schedule/create`
- **Change**: Updated notification message to include course name
- **Before**: `📅 New schedule created: "Schedule Title" on 2025-11-28`
- **After**: `📅 New schedule in "Course Name": "Schedule Title" on 2025-11-28`
- **How**:
  - Query database to get `course_title` from `tutor_course` table
  - Include course name and schedule info in the notification message
  - Send to all enrolled users via `notifyEnrolledUsers()`

### 2. Frontend Notification Display

#### Notification Manager (`js/notification.js`)
- **Added**: Console logging to debug notification rendering
- **Output**: Shows notification message, type, and unread status
- **Purpose**: Easy debugging to verify notification content

#### Notification Styles (`assets/css/notification.css`)
- Already has proper styling for:
  - Message display with icon (`notification-type-${type}::before`)
  - Unread highlighting with blue background
  - Type badge display
  - Time stamp display
  - Close button

## Example Notifications

### Material Added
```
📄 New material added to "Web Development Bootcamp": "Chapter 1 - Intro to HTML"
[material] 2 minutes ago [×]
```

### Schedule Created
```
📅 New schedule in "Web Development Bootcamp": "Lecture 1" on 2025-11-28
[schedule] 5 minutes ago [×]
```

## How to Test

1. **Add a material** to a Permission/Open course
   - Go to tutor's course page
   - Add new material to chapter
   - All enrolled students should see notification with course name

2. **Create a schedule**
   - Go to tutor's course page
   - Create new schedule
   - All enrolled students should see notification with course name

3. **View notifications**
   - Click the bell icon on header
   - Verify messages show course name clearly
   - Click notification to mark as read
   - Unread notifications highlighted in blue

## Files Modified

1. `backend/api.js` - Added course name to notifications (2 endpoints)
2. `js/notification.js` - Added console logging
3. `CRUD/crud_notification.js` - No changes (already functional)
4. `assets/css/notification.css` - No changes (already styled properly)

## Database Notes

The notification system uses the `notification` table:
- `notificationID` - Unique ID
- `userID` - Recipient user ID
- `tutor_courseID` - Course ID
- `notification_type` - 'material', 'schedule', 'announcement', 'forum'
- `message` - Full message text with course name
- `is_read` - 0 for unread, 1 for read
- `created_at` - Timestamp

The message is stored in full, so no need to reconstruct it on frontend.

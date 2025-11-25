# Forum System Implementation

## Overview
The forum system has been fully implemented with database storage for all conversations and tutor replies. Students can ask questions and tutors can respond - everything is saved in the database.

## Database Schema

### forum_thread (Questions)
- `forumID` - Auto-increment ID for each conversation
- `tutor_courseID` - Which course this thread belongs to
- `inner_body` - The student's question text
- `createDate` - When the question was asked

### forum_answer (Replies)
- `answerID` - Auto-increment ID for each reply
- `forumID` - Links to the question (forum_thread)
- `answer_body` - Tutor's reply text

## Files Created

### Backend
1. **CRUD/crud_forum.js** - Database operations
   - `getForumThreads(courseID)` - Get all questions for a course
   - `getForumThreadDetail(threadID)` - Get one question with all replies
   - `createForumThread(courseID, questionBody)` - Save new question
   - `addForumAnswer(threadID, answerBody)` - Save tutor reply
   - `deleteForumThread(threadID)` - Delete question and all replies
   - `deleteForumAnswer(answerID)` - Delete a single reply

2. **backend/api.js** - Added 5 new API routes:
   - `GET /course/:courseId/forum/threads` - Get all questions
   - `GET /course/:courseId/forum/threads/:threadId` - Get one question with replies
   - `POST /course/:courseId/forum/threads` - Create new question
   - `POST /course/:courseId/forum/threads/:threadId/reply` - Add tutor reply
   - `DELETE /course/:courseId/forum/threads/:threadId` - Delete question
   - `DELETE /course/:courseId/forum/answers/:answerId` - Delete reply

### Frontend - HTML Pages
1. **view/forum-list.html** - Shows all questions in a course (list view)
   - "Back to Course" button
   - "+ New Question" button to create new thread
   - Modal dialog for asking new questions
   - List of all questions with preview text

2. **view/forum-detail.html** - Shows one question with all replies (detail view)
   - Back button to return to list
   - Original question displayed
   - All tutor replies shown below
   - Tutor reply form (only visible to tutors)

### Frontend - JavaScript
1. **js/forum-list.js** - Handles forum list page
   - Load all questions from database
   - Display as clickable list items
   - Modal for creating new questions
   - Save new questions to database

2. **js/forum-detail.js** - Handles detail page
   - Load selected question and all replies from database
   - Display question with date
   - Display all tutor replies
   - Form for tutors to add replies (saves to database)
   - Delete functionality for tutors

### Frontend - CSS
1. **assets/css/forum-list.css** - Styling for list page
2. **assets/css/forum-detail.css** - Styling for detail page

## How It Works

### User Flow - Student

1. **Browse Forums**
   - Click "Forum" link on course page → Opens `forum-list.html`
   - See all questions that other students asked
   - Questions sorted by newest first

2. **Ask a Question**
   - Click "+ New Question" button
   - Modal appears with text area
   - Type question and click "Post Question"
   - Question is **saved to database** immediately
   - Page refreshes and shows new question in list

3. **View Replies**
   - Click on any question from the list
   - Redirected to `forum-detail.html`
   - See original question with date
   - See all tutor replies below
   - Can go back to list anytime

### User Flow - Tutor

1. **Monitor Forum**
   - Same list view as students
   - See all questions from all students

2. **Answer a Question**
   - Click on a question to view detail
   - Scroll to "Add Your Reply" section
   - Type reply and click "Post Reply"
   - Reply is **saved to database** immediately
   - Page refreshes showing new reply

3. **Delete (Admin)**
   - Delete button appears next to each reply
   - Can delete individual replies
   - Can delete entire questions

## Database Flow Diagram

```
forum-list.html
    ↓
(Click question)
    ↓
forum-detail.html
    ↓
GET /api/course/:courseId/forum/threads/:threadId
    ↓
crud_forum.js → getForumThreadDetail()
    ↓
Database: SELECT from forum_thread + forum_answer
    ↓
Display question and all replies

New Reply Flow:
forum-detail.html (User types reply)
    ↓
POST /api/course/:courseId/forum/threads/:threadId/reply
    ↓
crud_forum.js → addForumAnswer()
    ↓
Database: INSERT into forum_answer
    ↓
Page reloads to show new reply
```

## Data Storage Guarantee

✅ **All data is saved to database:**
- New questions → `INSERT` into `forum_thread` with course ID
- New replies → `INSERT` into `forum_answer` with thread ID
- Date timestamps → Auto-saved with CURRENT_TIMESTAMP
- Course ID → Ensures data is filtered by course

## Usage - Add to Course Pages

### From Student View
Add this link to enter-course-from-students.html:
```html
<a href="forum-list.html?courseId={{courseId}}">
    💬 View Forum
</a>
```

### From Tutor View
Add this link to enter-course-from-tutor.html:
```html
<a href="forum-list.html?courseId={{courseId}}">
    💬 Manage Forum
</a>
```

The `courseId` parameter is automatically passed through URL and used to:
- Load questions only for this course
- Save new questions to this course
- Filter all data correctly

## Testing Checklist

- [ ] Navigate to forum-list.html with courseId parameter
- [ ] See existing questions from database
- [ ] Click "+ New Question" button
- [ ] Submit a question - verify it saves and appears in list
- [ ] Click a question to view detail page
- [ ] See all replies for that question
- [ ] As tutor, add a reply - verify it saves
- [ ] Refresh page - verify question/replies still appear (saved in DB)
- [ ] Delete a reply - verify it's removed from DB
- [ ] Navigate between list and detail pages

## Notes

- Forum uses **async/await** for all database calls (like your course system)
- All HTML is **escaped** to prevent XSS attacks
- Timestamps are **automatically managed** by database
- **Course isolation** - students only see questions for their enrolled course
- **Tutor detection** - reply form only shows if user has tutor role

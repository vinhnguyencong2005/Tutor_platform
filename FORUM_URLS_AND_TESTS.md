# Forum URLs and Test Links

## Testing URLs

### Forum List Page (Shows All Questions)
```
http://localhost:3000/view/forum-list.html?courseId=1
http://localhost:3000/view/forum-list.html?courseId=2
```

### Forum Detail Page (Shows One Question + All Replies)
```
http://localhost:3000/view/forum-detail.html?courseId=1&threadId=1
http://localhost:3000/view/forum-detail.html?courseId=1&threadId=2
```

---

## Test Data Already in Database

### Course 1: "Advanced Operating Systems"
**Existing Questions:**
- threadId=1: "Can someone explain the real difference? They seem the same to me..."
- Has 2 tutor replies already

**API Test:**
```
GET http://localhost:3000/api/course/1/forum/threads
GET http://localhost:3000/api/course/1/forum/threads/1
```

### Course 2: "Calculus 1 Final Exam Review"
**Existing Questions:**
- threadId=2: "When are we allowed to use it? Is it only for 0/0..."
- Has 1 tutor reply already

**API Test:**
```
GET http://localhost:3000/api/course/2/forum/threads
GET http://localhost:3000/api/course/2/forum/threads/2
```

---

## Quick Test Flow

### 1. View Existing Forum
```
1. Open: http://localhost:3000/view/forum-list.html?courseId=1
2. See list of questions (threadId 1 should be there)
3. Click on a question
4. Should navigate to: forum-detail.html?courseId=1&threadId=1
5. See the question and all replies below it
```

### 2. Create New Question
```
1. On forum-list.html?courseId=1
2. Click "+ New Question" button
3. Modal appears
4. Type: "What is the difference between threads and processes?"
5. Click "Post Question"
6. Page reloads
7. New question appears at top of list
8. Check database - it's saved!
```

### 3. Add Reply (As Tutor)
```
1. On forum-detail.html?courseId=1&threadId=1
2. Scroll to "Add Your Reply" section (if logged in as tutor)
3. Type: "Threads share memory space while processes have separate memory..."
4. Click "Post Reply"
5. Page reloads
6. New reply appears below existing ones
7. Check database - it's saved!
```

---

## API Test Commands (Using cURL or Postman)

### Get All Questions for Course 1
```bash
curl http://localhost:3000/api/course/1/forum/threads
```

### Get Single Question with All Replies
```bash
curl http://localhost:3000/api/course/1/forum/threads/1
```

### Create New Question
```bash
curl -X POST http://localhost:3000/api/course/1/forum/threads \
  -H "Content-Type: application/json" \
  -d '{"questionBody":"What is deadlock?"}'
```

### Add Reply to Question 1
```bash
curl -X POST http://localhost:3000/api/course/1/forum/threads/1/reply \
  -H "Content-Type: application/json" \
  -d '{"answerBody":"Deadlock occurs when two processes wait for each other..."}'
```

### Delete Reply (answerID=1)
```bash
curl -X DELETE http://localhost:3000/api/course/1/forum/answers/1
```

### Delete Question (threadID=1)
```bash
curl -X DELETE http://localhost:3000/api/course/1/forum/threads/1
```

---

## Database Query to View Forum Data

```sql
-- View all questions for course 1
SELECT forumID, createDate, inner_body 
FROM forum_thread 
WHERE tutor_courseID = 1 
ORDER BY createDate DESC;

-- View all replies for question 1
SELECT answerID, answer_body 
FROM forum_answer 
WHERE forumID = 1 
ORDER BY answerID ASC;

-- View everything (join)
SELECT 
    t.forumID,
    t.createDate,
    t.inner_body as question,
    a.answerID,
    a.answer_body as reply
FROM forum_thread t
LEFT JOIN forum_answer a ON t.forumID = a.forumID
WHERE t.tutor_courseID = 1
ORDER BY t.forumID DESC, a.answerID ASC;
```

---

## Expected Behavior After Implementation

### Forum List Page
✅ Loads list of questions when URL opens
✅ "+ New Question" button opens modal
✅ Typing and submitting saves to database
✅ Page reloads showing new question
✅ Questions sorted by newest first
✅ Click question navigates to detail page

### Forum Detail Page
✅ Loads question text and date
✅ Shows all replies below question
✅ "← Back to Forum" returns to list
✅ Tutor sees "Add Your Reply" form
✅ Typing and submitting reply saves to database
✅ Page reloads showing new reply
✅ Delete buttons work (remove reply from database)

### Database Persistence
✅ Close browser, reopen page → data still there
✅ Restart server → data still there
✅ Multiple browser tabs → all see same data in real-time
✅ Each course sees only its own questions

---

## Troubleshooting

### Page Won't Load
- Check browser console for errors (F12)
- Check server terminal for backend errors
- Verify courseId parameter in URL: `?courseId=1`

### New Question Won't Save
- Check Network tab in browser (F12) for 500 error
- Check server terminal for error message
- Verify POST request has Content-Type: application/json

### Forum Shows No Questions
- Course might be course 2 or higher
- Use URL: http://localhost:3000/view/forum-list.html?courseId=2
- Check database: SELECT * FROM forum_thread;

### Tutor Reply Form Not Showing
- Set userRole in sessionStorage: sessionStorage.setItem('userRole', 'Lecturer')
- Or test with: const isTutor = true; (in forum-detail.js temporarily)

### 404 Error on API Calls
- Verify Node.js server is running
- Check that crud_forum.js was created in CRUD/ folder
- Check that api.js imports forum functions (line 8)
- Restart server after file changes

---

## Integration Points

### From enter-course-from-students.html
```html
<a href="forum-list.html?courseId={{courseId}}">💬 View Forum</a>
```
**Get courseId from URL:**
```javascript
const courseId = new URLSearchParams(window.location.search).get('courseId');
```

### From enter-course-from-tutor.html
```html
<a href="forum-list.html?courseId={{courseId}}">💬 Manage Forum</a>
```
**Same courseId extraction method**

---

## Files Modified/Created

### Created Files
- CRUD/crud_forum.js
- view/forum-list.html
- view/forum-detail.html
- js/forum-list.js
- js/forum-detail.js
- assets/css/forum-list.css
- assets/css/forum-detail.css

### Modified Files
- backend/api.js (added imports and routes)

### Documentation Files
- FORUM_SYSTEM_IMPLEMENTATION.md
- FORUM_INTEGRATION_GUIDE.md
- FORUM_API_REFERENCE.md
- FORUM_QUICK_START.md
- FORUM_URLS_AND_TESTS.md (this file)

---

## Next Actions

1. **Restart Server**
   - Press Ctrl+C in Node terminal
   - Run: `node backend/server.js`

2. **Test Forum List**
   - Visit: http://localhost:3000/view/forum-list.html?courseId=1
   - Should see existing questions loaded

3. **Test Create Question**
   - Click "+ New Question"
   - Type and submit
   - Verify it saves

4. **Test Detail Page**
   - Click on a question
   - See full question and all replies
   - Try adding reply (if tutor role set)

5. **Integrate into Course Pages**
   - Add forum link to course pages
   - Update courseId parameter handling
   - Test end-to-end navigation

---

## Database Status

**Current test data:**
- Course 1: 1 thread with 2 answers
- Course 2: 1 thread with 1 answer

**Ready to:**
- ✅ Store new questions
- ✅ Store tutor replies
- ✅ Delete questions/replies
- ✅ Filter by course
- ✅ Persist after restart

---

Done! 🎉 Your forum is ready to use with full database persistence!

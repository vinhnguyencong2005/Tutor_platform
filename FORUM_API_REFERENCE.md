# Forum API Reference

## Base URL
```
http://localhost:3000/api
```

## Endpoints

### 1. Get All Forum Threads (Questions)
```
GET /course/:courseId/forum/threads
```

**Response:**
```json
{
    "success": true,
    "threads": [
        {
            "forumID": 1,
            "createDate": "2025-11-25T10:30:00.000Z",
            "inner_body": "Can someone explain semaphore vs mutex?"
        },
        {
            "forumID": 2,
            "createDate": "2025-11-24T14:20:00.000Z",
            "inner_body": "When are we allowed to use L'Hôpital's rule?"
        }
    ]
}
```

**Used by:** `forum-list.js` → `loadForumThreads()`

---

### 2. Get Single Thread with All Replies
```
GET /course/:courseId/forum/threads/:threadId
```

**Response:**
```json
{
    "success": true,
    "data": {
        "thread": {
            "forumID": 1,
            "createDate": "2025-11-25T10:30:00.000Z",
            "inner_body": "Can someone explain semaphore vs mutex?",
            "tutor_courseID": 1
        },
        "answers": [
            {
                "answerID": 1,
                "answer_body": "A semaphore is a signaling mechanism, while a mutex is an exclusion mechanism."
            },
            {
                "answerID": 2,
                "answer_body": "Think of it this way: a mutex is a key to a room (only one person can have it)."
            }
        ]
    }
}
```

**Used by:** `forum-detail.js` → `loadThreadDetail()`

---

### 3. Create New Forum Thread (Ask Question)
```
POST /course/:courseId/forum/threads

Headers:
    Content-Type: application/json

Body:
{
    "questionBody": "Can someone explain the difference between semaphore and mutex?"
}
```

**Response:**
```json
{
    "success": true,
    "threadId": 5,
    "message": "Forum thread created successfully"
}
```

**Database:** Saves to `forum_thread` table
- auto-inserts timestamp with CURRENT_TIMESTAMP
- stores courseId for filtering
- returns new forumID

**Used by:** `forum-list.js` → `submitNewThread()`

---

### 4. Add Reply to Thread (Tutor Answer)
```
POST /course/:courseId/forum/threads/:threadId/reply

Headers:
    Content-Type: application/json

Body:
{
    "answerBody": "A semaphore is a signaling mechanism, while a mutex is an exclusion mechanism."
}
```

**Response:**
```json
{
    "success": true,
    "answerId": 12,
    "message": "Reply added successfully"
}
```

**Database:** Saves to `forum_answer` table
- links to forumID (threadId)
- stores reply text
- returns new answerID

**Used by:** `forum-detail.js` → `submitReply()`

---

### 5. Delete Forum Thread
```
DELETE /course/:courseId/forum/threads/:threadId
```

**Response:**
```json
{
    "success": true,
    "message": "Forum thread deleted successfully"
}
```

**Database:** 
- First deletes all `forum_answer` records with this forumID
- Then deletes the `forum_thread` record
- Cascade delete prevents orphaned replies

**Used by:** Tutor admin function

---

### 6. Delete Forum Reply
```
DELETE /course/:courseId/forum/answers/:answerId
```

**Response:**
```json
{
    "success": true,
    "message": "Forum answer deleted successfully"
}
```

**Database:** Deletes specific `forum_answer` record by answerID

**Used by:** `forum-detail.js` → `deleteAnswer()`

---

## Error Responses

### Missing Required Fields
```json
{
    "success": false,
    "message": "Question body is required"
}
```

### Database Error
```json
{
    "success": false,
    "error": "Error message from database"
}
```

### Thread Not Found
```json
{
    "success": false,
    "error": "Thread not found"
}
```

---

## JavaScript Usage Examples

### Load All Threads
```javascript
const response = await fetch(`/api/course/1/forum/threads`);
const data = await response.json();
console.log(data.threads); // Array of threads
```

### Create New Thread
```javascript
const response = await fetch(`/api/course/1/forum/threads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
        questionBody: "What is this concept?" 
    })
});
const data = await response.json();
console.log(data.threadId); // New thread ID
```

### Load Thread with Replies
```javascript
const response = await fetch(`/api/course/1/forum/threads/5`);
const data = await response.json();
console.log(data.data.thread);    // Original question
console.log(data.data.answers);   // All replies
```

### Add Reply
```javascript
const response = await fetch(`/api/course/1/forum/threads/5/reply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
        answerBody: "This is the tutor's answer..." 
    })
});
const data = await response.json();
console.log(data.answerId); // New reply ID
```

### Delete Reply
```javascript
const response = await fetch(`/api/course/1/forum/answers/12`, {
    method: 'DELETE'
});
const data = await response.json();
console.log(data.message); // "Forum answer deleted successfully"
```

---

## Data Flow Summary

```
Forum List Page (forum-list.html)
    ↓ GET /course/1/forum/threads
    ↓ [CRUD] getForumThreads(1)
    ↓ SELECT from forum_thread WHERE tutor_courseID = 1
    ↓ Display all questions

Click Question
    ↓ 
Forum Detail Page (forum-detail.html?threadId=5)
    ↓ GET /course/1/forum/threads/5
    ↓ [CRUD] getForumThreadDetail(5)
    ↓ SELECT from forum_thread & forum_answer
    ↓ Display question + all replies

Tutor Types Reply
    ↓ POST /course/1/forum/threads/5/reply
    ↓ [CRUD] addForumAnswer(5, "text")
    ↓ INSERT into forum_answer
    ↓ Reload page, show new reply
```

---

## Testing with cURL

### Get all threads for course 1
```bash
curl http://localhost:3000/api/course/1/forum/threads
```

### Get thread 1 with replies
```bash
curl http://localhost:3000/api/course/1/forum/threads/1
```

### Create new thread
```bash
curl -X POST http://localhost:3000/api/course/1/forum/threads \
  -H "Content-Type: application/json" \
  -d '{"questionBody":"Test question?"}'
```

### Add reply
```bash
curl -X POST http://localhost:3000/api/course/1/forum/threads/1/reply \
  -H "Content-Type: application/json" \
  -d '{"answerBody":"Test answer"}'
```

### Delete reply
```bash
curl -X DELETE http://localhost:3000/api/course/1/forum/answers/1
```

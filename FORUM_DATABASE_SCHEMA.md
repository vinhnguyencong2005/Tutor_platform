# Forum Database Schema - Complete Reference

## Current Tables in tutor_db

### forum_thread (Questions Table)
Stores all student questions/conversations

```sql
CREATE TABLE forum_thread (
    forumID INT AUTO_INCREMENT PRIMARY KEY,
    createDate DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    tutor_courseID INT NOT NULL,
    inner_body VARCHAR(2000),
    FOREIGN KEY (tutor_courseID) REFERENCES tutor_course(tutor_courseID)
);
```

**Columns:**
| Column | Type | Description |
|--------|------|-------------|
| forumID | INT | Unique ID for each question (auto-increment) |
| createDate | DATETIME | When question was posted (auto-timestamp) |
| tutor_courseID | INT | Which course this question belongs to |
| inner_body | VARCHAR(2000) | The question text |

**Current Data:**
```sql
INSERT INTO forum_thread (tutor_courseID, inner_body) VALUES
(1, 'Can someone explain the real difference? They seem the same to me. When do I use one over the other?'),
(2, 'When are we allowed to use it? Is it only for 0/0 or also for infinity/infinity?');
```

---

### forum_answer (Replies Table)
Stores all tutor replies to questions

```sql
CREATE TABLE forum_answer (
    forumID INT NOT NULL,
    answerID INT AUTO_INCREMENT PRIMARY KEY,
    answer_body VARCHAR(2000),
    FOREIGN KEY (forumID) REFERENCES forum_thread(forumID)
);
```

**Columns:**
| Column | Type | Description |
|--------|------|-------------|
| answerID | INT | Unique ID for each reply (auto-increment) |
| forumID | INT | Which question this reply belongs to |
| answer_body | VARCHAR(2000) | The reply text |

**Current Data:**
```sql
INSERT INTO forum_answer (forumID, answer_body) VALUES
(1, 'A semaphore is a signaling mechanism, while a mutex is an exclusion mechanism. A mutex is typically used to protect a shared resource from concurrent access.'),
(1, 'Think of it this way: a mutex is a key to a room (only one person can have it). A semaphore is a count of available permits (e.g., 5 permits for 5 empty chairs).'),
(2, 'It works for both 0/0 and infinity/infinity indeterminate forms!');
```

---

## Entity Relationship Diagram

```
tutor_course (Parent)
    │
    ├─ One course
    │
    └─→ many forum_thread (Questions)
            │
            ├─ forumID: 1
            │ inner_body: "Question text..."
            │
            └─→ many forum_answer (Replies)
                    │
                    ├─ answerID: 1
                    │ answer_body: "Reply text..."
                    │
                    └─ answerID: 2
                      answer_body: "Another reply..."
```

---

## Relationships

### One-to-Many: tutor_course → forum_thread
```sql
FOREIGN KEY (tutor_courseID) REFERENCES tutor_course(tutor_courseID)
```
- Each course can have MANY questions
- Each question belongs to ONE course
- Course ID filters forum to show only its questions

### One-to-Many: forum_thread → forum_answer
```sql
FOREIGN KEY (forumID) REFERENCES forum_thread(forumID)
```
- Each question can have MANY replies
- Each reply belongs to ONE question
- Delete question → Automatically delete all replies (cascade)

---

## Query Examples

### Get All Questions for a Course
```sql
SELECT forumID, createDate, inner_body 
FROM forum_thread 
WHERE tutor_courseID = 1 
ORDER BY createDate DESC;
```

**Result:**
| forumID | createDate | inner_body |
|---------|------------|-----------|
| 1 | 2025-11-25 10:30:00 | Can someone explain the real difference?... |

### Get All Replies for a Question
```sql
SELECT answerID, answer_body 
FROM forum_answer 
WHERE forumID = 1 
ORDER BY answerID ASC;
```

**Result:**
| answerID | answer_body |
|----------|------------|
| 1 | A semaphore is a signaling mechanism... |
| 2 | Think of it this way: a mutex is a key... |

### Get Question with All Replies (Join)
```sql
SELECT 
    t.forumID,
    t.createDate,
    t.inner_body as question,
    a.answerID,
    a.answer_body as reply
FROM forum_thread t
LEFT JOIN forum_answer a ON t.forumID = a.forumID
WHERE t.forumID = 1
ORDER BY a.answerID ASC;
```

**Result:**
| forumID | createDate | question | answerID | reply |
|---------|------------|----------|----------|-------|
| 1 | 2025-11-25 10:30:00 | Can someone explain... | 1 | A semaphore is... |
| 1 | 2025-11-25 10:30:00 | Can someone explain... | 2 | Think of it this way... |

### Get Course with Question Count
```sql
SELECT 
    c.course_title,
    COUNT(DISTINCT f.forumID) as question_count,
    COUNT(a.answerID) as total_replies
FROM tutor_course c
LEFT JOIN forum_thread f ON c.tutor_courseID = f.tutor_courseID
LEFT JOIN forum_answer a ON f.forumID = a.forumID
GROUP BY c.tutor_courseID;
```

**Result:**
| course_title | question_count | total_replies |
|--------------|----------------|---------------|
| Advanced Operating Systems | 1 | 2 |
| Calculus 1 Final Exam Review | 1 | 1 |

---

## How CRUD Functions Use Tables

### getForumThreads(courseID)
```sql
SELECT forumID, createDate, inner_body 
FROM forum_thread 
WHERE tutor_courseID = ? 
ORDER BY createDate DESC
```
- Reads from `forum_thread`
- Filters by course
- Returns list for forum-list.html

### getForumThreadDetail(threadID)
```sql
SELECT forumID, createDate, inner_body, tutor_courseID 
FROM forum_thread 
WHERE forumID = ?

SELECT answerID, answer_body 
FROM forum_answer 
WHERE forumID = ? 
ORDER BY answerID ASC
```
- Reads from both tables
- Returns question + all replies
- Used by forum-detail.html

### createForumThread(courseID, questionBody)
```sql
INSERT INTO forum_thread (tutor_courseID, inner_body, createDate) 
VALUES (?, ?, NOW())
```
- Writes to `forum_thread`
- Auto-timestamp with NOW()
- Returns new forumID

### addForumAnswer(threadID, answerBody)
```sql
INSERT INTO forum_answer (forumID, answer_body) 
VALUES (?, ?)
```
- Writes to `forum_answer`
- Links to question via forumID
- Returns new answerID

### deleteForumThread(threadID)
```sql
DELETE FROM forum_answer WHERE forumID = ?
DELETE FROM forum_thread WHERE forumID = ?
```
- Deletes all replies first (cascade)
- Then deletes the question

### deleteForumAnswer(answerID)
```sql
DELETE FROM forum_answer WHERE answerID = ?
```
- Deletes single reply only

---

## Data Types

| Type | Size | Use |
|------|------|-----|
| INT | 4 bytes | IDs (forumID, answerID, tutor_courseID) |
| VARCHAR(2000) | 2000 bytes max | Question/answer text |
| DATETIME | 8 bytes | Timestamps |
| AUTO_INCREMENT | - | Auto-generate sequential IDs |

---

## Indexes (Automatic)

| Table | Index | Purpose |
|-------|-------|---------|
| forum_thread | PRIMARY KEY (forumID) | Fast lookup by question ID |
| forum_thread | FOREIGN KEY (tutor_courseID) | Fast lookup by course |
| forum_answer | PRIMARY KEY (answerID) | Fast lookup by reply ID |
| forum_answer | FOREIGN KEY (forumID) | Fast lookup by question |

---

## Cascade Delete Example

### Before Delete:
```
tutor_course (courseID=1)
    └─ forum_thread (forumID=1)
        ├─ forum_answer (answerID=1)
        └─ forum_answer (answerID=2)
```

### Delete Question 1:
```sql
DELETE FROM forum_thread WHERE forumID = 1
```

### After Delete (Cascade):
```
tutor_course (courseID=1)  -- Unaffected
    └─ [No forum_thread] -- Deleted
        ├─ [No forum_answer] -- Auto-deleted by cascade
        └─ [No forum_answer] -- Auto-deleted by cascade
```

The FOREIGN KEY with implicit cascade deletes all replies when question is deleted.

---

## Storage Size Estimation

**Per Question:**
- forumID: 4 bytes
- createDate: 8 bytes
- tutor_courseID: 4 bytes
- inner_body (avg 500 chars): 500 bytes
- **Total per question: ~516 bytes**

**Per Reply:**
- answerID: 4 bytes
- forumID: 4 bytes
- answer_body (avg 300 chars): 300 bytes
- **Total per reply: ~308 bytes**

**Example (1000 questions, 3 replies each):**
- Questions: 1000 × 516 bytes = 516 KB
- Replies: 3000 × 308 bytes = 924 KB
- **Total: ~1.4 MB**

→ Very efficient! Could store millions of conversations.

---

## Data Integrity Constraints

```sql
PRIMARY KEY (forumID)          -- Each question has unique ID
PRIMARY KEY (answerID)         -- Each reply has unique ID
FOREIGN KEY (tutor_courseID)   -- Question must belong to valid course
FOREIGN KEY (forumID)          -- Reply must belong to valid question
DEFAULT CURRENT_TIMESTAMP      -- Date auto-filled if not provided
AUTO_INCREMENT                 -- IDs auto-generated, no duplicates
```

---

## Backup/Restore

### Backup forum tables only:
```bash
mysqldump tutor_db forum_thread forum_answer > forum_backup.sql
```

### Restore:
```bash
mysql tutor_db < forum_backup.sql
```

---

## Summary

✅ **forum_thread** - Stores questions (students ask)
✅ **forum_answer** - Stores replies (tutors answer)
✅ **Relationships** - One question → many replies
✅ **Course Isolation** - Questions grouped by course
✅ **Cascade Delete** - Delete question → auto-delete replies
✅ **Timestamps** - Auto-managed by database
✅ **Efficient Storage** - ~500 bytes per question, ~300 bytes per reply
✅ **Data Integrity** - Foreign keys prevent orphaned data

Ready to store unlimited conversations! 🚀

# How to Add Forum Link to Course Pages

## For Student Course View
**File:** `view/enter-course-from-students.html`

Add this button/link in the navigation area (near the course title):

```html
<!-- Add after the course title section -->
<div class="course-navigation">
    <a href="course-detail.html?courseId={{courseId}}" class="nav-link">📚 Course Material</a>
    <a href="forum-list.html?courseId={{courseId}}" class="nav-link">💬 Forum</a>
    <a href="make-schedule.html?courseId={{courseId}}" class="nav-link">📅 Schedule</a>
</div>
```

Or add a button in the main navigation area:
```html
<button class="btn-forum" onclick="goToForum()">💬 Forum Discussions</button>
```

And add this JavaScript:
```javascript
function goToForum() {
    const courseId = new URLSearchParams(window.location.search).get('courseId');
    window.location.href = `forum-list.html?courseId=${courseId}`;
}
```

---

## For Tutor Course View
**File:** `view/enter-course-from-tutor.html`

Add similar navigation:

```html
<!-- Add after the course title section -->
<div class="tutor-navigation">
    <a href="course-detail.html?courseId={{courseId}}" class="nav-link">📚 Course Material</a>
    <a href="forum-list.html?courseId={{courseId}}" class="nav-link">💬 Manage Forum</a>
    <a href="make-schedule.html?courseId={{courseId}}" class="nav-link">📅 Schedule</a>
</div>
```

Or add a button:
```html
<button class="btn-forum" onclick="goToForum()">💬 Forum Discussions</button>
```

Add this JavaScript in `js/enter-course-from-tutor.js`:
```javascript
function goToForum() {
    const courseId = new URLSearchParams(window.location.search).get('courseId');
    window.location.href = `forum-list.html?courseId=${courseId}`;
}
```

---

## CSS Styling for Forum Button

Add this to your stylesheet if not already present:

```css
.btn-forum {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    margin: 10px;
}

.btn-forum:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.course-navigation, .tutor-navigation {
    display: flex;
    gap: 20px;
    margin: 20px 0;
    flex-wrap: wrap;
}

.nav-link {
    padding: 10px 20px;
    background: white;
    border: 2px solid #667eea;
    color: #667eea;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 600;
    transition: all 0.3s ease;
}

.nav-link:hover {
    background: #667eea;
    color: white;
}
```

---

## How to Get CourseID in JavaScript

The courseId is passed through URL parameters. Extract it like this:

```javascript
// At the top of your JavaScript file
const params = new URLSearchParams(window.location.search);
const courseId = params.get('courseId');

// Now use it
function goToForum() {
    window.location.href = `forum-list.html?courseId=${courseId}`;
}
```

---

## Example Full Integration in enter-course-from-students.html

```html
<!DOCTYPE html>
<html>
<head>
    <title>Course Detail</title>
    <link rel="stylesheet" href="../assets/css/course-detail.css">
</head>
<body>
    <div class="container">
        <header>
            <h1 id="courseTitle">Course Name</h1>
            <!-- NEW: Course Navigation -->
            <div class="course-navigation">
                <button class="nav-btn" onclick="goToCourseDetail()">📚 Material</button>
                <button class="nav-btn" onclick="goToForum()">💬 Forum</button>
                <button class="nav-btn" onclick="goToSchedule()">📅 Schedule</button>
            </div>
        </header>

        <main>
            <!-- Rest of your course content -->
        </main>
    </div>

    <script src="../js/enter-course-from-students.js"></script>
    <script>
        // Get courseId from URL
        const courseId = new URLSearchParams(window.location.search).get('courseId');

        function goToForum() {
            window.location.href = `forum-list.html?courseId=${courseId}`;
        }

        function goToCourseDetail() {
            window.location.href = `course-detail.html?courseId=${courseId}`;
        }

        function goToSchedule() {
            window.location.href = `make-schedule.html?courseId=${courseId}`;
        }
    </script>
</body>
</html>
```

---

## Testing After Integration

1. **From Student Course Page:**
   - Click "Forum" or "💬 Forum" button
   - Should navigate to `forum-list.html?courseId=X`
   - Should see all questions for this course

2. **Ask a Question:**
   - Click "+ New Question"
   - Type and submit
   - Question appears in list and saves to database
   - Close browser and reopen - data persists

3. **Reply as Tutor:**
   - Click on a question
   - Type reply in "Add Your Reply" section
   - Click "Post Reply"
   - Reply appears and saves to database

4. **Back Navigation:**
   - "← Back to Course" button returns to previous page
   - "← Back to Forum" returns from detail to list

---

## Quick Link Template

Copy this template for your navigation bar:

```html
<nav class="course-nav">
    <ul>
        <li><a href="course-detail.html?courseId={{courseId}}">📚 Materials</a></li>
        <li><a href="forum-list.html?courseId={{courseId}}">💬 Forum</a></li>
        <li><a href="make-schedule.html?courseId={{courseId}}">📅 Schedule</a></li>
        <li><a href="my-managed-courses.html">My Courses</a></li>
    </ul>
</nav>
```

And CSS:
```css
.course-nav ul {
    display: flex;
    list-style: none;
    gap: 20px;
    margin: 0;
    padding: 0;
}

.course-nav a {
    text-decoration: none;
    padding: 8px 16px;
    border-radius: 4px;
    transition: all 0.3s;
}

.course-nav a:hover {
    background: rgba(102, 126, 234, 0.1);
}
```

That's it! Your forum is ready to use! 🚀

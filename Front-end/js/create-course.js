document.getElementById('courseForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('courseName').value,
        introduction: document.getElementById('introduction').value,
        learningObjectives: document.getElementById('learningObjectives').value,
        description: document.getElementById('description').value,
        accessRights: document.getElementById('accessRights').value,
        status: document.getElementById('status').value
    };
    
    console.log('Course Data:', formData);
    alert('Course saved successfully!');
});
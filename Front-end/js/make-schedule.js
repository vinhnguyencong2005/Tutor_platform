document.getElementById('scheduleForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                courseName: document.getElementById('courseName').value,
                title: document.getElementById('title').value,
                description: document.getElementById('description').value,
                startDate: document.getElementById('startDate').value,
                startTime: document.getElementById('startTime').value,
                endDate: document.getElementById('endDate').value,
                endTime: document.getElementById('endTime').value,
                urlLocation: document.getElementById('urlLocation').value
            };
            
            console.log('Form Data:', formData);
            alert('Schedule saved successfully!');
            
            // Reset form if needed
            // this.reset();
        });
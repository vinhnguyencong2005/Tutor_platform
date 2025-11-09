// ===== Load user info =====
    window.onload = function() {
      const userData = JSON.parse(localStorage.getItem('userData'));
      if (userData) {
        document.getElementById('name').value = userData.name || '';
        document.getElementById('email').value = userData.email || '';
      }
    };

    // ===== Enable/Disable edit mode =====
    const editBtn = document.getElementById('edit-btn');
    const saveBtn = document.getElementById('save-btn');
    const inputs = document.querySelectorAll('.profile-fields input, #about');

    editBtn.addEventListener('click', () => {
      inputs.forEach(i => i.disabled = false);
      saveBtn.disabled = false;
      editBtn.style.display = 'none';
    });

    saveBtn.addEventListener('click', () => {
      inputs.forEach(i => i.disabled = true);
      saveBtn.disabled = true;
      editBtn.style.display = 'inline-block';
      alert('Profile saved successfully!');
    });
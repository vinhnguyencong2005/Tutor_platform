//  let sectionCounter = 0;
//         let lectureCounters = {};

//         function addSection() {
//             sectionCounter++;
//             const sectionId = `section${sectionCounter}`;
//             lectureCounters[sectionId] = 0;

//             const accordion = document.getElementById('courseAccordion');
//             const sectionHTML = `
//                 <div class="accordion-item" id="item-${sectionId}">
//                     <h2 class="accordion-header">
//                         <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${sectionId}">
//                             <span id="title-${sectionId}">Section ${sectionCounter}</span>
//                         </button>
//                         <button class="add-lecture-btn" onclick="addLecture('${sectionId}')">
//                             <i class="fas fa-plus"></i> Lecture
//                         </button>
//                     </h2>
//                     <div id="${sectionId}" class="accordion-collapse collapse" data-bs-parent="#courseAccordion">
//                         <div class="accordion-body" id="body-${sectionId}">
//                             <p class="text-muted">There are no lectures yet. Click "Lecture" to add one.</p>
//                         </div>
//                     </div>
//                 </div>
//             `;
            
//             accordion.insertAdjacentHTML('beforeend', sectionHTML);
            
//             // Auto edit title
//             setTimeout(() => editSection(sectionId), 100);
//         }

//         function editSection(sectionId) {
//             const titleElement = document.getElementById(`title-${sectionId}`);
//             const currentText = titleElement.textContent;
            
//             const input = document.createElement('input');
//             input.type = 'text';
//             input.value = currentText;
//             input.className = 'editable-input';
            
//             titleElement.replaceWith(input);
//             input.focus();
//             input.select();
            
//             function saveEdit() {
//                 const newTitle = input.value.trim() || currentText;
//                 const span = document.createElement('span');
//                 span.id = `title-${sectionId}`;
//                 span.textContent = newTitle;
//                 input.replaceWith(span);
//             }
            
//             input.onblur = saveEdit;
//             input.onkeypress = (e) => {
//                 if (e.key === 'Enter') {
//                     saveEdit();
//                 }
//             };
//         }

//         function deleteSection(sectionId) {
//             if (confirm('Are you sure you want to delete this section?')) {
//                 document.getElementById(`item-${sectionId}`).remove();
//             }
//         }

//         function addLecture(sectionId) {
//             lectureCounters[sectionId]++;
//             const lectureId = `lecture-${sectionId}-${lectureCounters[sectionId]}`;
//             const body = document.getElementById(`body-${sectionId}`);
            
//             // Remove empty message if exists
//             const emptyMsg = body.querySelector('.text-muted');
//             if (emptyMsg) emptyMsg.remove();
            
//             const lectureHTML = `
//                 <div class="lecture" id="${lectureId}">
//                     <span class="lecture-text" id="text-${lectureId}">Lecture ${lectureCounters[sectionId]}</span>
//                     <div class="lecture-actions">
//                         <button class="btn btn-sm btn-warning btn-action" onclick="editLecture('${lectureId}')">
//                             <i class="fas fa-edit"></i>
//                         </button>
//                         <button class="btn btn-sm btn-danger btn-action" onclick="deleteLecture('${lectureId}')">
//                             <i class="fas fa-trash"></i>
//                         </button>
//                     </div>
//                 </div>
//             `;
            
//             body.insertAdjacentHTML('beforeend', lectureHTML);
            
//             // Auto edit title
//             setTimeout(() => editLecture(lectureId), 100);
//         }

//         function editLecture(lectureId) {
//             const textElement = document.getElementById(`text-${lectureId}`);
//             const currentText = textElement.textContent;
            
//             const input = document.createElement('input');
//             input.type = 'text';
//             input.value = currentText;
//             input.className = 'editable-input';
//             input.style.width = '100%';
            
//             textElement.replaceWith(input);
//             input.focus();
//             input.select();
            
//             function saveEdit() {
//                 const newText = input.value.trim() || currentText;
//                 const span = document.createElement('span');
//                 span.className = 'lecture-text';
//                 span.id = `text-${lectureId}`;
//                 span.textContent = newText;
//                 input.replaceWith(span);
//             }
            
//             input.onblur = saveEdit;
//             input.onkeypress = (e) => {
//                 if (e.key === 'Enter') {
//                     saveEdit();
//                 }
//             };
//         }

//         function deleteLecture(lectureId) {
//             if (confirm('Are you sure you want to delete this lecture?')) {
//                 document.getElementById(lectureId).remove();
//             }
//         }

//         // Initialize with one example section
//         // window.onload = () => {
//         //     addSection();
//         // };



let sectionCounter = 0;
let currentSectionId = null;


let lectureCounters = {};

    // <div class="section-item accordion-item" id="${sectionId}">
    //     <h2 class="section-title accordion-header">
    //         <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#section2">
    //             <span id="title-${sectionId}">Front-End Web Development</span>
    //             <button class="btn-edit" onclick="event.stopPropagation(); editSectionTitle('${sectionId}')">✏️</button>
    //         </button>
    //         <button class="btn-add-section" onclick="event.stopPropagation(); addLecture('${sectionId}')">+</button>
    //     </h2>
    //     <div class="accordion-collapse collapse" data-bs-parent="#courseAccordion">
    //         <div class="section-content accordion-body" id="content-${sectionId}">
    //             <div class="lecture">Lecture 1: What is HTML?</div>
    //             <div class="lecture">Lecture 2: Basic Tags</div>
    //             <div class="lecture">Lecture 3: Links and Images</div>
    //         </div>
    //     </div>
    // </div>

function addSection() {
    sectionCounter++;
    const sectionId = `section${sectionCounter}`;
    const container = document.getElementById('sectionsContainer');
    
    const sectionHTML = `
        <div class="section-item" id="${sectionId}">
            <div class="section-header" onclick="toggleSection('${sectionId}')">
                <div class="section-title">
                    <span class="toggle-icon" id="icon-${sectionId}">▼</span>
                    <span id="title-${sectionId}">Front-End Web Development</span>
                    <button class="btn-edit" onclick="event.stopPropagation(); editSectionTitle('${sectionId}')">✏️</button>
                </div>
                <button class="btn-add-section" onclick="event.stopPropagation(); addLecture('${sectionId}')">+</button>
            </div>
            <div class="section-content active" id="content-${sectionId}"></div>
        </div>

    `;
    
    container.insertAdjacentHTML('beforeend', sectionHTML);
    addLecture(sectionId);
    setTimeout(() => editSectionTitle(sectionId), 100);
}

function editSectionTitle(sectionId) {
    const titleElement = document.getElementById(`title-${sectionId}`);
    const currentText = titleElement.textContent;
    
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    input.className = 'editable-title';
    
    titleElement.replaceWith(input);
    input.focus();
    input.select();
    
    function saveEdit() {
        const newTitle = input.value.trim() || currentText;
        const span = document.createElement('span');
        span.id = `title-${sectionId}`;
        span.textContent = newTitle;
        input.replaceWith(span);
    }
    
    input.onblur = saveEdit;
    input.onkeypress = (e) => {
        if (e.key === 'Enter') {
            saveEdit();
        }
    };
}

function toggleSection(sectionId) {
    const content = document.getElementById(`content-${sectionId}`);
    const icon = document.getElementById(`icon-${sectionId}`);
    
    if (content.classList.contains('active')) {
        content.classList.remove('active');
        icon.textContent = '▼';
    } else {
        content.classList.add('active');
        icon.textContent = '▼';
    }
}




function addLecture(sectionId) {
    if (!lectureCounters[sectionId]) {
        lectureCounters[sectionId] = 0;
    }

    lectureCounters[sectionId]++;
    const lectureId = `${sectionId}-${lectureCounters[sectionId]}`;
    const body = document.getElementById(`content-${sectionId}`);
    
    // Remove empty message if exists
    const emptyMsg = body.querySelector('.text-muted');
    if (emptyMsg) emptyMsg.remove();
    const lectureHTML = `
        <div class="lecture active" id="${lectureId}">
            <div class="choose-file-item">
                <button class="btn-remove" onclick="openLinkModal('${sectionId}')">📎</button>
                <span id="text-${lectureId}">Lecture ${lectureCounters[sectionId]}</span>
            </div>
            <div class="lecture-actions">
                <button class="btn btn-sm btn-warning btn-action" onclick="editLecture('${lectureId}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger btn-action" onclick="deleteLecture('${lectureId}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    
    body.insertAdjacentHTML('beforeend', lectureHTML);
    
    
    // Auto edit title
    setTimeout(() => editLecture(lectureId), 100);
}

function editLecture(lectureId) {
    const textElement = document.getElementById(`text-${lectureId}`);
    const currentText = textElement.textContent;
    
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    input.className = 'editable-input';
    input.style.width = '100%';
    
    textElement.replaceWith(input);
    input.focus();
    input.select();
    
    function saveEdit() {
        const newText = input.value.trim() || currentText;
        const span = document.createElement('span');
        span.className = 'lecture-text';
        span.id = `text-${lectureId}`;
        span.textContent = newText;
        input.replaceWith(span);
    }
    
    input.onblur = saveEdit;
    input.onkeypress = (e) => {
        if (e.key === 'Enter') {
            saveEdit();
        }
    };
}

function deleteLecture(lectureId) {
    if (confirm('Are you sure you want to delete this lecture?')) {
        document.getElementById(lectureId).remove();
    }
}

function openLinkModal(sectionId) {
    currentSectionId = sectionId;
    const modal = document.getElementById('linkModal');
    modal.classList.add('active');
    
    // Clear previous selection
    document.getElementById('modalLinkInput').value = '';
    document.querySelectorAll('.modal-link-item').forEach(item => {
        item.classList.remove('selected');
    });
}

function closeModal() {
    const modal = document.getElementById('linkModal');
    modal.classList.remove('active');
    currentSectionId = null;
}

// Handle link item selection
document.addEventListener('click', (e) => {
    if (e.target.closest('.modal-link-item')) {
        const linkItem = e.target.closest('.modal-link-item');
        const link = linkItem.getAttribute('data-link');
        
        // Toggle selection
        document.querySelectorAll('.modal-link-item').forEach(item => {
            item.classList.remove('selected');
        });
        linkItem.classList.add('selected');
        
        // Set input value
        document.getElementById('modalLinkInput').value = link;
    }
});

function saveLinkContent() {
    if (!currentSectionId) return;
    const lectureId = `${currentSectionId}-${lectureCounters[currentSectionId]}`;

    const linkInput = document.getElementById('modalLinkInput').value.trim();
    const titleInput = document.getElementById(`text-${lectureId}`).innerHTML;
    
    if (!linkInput) {
        alert('Please enter or select a link!');
        return;
    }
    
    if (!titleInput) {
        alert('Please enter a content title!');
        return;
    }
    
    // Update the content title input to become a link
    const contentInput = document.getElementById(`text-${lectureId}`);
    const chooseFileItem = contentInput.parentElement;
    
    // Replace input with link
    const linkElement = document.createElement('a');
    linkElement.href = linkInput;
    linkElement.target = '_blank';
    linkElement.className = 'lecture-title';
    linkElement.style.flexGrow = '1';
    linkElement.textContent = titleInput;
    
    contentInput.replaceWith(linkElement);
    
    // Add edit button next to the link
    const editBtn = document.createElement('button');
    editBtn.className = 'btn-edit';
    editBtn.innerHTML = '✏️';
    editBtn.onclick = function() {
        editContentLink(this, linkInput);
    };
    
    linkElement.insertAdjacentElement('afterend', editBtn);
    
    // Close modal
    closeModal();
}

function editContentLink(button, originalLink) {
    const lectureLink = button.previousElementSibling;
    const currentText = lectureLink.textContent;
    const currentHref = lectureLink.href;
    
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    input.className = 'editable-title';
    input.style.width = '300px';
    
    lectureLink.replaceWith(input);
    input.focus();
    input.select();
    
    function saveEdit() {
        const newTitle = input.value.trim() || currentText;
        const link = document.createElement('a');
        link.href = currentHref;
        link.target = '_blank';
        link.className = 'lecture-title';
        link.textContent = newTitle;
        input.replaceWith(link);
    }
    
    input.onblur = saveEdit;
    input.onkeypress = (e) => {
        if (e.key === 'Enter') {
            saveEdit();
        }
    };
}







// Close modal when clicking outside
document.getElementById('linkModal').addEventListener('click', (e) => {
    if (e.target.id === 'linkModal') {
        closeModal();
    }
});
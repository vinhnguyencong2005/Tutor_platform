 let sectionCounter = 0;
        let lectureCounters = {};

        function addSection() {
            sectionCounter++;
            const sectionId = `section${sectionCounter}`;
            lectureCounters[sectionId] = 0;

            const accordion = document.getElementById('courseAccordion');
            const sectionHTML = `
                <div class="accordion-item" id="item-${sectionId}">
                    <h2 class="accordion-header">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${sectionId}">
                            <span id="title-${sectionId}">Section ${sectionCounter}</span>
                        </button>
                        <button class="add-lecture-btn" onclick="addLecture('${sectionId}')">
                            <i class="fas fa-plus"></i> Lecture
                        </button>
                    </h2>
                    <div id="${sectionId}" class="accordion-collapse collapse" data-bs-parent="#courseAccordion">
                        <div class="accordion-body" id="body-${sectionId}">
                            <p class="text-muted">There are no lectures yet. Click "Lecture" to add one.</p>
                        </div>
                    </div>
                </div>
            `;
            
            accordion.insertAdjacentHTML('beforeend', sectionHTML);
            
            // Auto edit title
            setTimeout(() => editSection(sectionId), 100);
        }

        function editSection(sectionId) {
            const titleElement = document.getElementById(`title-${sectionId}`);
            const currentText = titleElement.textContent;
            
            const input = document.createElement('input');
            input.type = 'text';
            input.value = currentText;
            input.className = 'editable-input';
            
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

        function deleteSection(sectionId) {
            if (confirm('Are you sure you want to delete this section?')) {
                document.getElementById(`item-${sectionId}`).remove();
            }
        }

        function addLecture(sectionId) {
            lectureCounters[sectionId]++;
            const lectureId = `lecture-${sectionId}-${lectureCounters[sectionId]}`;
            const body = document.getElementById(`body-${sectionId}`);
            
            // Remove empty message if exists
            const emptyMsg = body.querySelector('.text-muted');
            if (emptyMsg) emptyMsg.remove();
            
            const lectureHTML = `
                <div class="lecture" id="${lectureId}">
                    <span class="lecture-text" id="text-${lectureId}">Lecture ${lectureCounters[sectionId]}</span>
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

        // Initialize with one example section
        // window.onload = () => {
        //     addSection();
        // };
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const employeeId = urlParams.get('id');
    if (!employeeId) {
        alert('Employee ID is missing.');
        return;
    }

    console.log('Fetching employee data for ID:', employeeId);
    try {
        const response = await fetch(`http://localhost:5000/logins/${employeeId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch employee data');
        }

        const employee = await response.json();
        prefillForm(employee);
    } catch (error) {
        console.error('Error fetching employee data:', error);
        alert('Failed to load employee data.');
    }

    function prefillForm(employee) {
        document.getElementById('name').value = employee.name || '';
        document.getElementById('email').value = employee.email || '';
        document.getElementById('mobile').value = employee.mobile || '';
        document.getElementById('designation').value = employee.designation || '';
        const genderRadio = document.querySelector(`input[name="gender"][value="${employee.gender}"]`);
        if (genderRadio) genderRadio.checked = true;
        if (Array.isArray(employee.courses)) {
            employee.courses.forEach(course => {
                const checkbox = document.querySelector(`input[name="course"][value="${course}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }
        if (employee.img) {
            const imgPreview = document.createElement('img');
            imgPreview.src = `http://localhost:5000/uploads/${employee.img}`;
            imgPreview.alt = 'Employee Image';
            imgPreview.style.width = '100px';
            imgPreview.style.height = 'auto';
            const imgContainer = document.getElementById('imgPreviewContainer');
            imgContainer.innerHTML = '';
            imgContainer.appendChild(imgPreview);
        }
    }
    document.getElementById('editForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const courses = Array.from(document.querySelectorAll('input[name="course"]:checked')).map(cb => cb.value);
        formData.set('courses', courses);

        try {
            const response = await fetch(`http://localhost:5000/logins/${employeeId}`, {
                method: 'PUT',
                body: formData,
            });
            if (response.ok) {
                alert('Employee updated successfully!');
                window.location.href = 'employee-list.html';
            } else {
                const errorData = await response.json();
                alert(`Failed to update employee: ${errorData.msg || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error updating employee:', error);
            alert('Error updating employee. Please try again.');
        }
    });
    document.getElementById('imgUpload').addEventListener('change', function (e) {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = function () {
            const imgPreview = document.createElement('img');
            imgPreview.src = reader.result;
            imgPreview.alt = 'Image Preview';
            imgPreview.style.width = '100px';
            imgPreview.style.height = 'auto';
            const imgContainer = document.getElementById('imgPreviewContainer');
            imgContainer.innerHTML = '';
            imgContainer.appendChild(imgPreview);
        };

        if (file) {
            reader.readAsDataURL(file);
        }
    });
});

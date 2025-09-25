const card = document.querySelector('#card');
const gender = document.querySelector('#gender');
const name = document.querySelector('#name');
const nameELM = document.querySelector('#nameELM');
const nameplate = document.querySelector('#nameplate');
const sirname = document.querySelector('#sirnameinput');
const sirnameELM = document.querySelector('#sirname');
const sirnameContainer = document.querySelector('#sirnameContainer');
const image = document.querySelector('#image');
const photo = document.querySelector('#photo');


image.addEventListener('click', () => {
    image.value = ''
})
image.addEventListener('input', (event) => {
    if (name.value) {
        if (gender.value) {
            if (sirname.value) {
                sirnameELM.innerHTML = sirname.value.trim();
                // nameplate.classList.replace('top-[80.8%]', 'top-[79.5%]')
                sirnameContainer.classList.remove('hidden')
            } else {
                // nameplate.classList.replace('top-[79.5%]', 'top-[80.8%]')
                sirnameContainer.classList.add('hidden')
            }
            if (gender.value.toLowerCase() !== 'other') {
                if(gender.value.toLowerCase() === 'femaleunmarried'){
                    document.getElementById('prefix').innerHTML = 'सुश्री'
                }else if(gender.value.toLowerCase() === 'male'){
                    document.getElementById('prefix').innerHTML = 'श्री'
                }else{
                    document.getElementById('prefix').innerHTML = 'श्रीमती'
                }
            } else {
                document.getElementById('prefix').innerHTML = ''
            }
            if (name.value.trim().length > 18) {
                if (name.value.trim().length > 25) {
                    alert('Please enter a short name 25 charecters max')
                    return
                }
                nameString = name.value.trim()
                const words = nameString.split(' ');
                const newName = words.map((word, index) => {
                    if (word.length > 5 && index !== 0 && index !== words.length - 1) {
                        return word.slice(0, 3) + 'o';
                    } else {
                        return word
                    }
                }).join(' ')
                nameELM.innerHTML = newName
            } else {
                nameELM.innerHTML = name.value.trim()
            }
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    photo.src = e.target.result;
                }
                reader.readAsDataURL(file);
            }
            card.classList.remove('hidden')
        } else {
            alert('Please select gender');
            image.value = ''
            return
        }
    } else {
        alert('Please enter name');
        image.value = ''
    }
})

sirname.addEventListener('change', () => {
    if (sirname.value) {
        sirnameELM.innerHTML = sirname.value.trim();
        // nameplate.classList.replace('top-[80.8%]', 'top-[79.5%]')
        sirnameContainer.classList.remove('hidden')
    } else {
        // nameplate.classList.replace('top-[79.5%]', 'top-[80.8%]')
        sirnameContainer.classList.add('hidden')
    }
})
gender.addEventListener('change', () => {
    if (gender.value.toLowerCase() !== 'other') {
        if(gender.value.toLowerCase() === 'femaleunmarried'){
            
            document.getElementById('prefix').innerHTML = 'सुश्री'
        }else if(gender.value.toLowerCase() === 'male'){
            document.getElementById('prefix').innerHTML = 'श्री'
        }else{
            document.getElementById('prefix').innerHTML = 'श्रीमती'
        }
    } else {
        document.getElementById('prefix').innerHTML = ''
    }
})
name.addEventListener('change', () => {
    if (name.value.trim().length > 18) {
        if (name.value.trim().length > 25) {
            alert('Please enter a short name 25 charecters max')
            return
        }
        nameString = name.value.trim()
        const words = nameString.split(' ');
        const newName = words.map((word, index) => {
            if (word.length > 5 && index !== 0 && index !== words.length - 1) {
                return word.slice(0, 3) + 'o';
            } else {
                return word
            }
        }).join(' ')
        nameELM.innerHTML = newName
    } else {
        nameELM.innerHTML = name.value.trim()
    }
})

image.addEventListener('change', () => {
    if (!image.value) {
        console.log(image.value);
        document.getElementById('downloadBtn').classList.add('hidden')
    }
    else {
        document.getElementById('downloadBtn').classList.remove('hidden')
        console.log(image.value);

    }
})

image.addEventListener('change', () => {
    if (!image.value)
        document.getElementById('downloadBtn').classList.add('hidden')
    else
        document.getElementById('downloadBtn').classList.remove('hidden')
});

// Function to download the card as an image
document.getElementById('downloadBtn').addEventListener('click', function () {
    const card = document.getElementById('card');

    // Ensure the card is visible for capturing
    card.classList.remove('hidden');

    html2canvas(card).then(function (canvas) {
        // Create an <a> element to download the canvas image
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'sadaneera-2025-invitation.png';
        link.click();
    });
});

const photoDiv = document.getElementById("photoContainer");


document.addEventListener("DOMContentLoaded", function () {
    const imageUpload = document.getElementById('image');
    const imagePreview = document.getElementById('imagePreview');
    const cropModal = document.getElementById('cropModal');
    const cropButton = document.getElementById('cropButton');
    const cancelButton = document.getElementById('cancelButton');
    const photoContainer = document.getElementById('photoContainer').querySelector('#photo');
    const card = document.getElementById('card');
    const downloadBtn = document.getElementById('downloadBtn');
    let cropper;



    imageUpload.addEventListener('change', function (e) {
        const files = e.target.files;
        const reader = new FileReader();

        reader.onload = function (event) {
            imagePreview.src = event.target.result;
            cropModal.classList.remove('hidden');

            if (cropper) {
                cropper.destroy();
            }
            const containerWidth = photoDiv.clientWidth;
            const containerHeight = photoDiv.clientHeight;

            const aspectRatio = calculateAspectRatio(containerWidth, containerHeight);
            cropper = new Cropper(imagePreview, {
                aspectRatio: aspectRatio,
                viewMode: 1,
                autoCropArea: 1,
                movable: false,
                zoomable: false,
                scalable: false,
                cropBoxResizable: true
            });
        };

        if (files.length) {
            reader.readAsDataURL(files[0]);
        }
    });

    cropButton.addEventListener('click', function () {
        const croppedCanvas = cropper.getCroppedCanvas({
            width: 300,
            height: 300
        });

        photoContainer.src = croppedCanvas.toDataURL();
        cropModal.classList.add('hidden');
        card.classList.remove('hidden');
        downloadBtn.classList.remove('hidden');
    });

    cancelButton.addEventListener('click', function () {
        cropModal.classList.add('hidden');
        if (cropper) {
            cropper.destroy();
        }
    });
});

function calculateAspectRatio(width, height) {
    if (width > 0 && height > 0) {
        return width / height;
    } else {
        console.error("Width and height must be greater than zero.");
        return null;
    }
}

function authenticate() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Sample credentials for demo purposes
    const validUsername = '';
    const validPassword = '';

    if (username === validUsername && password === validPassword) {

        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('loginTime', new Date().getTime().toString());

        document.getElementById('authModal').classList.add('hidden');
        document.getElementById('mainContent').classList.remove('hidden');
        window.location.reload();
    } else {
        document.getElementById('authError').classList.remove('hidden');
    }
}

function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const loginTime = localStorage.getItem('loginTime');

    const logoutBtn = document.getElementById('logoutBtn');

    if (isLoggedIn === 'true' && loginTime) {
        const currentTime = new Date().getTime();
        const timeElapsed = (currentTime - parseInt(loginTime)) / (1000 * 60); // time in minutes
        console.log(timeElapsed);
        
        
        if (timeElapsed < 600) {
            // Less than 10 minutes have passed, show main content
            logoutBtn.classList.replace('hidden', 'inline-block');
            document.getElementById('authModal').style.display = 'none';
            document.getElementById('mainContent').classList.remove('hidden');
        } else {
            // More than 10 minutes have passed, clear login state
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('loginTime');
            logoutBtn.classList.replace( 'inline-block', 'hidden');
        }
    }else{

    }
}

function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('loginTime');
    window.location.reload();
}

window.onload = checkLoginStatus;







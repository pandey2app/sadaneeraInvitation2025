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
                if (gender.value.toLowerCase() === 'femaleunmarried') {
                    document.getElementById('prefix').innerHTML = 'सुश्री'
                } else if (gender.value.toLowerCase() === 'male') {
                    document.getElementById('prefix').innerHTML = 'श्री'
                } else {
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
        if (gender.value.toLowerCase() === 'femaleunmarried') {

            document.getElementById('prefix').innerHTML = 'सुश्री'
        } else if (gender.value.toLowerCase() === 'male') {
            document.getElementById('prefix').innerHTML = 'श्री'
        } else {
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

async function saveInvitationRecord() {
    try {
        const { data: userData, error: userError } =
            await supabaseClient.auth.getUser();

        if (userError || !userData.user) {
            throw new Error('Admin is not logged in.');
        }

        const user = userData.user;

        const invitationNumber = `SNM-${Date.now()}`;

        const invitationData = {
            invitation_number: invitationNumber,
            guest_name: name.value.trim(),
            gender: gender.value,
            designation: sirname.value.trim(),
            generated_by: user.id,
            generated_by_login: user.email
        };

        const { data, error } = await supabaseClient
            .from('invitations')
            .insert([invitationData])
            .select();

        if (error) {
            console.error('Invitation save error:', error);
            throw error;
        }

        return data[0];

    } catch (error) {
        console.error('Failed to save invitation:', error);
        return null;
    }
}

async function uploadCardToSupabase(canvas, invitationNumber) {

    const fileName = `${invitationNumber}.png`;

    const blob = await new Promise(resolve => {
        canvas.toBlob(resolve, 'image/png');
    });

    if (!blob) {
        throw new Error('Could not create image blob.');
    }

    const { data, error } = await supabaseClient
        .storage
        .from('invitations')
        .upload(fileName, blob, {
            contentType: 'image/png',
            upsert: false
        });

    if (error) {
        console.error('Storage upload error:', error);
        throw error;
    }

    console.log('Card uploaded:', data);

    return data.path;
}

/// Function to download the card as an image
// Simple html2canvas-safe version.
// Tailwind styles are removed only from html2canvas's cloned document,
// so the normal page design remains unchanged.

document
    .getElementById('downloadBtn')
    .addEventListener('click', async function () {

        const card = document.getElementById('card');

        card.classList.remove('hidden');

        try {

            const canvas = await html2canvas(card, {

                useCORS: true,
                allowTaint: true,
                backgroundColor: null,
                scale: 2,
                logging: false,

                onclone: function (clonedDocument) {

                    const clonedCard =
                        clonedDocument.getElementById('card');

                    if (!clonedCard) return;

                    // Remove external stylesheets from the clone.
                    // This prevents Tailwind OKLCH values reaching html2canvas.
                    clonedDocument
                        .querySelectorAll('link[rel="stylesheet"]')
                        .forEach(function (link) {
                            link.remove();
                        });

                    // Remove inline stylesheets from the clone.
                    clonedDocument
                        .querySelectorAll('style')
                        .forEach(function (style) {
                            style.remove();
                        });

                    // Card itself
                    clonedCard.style.position = 'relative';
                    clonedCard.style.display = 'block';
                    clonedCard.style.overflow = 'hidden';

                    // Invitation background
                    const backgroundImage =
                        clonedCard.querySelector(':scope > img');

                    if (backgroundImage) {
                        backgroundImage.style.display = 'block';
                        backgroundImage.style.width = '100%';
                        backgroundImage.style.height = 'auto';
                    }

                    // Guest photo container
                    const photoContainer =
                        clonedDocument.getElementById('photoContainer');

                    if (photoContainer) {
                        photoContainer.style.position = 'absolute';
                        photoContainer.style.left = '28%';
                        photoContainer.style.top = '57.5%';
                        photoContainer.style.width = '44%';
                        photoContainer.style.height = '28%';
                        photoContainer.style.overflow = 'hidden';
                    }

                    const clonedPhoto =
                        clonedDocument.getElementById('photo');

                    if (clonedPhoto) {
                        clonedPhoto.style.display = 'block';
                        clonedPhoto.style.width = '100%';
                        clonedPhoto.style.height = '100%';
                        clonedPhoto.style.objectFit = 'cover';
                        clonedPhoto.style.objectPosition = 'center';
                    }

                    // Name plate
                    const nameplate =
                        clonedDocument.getElementById('nameplate');

                    if (nameplate) {
                        nameplate.style.position = 'absolute';
                        nameplate.style.left = '25%';
                        nameplate.style.top = '84.4%';
                        nameplate.style.width = '50%';
                        nameplate.style.height = '32px';
                        nameplate.style.display = 'flex';
                        nameplate.style.flexWrap = 'wrap';
                        nameplate.style.justifyContent = 'center';
                        nameplate.style.alignContent = 'center';
                    }

                    const nameContainer =
                        clonedDocument.getElementById('nameContainer');

                    if (nameContainer) {
                        nameContainer.style.width = '100%';
                    }

                    // Guest name
                    const clonedName =
                        clonedDocument.getElementById('nameELM');

                    if (clonedName) {
                        clonedName.style.color = '#fde047';
                        clonedName.style.fontFamily =
                            '"Noto Serif Devanagari", serif';
                        clonedName.style.fontWeight = '600';
                        clonedName.style.fontSize = '12px';
                        clonedName.style.textAlign = 'center';
                    }

                    const clonedPrefix =
                        clonedDocument.getElementById('prefix');

                    if (clonedPrefix) {
                        clonedPrefix.style.color = '#fde047';
                        clonedPrefix.style.fontWeight = '600';
                        clonedPrefix.style.marginRight = '4px';
                    }

                    // Designation
                    const sirnameContainer =
                        clonedDocument.getElementById('sirnameContainer');

                    if (sirnameContainer) {

                        const hidden =
                            sirnameContainer.classList.contains('hidden');

                        sirnameContainer.style.display =
                            hidden ? 'none' : 'block';

                        if (!hidden) {
                            sirnameContainer.style.width = '100%';
                        }
                    }

                    const clonedSirname =
                        clonedDocument.getElementById('sirname');

                    if (clonedSirname) {
                        clonedSirname.style.color = '#ffffff';
                        clonedSirname.style.fontFamily =
                            '"Baloo 2", sans-serif';
                        clonedSirname.style.fontWeight = '600';
                        clonedSirname.style.fontSize = '12px';
                        clonedSirname.style.textAlign = 'center';
                    }
                }
            });

            // Download PNG
            const link = document.createElement('a');

            link.href = canvas.toDataURL('image/png');

            link.download =
                'sadaneera-2025-invitation.png';

            document.body.appendChild(link);

            link.click();

            link.remove();

        } catch (error) {

            console.error(
                'Card generation/save error:',
                error
            );

            alert(
                'निमंत्रण कार्ड बनाने में समस्या हुई। कृपया दोबारा प्रयास करें।'
            );
        }
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

async function authenticate() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    const authError = document.getElementById('authError');

    authError.classList.add('hidden');

    if (!username || !password) {
        authError.textContent = 'Please enter username and password';
        authError.classList.remove('hidden');
        return;
    }

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: username,
        password: password
    });

    if (error) {
        console.error('Login error:', error);
        authError.textContent = 'Invalid username or password!';
        authError.classList.remove('hidden');
        return;
    }

    // console.log('Logged in user:', data.user);

    document.getElementById('authModal').classList.add('hidden');
    document.getElementById('mainContent').classList.remove('hidden');

    checkLoginStatus();
}

async function checkLoginStatus() {
    const { data, error } = await supabaseClient.auth.getUser();

    const logoutBtn = document.getElementById('logoutBtn');
    const authModal = document.getElementById('authModal');
    const mainContent = document.getElementById('mainContent');

    if (error || !data.user) {
        authModal.style.display = 'flex';
        mainContent.classList.add('hidden');
        logoutBtn.classList.replace('inline-block', 'hidden');
        return;
    }

    // console.log('Current admin:', data.user.email);

    authModal.style.display = 'none';
    mainContent.classList.remove('hidden');
    logoutBtn.classList.replace('hidden', 'inline-block');
}

async function logout() {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
        console.error('Logout error:', error);
        return;
    }

    window.location.reload();
}

window.onload = checkLoginStatus;







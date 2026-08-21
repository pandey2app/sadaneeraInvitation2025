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

// Function to download the card as an image
document.getElementById('downloadBtn').addEventListener('click', async function () {

    const downloadBtn = document.getElementById('downloadBtn');
    const card = document.getElementById('card');

    try {

        downloadBtn.disabled = true;
        downloadBtn.textContent = 'कार्ड सुरक्षित किया जा रहा है...';

        card.classList.remove('hidden');

        // Generate PNG
        const canvas = await html2canvas(card);

        // Save invitation information
        const savedInvitation = await saveInvitationRecord();

        if (!savedInvitation) {
            throw new Error('Invitation record could not be saved.');
        }

        // Upload generated card
        const cardPath = await uploadCardToSupabase(
            canvas,
            savedInvitation.invitation_number
        );

        // Save card path in database
        const { error: updateError } = await supabaseClient
            .from('invitations')
            .update({
                generated_card_url: cardPath
            })
            .eq('id', savedInvitation.id);

        if (updateError) {
            throw updateError;
        }

        // Download locally
        const link = document.createElement('a');

        link.href = canvas.toDataURL('image/png');

        link.download =
            `${savedInvitation.invitation_number}.png`;

        link.click();

        downloadBtn.textContent = 'निमंत्रण कार्ड सुरक्षित करें';
        downloadBtn.disabled = false;

        alert('निमंत्रण कार्ड सफलतापूर्वक सुरक्षित हो गया।');

    } catch (error) {

        console.error('Card generation/save error:', error);

        alert(
            'कार्ड सुरक्षित करने में समस्या हुई। कृपया Console में error देखें।'
        );

        downloadBtn.textContent = 'निमंत्रण कार्ड सुरक्षित करें';
        downloadBtn.disabled = false;
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







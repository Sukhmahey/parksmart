const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

signUpButton.addEventListener('click', () => {
	container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', () => {
	container.classList.remove("right-panel-active");
});

// Get the password input fields and the toggle icons
const signinPassword = document.getElementById('signinPassword');
const signupPassword = document.getElementById('signupPassword');
const toggleSigninPasswordIcon = document.getElementById('togglePasswordIcon');
const toggleSignupPasswordIcon = document.getElementById('toggleSignupPasswordIcon');

// Toggle the signin password visibility
toggleSigninPasswordIcon.addEventListener('click', function () {
    const type = signinPassword.type === 'password' ? 'text' : 'password';
    signinPassword.type = type;

    // Toggle the icon class to change the eye icon
    if (signinPassword.type === 'password') {
        toggleSigninPasswordIcon.classList.remove('fa-eye-slash');
        toggleSigninPasswordIcon.classList.add('fa-eye');
    } else {
        toggleSigninPasswordIcon.classList.remove('fa-eye');
        toggleSigninPasswordIcon.classList.add('fa-eye-slash');
    }
});

// Toggle the signup password visibility
toggleSignupPasswordIcon.addEventListener('click', function () {
    const type = signupPassword.type === 'password' ? 'text' : 'password';
    signupPassword.type = type;

    // Toggle the icon class to change the eye icon
    if (signupPassword.type === 'password') {
        toggleSignupPasswordIcon.classList.remove('fa-eye-slash');
        toggleSignupPasswordIcon.classList.add('fa-eye');
    } else {
        toggleSignupPasswordIcon.classList.remove('fa-eye');
        toggleSignupPasswordIcon.classList.add('fa-eye-slash');
    }
});

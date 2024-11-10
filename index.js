
// Client-side form validation with custom JavaScript (no Constraint Validation API)

const email = document.querySelector("#mail");
const country = document.querySelector("#country");
const postalCode = document.querySelector("#postal");
const password = document.querySelector("#pass");
const passwordConfirm = document.querySelector("#confirm-pass");
const passToggleBtn = document.querySelector(".pass-toggle");

const emailError = document.querySelector(".email-error");
const countryError = document.querySelector(".country-error");
const postalError = document.querySelector(".postal-error");
const passwordError = document.querySelector(".password-error");
const confirmPasswordError = document.querySelector(".confirm-password-error");
const passRequirements = document.querySelector(".pass-requirements-wrapper");

const form = document.querySelector("form");

const emailRegex = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/; 

let formClicked = false;

// Postal code constraints for US, Ukraine, Canada and Spain
const postalCodeConstraints = {
  /* Postal code pattern  
     Error message
     Postal code placeholder example */
  us: [
    "^\\d{5}(?:[ \\-]\\d{4})?$",                                                       
    "United States postal code must have exactly 5 digits or 9 digits", 
    "e.g.: 12345 or 12345-6789",  
  ],
  ua: [
    "^\\d{5}$",
    "Ukraine postal code must have exactly 5 digits",
    "e.g.: 12345",
  ],
  ca: [
    "^[ABCEGHJ-NPRSTVXY]\\d[ABCEGHJ-NPRSTV-Z][ -]?\\d[ABCEGHJ-NPRSTV-Z]\\d$",
    "Canada postal code must have exactly 6 alphanumeric characters",
    "e.g.: A1A 1A1 or A1A-1A1", 
  ],
  es: [
    "^\\d{5}$",
    "Spain postal code must have exactly 5 digits",
    "e.g.: 12345",
  ],
};

function checkEmptyFields() {
  const inputs = document.querySelectorAll("input, select");

  const errors = [
    "Email is required",
    "Please select a country",
    "Postal code is required",
    "Password is required",
    "Confirm password is required"
  ];

  // Set error messages for all empty fields when attempting to submit the form
  inputs.forEach((input, index) => {
    if (input.value.length === 0) {
      const errorElement = input.nextElementSibling;
      errorElement.textContent = errors[index];
    };
  });
}; 

function resetInputValues() {
  email.value = "";
  country.value = "";
  postalCode.value = "";
  password.value = "";
  passwordConfirm.value = "";
  
  const inputs = document.querySelectorAll("input, select");
  const requirementList = document.querySelectorAll("ul > li");

  // Reset visuals 
  requirementList.forEach((item) => item.classList.remove("valid"));

  inputs.forEach((input) => {
    const check = input.parentNode.querySelector(".valid-checkmark");
    input.classList.remove("validInput");
    check.style.visibility = "hidden";
  });
};

// Handle input events
function handleInputEvents() {
  email.addEventListener("input", () => {
    formClicked = false;
    validateEmail();
  });

  country.addEventListener("change", () => {
    // Dynamically change postal code placeholder based on country selection
    const placeholder = postalCodeConstraints[country.value][2];
    postalCode.setAttribute("placeholder", placeholder);

    // Set error for postal code input if country has changed
    if (postalCode.value.length > 0 && !validatePostalCode()) {
      postalError.textContent = postalCodeConstraints[country.value][1];
    };
    
    validateCountry();
  });

  postalCode.addEventListener("input", () => {
    formClicked = false;
    validatePostalCode();
  });

  password.addEventListener("input", () => {
    formClicked = false;
    validatePassword();
    handlePasswordMatch();
  });

  password.addEventListener("blur", () => {
    passRequirements.style.display = "none";
  });

  password.addEventListener("focus", () => {
    passRequirements.style.display = "flex";
  });

  passwordConfirm.addEventListener("input", () => {
    formClicked = false;
    handlePasswordMatch();
  });
};

// Show/Hide password
passToggleBtn.addEventListener("click", () => {
  if (password.type === "password") {
    password.type = "text";
    passToggleBtn.textContent = "Hide";
  } else {
    password.type = "password";
    passToggleBtn.textContent = "Show";
  };
});

// Check if all inputs are valid upon form submission
form.addEventListener("submit", (e) => {
  e.preventDefault();
  formClicked = true;

  // If all inputs are valid
  if (validateEmail() && validateCountry() && validatePostalCode() && validatePassword() && handlePasswordMatch()) {
    //e.target.submit();  
    resetInputValues(); // for testing without submitting the form

    // Confetti if all inputs are valid and submit is clicked
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.3 }
    });

    formClicked = false;
  } else {
    checkEmptyFields();
  };
});

function validateEmail() {
  const isValid = emailRegex.test(email.value);

  if (isValid) {
    emailError.textContent = "";
  } else if (!formClicked) {
    emailError.textContent = email.value.length === 0 ? "" : "Incorrect email format";
  };
  styleIfValid(email, isValid);

  return isValid;
};

function validateCountry() {
  const isValid = country.value !== "";

  if (isValid) {
    countryError.textContent = "";
  };

  styleIfValid(country, isValid);

  return isValid;
};

function validatePostalCode() {
  const country = document.querySelector("#country").value;

  // If country hasn't been selected
  if (!country) {
    postalError.textContent = postalCode.value.length === 0 ? "" : "Please follow a country format";
    return true;
  };

  const constraint = new RegExp(postalCodeConstraints[country][0], ""); // Create postal code constraint
  const isValid = constraint.test(postalCode.value);

  if (isValid) {
    postalError.textContent = "";
  } else if (!formClicked) {
    postalError.textContent = postalCode.value.length === 0 ? "" : postalCodeConstraints[country][1];
  };
  styleIfValid(postalCode, isValid);

  return isValid;
};

// Check and style the password requirements that were met
function checkIfValid(index, valid) {
  const requirementList = document.querySelectorAll("ul > li");

  if (valid) {
    requirementList[index].classList.add("valid");
  } else {
    requirementList[index].classList.remove("valid");
  };
};

/* Validate password if it has:
   - min 8 characters 
   - at least one uppercase letter
   - at least one lowercase letter
   - at least one number
   - at least one special character
*/
function validatePassword() {
  const validations = [
    {
      test: () => password.value.length >= 8,
    },
    {
      test: () => /[A-Z]/.test(password.value),
    },
    {
      test: () => /[a-z]/.test(password.value),
    },
    {
      test: () => /\d/.test(password.value),
    },
    {
      test: () => /[@$!%*?&]/.test(password.value),
    },
  ];

  // If requirement is met, highlight it
  validations.forEach((validation, index) => {
    if (validation.test()) {
      checkIfValid(index, true);
    } else if (!formClicked) {
      passwordError.textContent = password.value.length === 0 ? "" : "Password must meet all of the requirements";
      checkIfValid(index, false);
    };
  });

  const isValid = passwordRegex.test(password.value);
  const noMatch = password.value !== passwordConfirm.value;

  if (isValid) {
    passwordError.textContent = "";
    if ((noMatch) && passwordConfirm.value.length > 0) {
      confirmPasswordError.textContent = "Passwords do not match";
    } else {
      confirmPasswordError.textContent = "";
    };
  };
  styleIfValid(password, isValid);

  return isValid;
};

function handlePasswordMatch() {
  const isValid = passwordRegex.test(password.value) && passwordConfirm.value === password.value;

  if (isValid || passwordConfirm.value.length === 0) {
    confirmPasswordError.textContent = ""; 
  } else if (!formClicked) {
    confirmPasswordError.textContent = passwordConfirm.value.length === 0 ? "" : "Password must meet all of the requirements";
  };

  if (passwordRegex.test(password.value)) {
    if (passwordConfirm.value !== password.value && passwordConfirm.value.length > 0) {
      confirmPasswordError.textContent = "Passwords do not match";
    };
  };

  styleIfValid(passwordConfirm, isValid);

  return isValid;
};

// Style the input if it's valid
function styleIfValid(inputElement, isValid) {
  const check = inputElement.parentNode.querySelector(".valid-checkmark");

  if (isValid) {
    check.style.visibility = "visible";
    inputElement.classList.add("validInput");
  } else {
    check.style.visibility = "hidden";
    inputElement.classList.remove("validInput");
  };
};

handleInputEvents();
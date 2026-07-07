/*
    Name:    Zachary Nguyen
    File:    homework3.js
    Date:    06/26/2026
    Purpose: Redisplay and validate data from the Bayou City Family Clinic intake form. Referenced patterns from the sheet.
    Used Claude to help with the patterns in SSN, email, PatientID, and password. 
    Class:   MIS3371 | Professor Messinger | Assignment 2
*/

/* Clears the review output. Wired to the Reset button. */
function clearReview() {
    document.getElementById("outputformdata").innerHTML = "(You started over.)";
}

/* Loops through every field in the form and redisplays the entered data.*/
function reviewData() {
    var formcontents = document.getElementById("signup");
    var formoutput;
    var datatype;
    var fieldname;
    var fieldvalue;
    var i;

    formoutput = "<table class='output'><th>Data</th><th>Value</th>";

    for (i = 0; i < formcontents.length; i++) {
        fieldname  = formcontents.elements[i].name;
        fieldvalue = formcontents.elements[i].value;
        datatype   = formcontents.elements[i].type;
        console.log("item: " + i + " " + fieldname + " = " + fieldvalue);

        switch (datatype) {
            case "checkbox":
                if (formcontents.elements[i].checked) {
                    formoutput = formoutput + "<tr><td align='right'>" + fieldname + "</td>";
                    formoutput = formoutput + "<td class='outputdata'>Checked</td></tr>";
                }
                break;
            case "radio":
                if (formcontents.elements[i].checked) {
                    formoutput = formoutput + "<tr><td align='right'>" + fieldname + "</td>";
                    formoutput = formoutput + "<td class='outputdata'>" + fieldvalue + "</td></tr>";
                }
                break;
            case "button": case "submit": case "reset":
                break;
            default:
                // Mask the SSN.
                if (fieldname === "ssn" && fieldvalue !== "") {
                    fieldvalue = "XXX-XX-" + fieldvalue.slice(-4);
                }
                formoutput = formoutput + "<tr><td align='right'>" + fieldname + "</td>";
                formoutput = formoutput + "<td class='outputdata'>" + fieldvalue + "</td></tr>";
        }
    }

    if (formoutput.length > 0) {
        formoutput = formoutput + "</table>";
        document.getElementById("outputformdata").innerHTML = formoutput;
    }
}

/*
   Field validators. Each grabs its value, checks it, and writes
   a message to its own <span>. Returns true if valid, false if not.*/

/* Email */
function checkEmail() {
    var x = document.getElementById("patient-email").value;
    field.value = field.value.toLowerCase();
    var x = field.value;
    var msg = document.getElementById("email-error");
    if (x === "") {
        msg.innerHTML = "Email is required.";
        return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x)) {
        msg.innerHTML = "Please enter a valid email (name@example.com).";
        return false;
    }
    msg.innerHTML = "";
    return true;
}

/* Patient ID: PT- followed by 5 digits */
function checkID() {
    var x = document.getElementById("patient-id").value;
    var msg = document.getElementById("id-error");
    if (x === "") {
        msg.innerHTML = "Patient ID is required.";
        return false;
    }
    if (!/^PT-\d{5}$/.test(x)) {
        msg.innerHTML = "Format must be PT-##### (5 digits).";
        return false;
    }
    msg.innerHTML = "";
    return true;
}

/* Password: checks as you type (on the fly) */
function checkPassword() {
    var x = document.getElementById("password").value;
    var msg = document.getElementById("password-error");
    if (x.length < 8 || x.length > 30) {
        msg.className = "error";
        msg.innerHTML = "Password must be 8-30 characters.";
        return false;
    }
    if (!/[A-Z]/.test(x)) {
        msg.className = "error";
        msg.innerHTML = "Password needs an uppercase letter.";
        return false;
    }
    if (!/[a-z]/.test(x)) {
        msg.className = "error";
        msg.innerHTML = "Password needs a lowercase letter.";
        return false;
    }
    if (!/[0-9]/.test(x)) {
        msg.className = "error";
        msg.innerHTML = "Password needs a number.";
        return false;
    }
    msg.className = "ok";
    msg.innerHTML = "Password meets criteria.";
    return true;
}

/* Confirm Password: compares the two password boxes */
function checkConfirm() {
    var p = document.getElementById("password").value;
    var c = document.getElementById("password-confirm").value;
    var msg = document.getElementById("confirm-error");
    if (c === "") {
        msg.className = "error";
        msg.innerHTML = "Please re-enter your password.";
        return false;
    }
    if (p !== c) {
        msg.className = "error";
        msg.innerHTML = "Passwords do not match.";
        return false;
    }
    msg.className = "ok";
    msg.innerHTML = "Passwords match.";
    return true;
}

/* First Name: letters only */
function checkFirstname() {
    var x = document.getElementById("firstname").value;
    var msg = document.getElementById("firstname-error");
    if (x === "") {
        msg.innerHTML = "First name is required.";
        return false;
    }
    if (!/^[A-Za-z'-]{1,30}$/.test(x)) {
        msg.innerHTML = "First name can only contain letters.";
        return false;
    }
    msg.innerHTML = "";
    return true;
}

/* Last Name: letters only */
function checkLastname() {
    var x = document.getElementById("lastname").value;
    var msg = document.getElementById("lastname-error");
    if (x === "") {
        msg.innerHTML = "Last name is required.";
        return false;
    }
    if (!/^[A-Za-z'-]{1,30}$/.test(x)) {
        msg.innerHTML = "Last name can only contain letters.";
        return false;
    }
    msg.innerHTML = "";
    return true;
}

/* Date of Birth: range check (not blank, not future, not over 120 years ago) */
function checkDOB() {
    var x = document.getElementById("dob").value;
    var msg = document.getElementById("dob-error");
    if (x === "") {
        msg.innerHTML = "Date of birth is required.";
        return false;
    }
    var entered = new Date(x);
    var today = new Date();
    var oldest = new Date();
    oldest.setFullYear(today.getFullYear() - 120);
    if (entered > today) {
        msg.innerHTML = "Date of birth cannot be in the future.";
        return false;
    }
    if (entered < oldest) {
        msg.innerHTML = "Please enter a date within the last 120 years.";
        return false;
    }
    msg.innerHTML = "";
    return true;
}

/* Auto-inserts the dashes as the user types the SSN. */
function formatSSN() {
    var field = document.getElementById("ssn");
    var digits = field.value.replace(/\D/g, "");   // strip out anything that isn't a digit
    if (digits.length > 9) {                        // never more than 9 digits
        digits = digits.slice(0, 9);
    }
    if (digits.length > 5) {                         // ###-##-####
        field.value = digits.slice(0, 3) + "-" + digits.slice(3, 5) + "-" + digits.slice(5);
    } else if (digits.length > 3) {                  // ###-##
        field.value = digits.slice(0, 3) + "-" + digits.slice(3);
    } else {                                         // ###
        field.value = digits;
    }
}

/* Social Security Number: ###-##-#### */
function checkSSN() {
    var x = document.getElementById("ssn").value;
    var msg = document.getElementById("ssn-error");
    if (x === "") {
        msg.innerHTML = "SSN is required.";
        return false;
    }
    if (!/^\d{3}-\d{2}-\d{4}$/.test(x)) {
        msg.innerHTML = "Format must be ###-##-####.";
        return false;
    }
    msg.innerHTML = "";
    document.getElementById("ssn").type = "password";   // hide once they click away (used claude to help me figure this out)
    return true;
}

/* Address */
function checkAddress() {
    var x = document.getElementById("address").value;
    var msg = document.getElementById("address-error");
    if (x === "") {
        msg.innerHTML = "Address is required.";
        return false;
    }
    if (x.length < 5) {
        msg.innerHTML = "Please enter a full street address.";
        return false;
    }
    msg.innerHTML = "";
    return true;
}

/* ZIP: 5 digits */
function checkZip() {
    var x = document.getElementById("zip").value;
    var msg = document.getElementById("zip-error");
    if (x === "") {
        msg.innerHTML = "ZIP is required.";
        return false;
    }
    if (!/^\d{5}$/.test(x)) {
        msg.innerHTML = "ZIP must be 5 digits.";
        return false;
    }
    msg.innerHTML = "";
    return true;
}

/* Phone: optional, but checked if filled in (###-###-####) */
function checkPhone() {
    var x = document.getElementById("phone").value;
    var msg = document.getElementById("phone-error");
    if (x === "") {
        msg.innerHTML = "";
        return true;
    }
    if (!/^\d{3}-\d{3}-\d{4}$/.test(x)) {
        msg.innerHTML = "Format must be ###-###-####.";
        return false;
    }
    msg.innerHTML = "";
    return true;
}

/* Runs every check. Used by the Submit button (onsubmit).
   Returns false to stop submission if anything is invalid. */
function validateForm() {
    var ok = true;
    if (!checkEmail())     { ok = false; }
    if (!checkID())        { ok = false; }
    if (!checkPassword())  { ok = false; }
    if (!checkConfirm())   { ok = false; }
    if (!checkFirstname()) { ok = false; }
    if (!checkLastname())  { ok = false; }
    if (!checkDOB())       { ok = false; }
    if (!checkSSN())       { ok = false; }
    if (!checkAddress())   { ok = false; }
    if (!checkZip())       { ok = false; }
    if (!checkPhone())     { ok = false; }
    return ok;
}

/* End of document: homework2.js */
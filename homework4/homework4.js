/*
    Name:    Zachary Nguyen
    File:    homework4.js
    Date:    07/11/2026
    Purpose: Everything from homework3.js (on-the-fly validation with a
             validate-then-reveal Submit flow) PLUS the Assignment 4 features:
             - Fetch API: loads the State dropdown options from states.html
             - Cookies: remembers the user's first name for 48 hours
             - Local Storage: saves/restores all NON-secure form fields
             - "Not you?" new-user flow that expires the cookie and wipes storage
    Class:   MIS3371 | Professor Messinger | Assignment 4
*/

/* ============================================================
   PAGE START-UP
   Called from <body onload="initPage()"> in homework4.html.
   ============================================================ */
function initPage() {
    loadStates();          // Fetch API: fill the State dropdown
    checkReturningUser();  // Cookies: greet a returning user by name
}

/* ============================================================
   1. FETCH API
   Reads the state <option> list from states.html (a separate
   file) and inserts it into the State dropdown. Uses try/catch
   so a failed fetch can't break the rest of the page.
   ============================================================ */
async function loadStates() {
    var select = document.getElementById("state");
    try {
        var response = await fetch("states.html");
        if (!response.ok) {
            throw new Error("HTTP status " + response.status);
        }
        var optionText = await response.text();
        // Keep the blank "-- State --" option, add the fetched list after it.
        select.innerHTML = "<option value=''>-- State --</option>" + optionText;
        // If this user has a saved state in local storage, re-select it now
        // (the dropdown didn't exist yet when restoreLocalData first ran).
        var savedState = localStorage.getItem("bcfc_state");
        if (savedState !== null) {
            select.value = savedState;
        }
    } catch (err) {
        console.log("Could not load states.html: " + err.message);
        select.innerHTML = "<option value=''>-- States unavailable --</option>";
    }
}

/* ============================================================
   2. COOKIE HELPERS
   setCookie / getCookie / deleteCookie, based on the W3Schools
   cookie examples. Expiry is measured in HOURS (max 48 for
   security, per the assignment).
   ============================================================ */
function setCookie(name, value, hours) {
    var d = new Date();
    d.setTime(d.getTime() + (hours * 60 * 60 * 1000));
    document.cookie = name + "=" + value + "; expires=" + d.toUTCString() + "; path=/; SameSite=Lax";
}

function getCookie(name) {
    var search = name + "=";
    var parts = document.cookie.split(";");
    var i;
    var c;
    for (i = 0; i < parts.length; i++) {
        c = parts[i].trim();
        if (c.indexOf(search) === 0) {
            return c.substring(search.length);
        }
    }
    return "";
}

function deleteCookie(name) {
    // Setting an expiry date in the past removes the cookie.
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax";
}

/* ============================================================
   RETURNING-USER CHECK (runs at page load)
   If the firstname cookie exists: greet the user by name in the
   header, pre-fill the First Name box, restore their saved data,
   and show the dynamic "Not you?" new-user checkbox.
   Otherwise: greet them as a new user.
   ============================================================ */
function checkReturningUser() {
    var name = getCookie("firstname");
    var welcome = document.getElementById("welcome-msg");
    var newUserArea = document.getElementById("newuser-area");

    if (name !== "") {
        welcome.innerHTML = "Welcome back, " + name + "!";
        document.getElementById("firstname").value = name;
        restoreLocalData();
        // Dynamic checkbox: lets a different person start fresh.
        newUserArea.innerHTML =
            "<input type='checkbox' id='notme' onclick='startAsNewUser()'> " +
            "Not " + name + "? Click HERE to start as a NEW USER.";
    } else {
        welcome.innerHTML = "Welcome, New User!";
        newUserArea.innerHTML = "";
    }
}

/* "Not you?" was clicked: expire the cookie, wipe local storage,
   clear the whole form, and greet as a brand-new user. */
function startAsNewUser() {
    deleteCookie("firstname");
    clearLocalData();
    document.getElementById("signup").reset();
    clearReview();
    document.getElementById("welcome-msg").innerHTML = "Welcome, New User!";
    document.getElementById("newuser-area").innerHTML = "";
}

/* ============================================================
   3. LOCAL STORAGE
   Saves every NON-secure field as the user leaves it. The
   password, confirm-password, and SSN fields are secure and are
   NEVER written to local storage or cookies.
   ============================================================ */

/* Fields that are safe to keep in local storage. */
var savedFields = ["patient-email", "patient-id", "firstname", "middlename",
                   "lastname", "dob", "address", "address2", "city", "state",
                   "zip", "phone", "pain-scale", "symptoms",
                   "cb1", "cb2", "cb3", "cb4", "cb5", "cb6"];

/* Wired to each non-secure field's onblur/onchange: saveLocal(this).
   Only saves when the Remember Me box is checked. */
function saveLocal(field) {
    if (!document.getElementById("remember").checked) {
        return;   // user said don't remember them
    }
    if (field.id === "password" || field.id === "password-confirm" || field.id === "ssn") {
        return;   // never store secure items
    }
    if (field.type === "checkbox") {
        localStorage.setItem("bcfc_" + field.id, field.checked ? "yes" : "no");
    } else {
        localStorage.setItem("bcfc_" + field.id, field.value);
    }
    // The first name also refreshes the tracking cookie (48-hour expiry).
    if (field.id === "firstname" && field.value !== "") {
        setCookie("firstname", field.value, 48);
    }
}

/* Loops the saved-field list and saves everything at once.
   Used when Remember Me is re-checked and on a successful validate. */
function saveAllFields() {
    var i;
    var field;
    for (i = 0; i < savedFields.length; i++) {
        field = document.getElementById(savedFields[i]);
        if (field !== null) {
            saveLocal(field);
        }
    }
}

/* Reads local storage back into the form (returning users only). */
function restoreLocalData() {
    var i;
    var field;
    var saved;
    for (i = 0; i < savedFields.length; i++) {
        field = document.getElementById(savedFields[i]);
        saved = localStorage.getItem("bcfc_" + savedFields[i]);
        if (field !== null && saved !== null) {
            if (field.type === "checkbox") {
                field.checked = (saved === "yes");
            } else {
                field.value = saved;
            }
        }
    }
    // Keep the pain-scale display in sync with the restored slider value.
    document.getElementById("pain-display").innerHTML =
        document.getElementById("pain-scale").value;
}

/* Removes every saved item for this user. */
function clearLocalData() {
    var i;
    for (i = 0; i < savedFields.length; i++) {
        localStorage.removeItem("bcfc_" + savedFields[i]);
    }
}

/* Remember Me checkbox handler.
   UNchecked: expire the cookie and delete all local data.
   REchecked: save the cookie and all current form data again. */
function applyRemember() {
    if (document.getElementById("remember").checked) {
        saveAllFields();
    } else {
        deleteCookie("firstname");
        clearLocalData();
    }
}

/* ============================================================
   Everything below is the Homework 3 validation code, unchanged
   except for two bug fixes:
   - validateForm() now calls checkID()  (was checkUserID)
   - checkPassword() now compares against patient-id (was userid)
   ============================================================ */

/* Clears the review output and re-hides Submit. Wired to the Reset button. */
function clearReview() {
    document.getElementById("outputformdata").innerHTML = "(You started over.)";
    document.getElementById("submitBtn").style.display = "none";
    document.getElementById("form-status").innerHTML = "";
}

/* Loops through every field in the form and redisplays the entered data. */
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
   a message to its own <span>. Returns true if valid, false if not.
*/

/* Email: force lower case, then validate */
function checkEmail() {
    var field = document.getElementById("patient-email");
    field.value = field.value.toLowerCase();   // force lower case
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
    var pid = document.getElementById("patient-id").value;
    if (pid !== "" && x === pid) {
        msg.className = "error";
        msg.innerHTML = "Password cannot be the same as your Patient ID.";
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

/* Middle Initial: optional, but if entered must be one letter */
function checkMI() {
    var x = document.getElementById("middlename").value;
    var msg = document.getElementById("mi-error");
    if (x === "") { msg.innerHTML = ""; return true; }
    if (!/^[A-Za-z]$/.test(x)) {
        msg.innerHTML = "Middle initial must be a single letter.";
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
    document.getElementById("ssn").type = "password";   // hide once they click away
    return true;
}

/* Address Line 1: required */
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

/* Address Line 2: optional, but if entered must be 2 to 30 characters */
function checkAddress2() {
    var x = document.getElementById("address2").value;
    var msg = document.getElementById("address2-error");
    if (x === "") { msg.innerHTML = ""; return true; }
    if (x.length < 2 || x.length > 30) {
        msg.innerHTML = "Address Line 2 must be 2 to 30 characters.";
        return false;
    }
    msg.innerHTML = "";
    return true;
}

/* City: required, 2 to 30 letters */
function checkCity() {
    var x = document.getElementById("city").value;
    var msg = document.getElementById("city-error");
    if (x === "") {
        msg.innerHTML = "City is required.";
        return false;
    }
    if (!/^[A-Za-z '-]{2,30}$/.test(x)) {
        msg.innerHTML = "City must be 2 to 30 letters.";
        return false;
    }
    msg.innerHTML = "";
    return true;
}

/* State: required, cannot be the blank first option */
function checkState() {
    var x = document.getElementById("state").value;
    var msg = document.getElementById("state-error");
    if (x === "") {
        msg.innerHTML = "Please choose a state.";
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

/* VALIDATE button: checks EVERY field, counts errors, and only
   reveals the real Submit button when the count is 0. Also used
   as the form's final onsubmit gate. On success it honors the
   Remember Me checkbox: save everything, or wipe everything. */
function validateForm() {
    var errors = 0;
    if (!checkEmail())     { errors++; }
    if (!checkID())        { errors++; }
    if (!checkPassword())  { errors++; }
    if (!checkConfirm())   { errors++; }
    if (!checkFirstname()) { errors++; }
    if (!checkMI())        { errors++; }
    if (!checkLastname())  { errors++; }
    if (!checkDOB())       { errors++; }
    if (!checkSSN())       { errors++; }
    if (!checkAddress())   { errors++; }
    if (!checkAddress2())  { errors++; }
    if (!checkCity())      { errors++; }
    if (!checkState())     { errors++; }
    if (!checkZip())       { errors++; }
    if (!checkPhone())     { errors++; }

    var status = document.getElementById("form-status");
    var submitBtn = document.getElementById("submitBtn");

    if (errors === 0) {
        status.className = "ok";
        status.innerHTML = "All fields look good. You can now submit.";
        submitBtn.style.display = "inline";
        // Remember Me: save or wipe, depending on the checkbox.
        if (document.getElementById("remember").checked) {
            setCookie("firstname", document.getElementById("firstname").value, 48);
            saveAllFields();
        } else {
            deleteCookie("firstname");
            clearLocalData();
        }
        return true;
    }
    status.className = "error";
    status.innerHTML = "Please fix the " + errors + " field(s) above, then click Validate again.";
    submitBtn.style.display = "none";
    return false;
}

/* End of document: homework4.js */

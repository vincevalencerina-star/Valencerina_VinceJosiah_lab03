/* Student Registration Form with Input Validation
   Pure validators are safe to load in Node (no document/window access at load time). */

// ---------- Patterns ----------
var STUDENT_NUMBER_PATTERN = /^\d{2}-\d{4}-\d{3}$/;
var EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;
var MOBILE_PATTERN = /^(09|\+639)\d{9}$/;
var PASSWORD_UPPER = /[A-Z]/;
var PASSWORD_DIGIT = /\d/;
var PASSWORD_SYMBOL = /[@$!]/;
var HAS_WHITESPACE = /\s/;

// ---------- Pure validation functions ----------
function isValidStudentNumber(value) {
  if (typeof value !== "string") return false;
  return STUDENT_NUMBER_PATTERN.test(value.trim());
}

function isValidPassword(value) {
  if (typeof value !== "string") return false;
  return (
    value.length >= 8 &&
    PASSWORD_UPPER.test(value) &&
    PASSWORD_DIGIT.test(value) &&
    PASSWORD_SYMBOL.test(value) &&
    !HAS_WHITESPACE.test(value)
  );
}

function isValidEmail(value) {
  if (typeof value !== "string") return false;
  return EMAIL_PATTERN.test(value.trim());
}

function isValidMobileNumber(value) {
  if (typeof value !== "string") return false;
  return MOBILE_PATTERN.test(value.trim());
}

function isValidFullName(value) {
  if (typeof value !== "string") return false;
  return value.trim().length >= 2;
}

function getPasswordProblems(value) {
  var problems = [];
  if (value.length < 8) problems.push("at least 8 characters");
  if (!PASSWORD_UPPER.test(value)) problems.push("an uppercase letter");
  if (!PASSWORD_DIGIT.test(value)) problems.push("a digit");
  if (!PASSWORD_SYMBOL.test(value)) problems.push("one of @, $, or !");
  if (HAS_WHITESPACE.test(value)) problems.push("no spaces");
  return problems;
}

// ---------- Browser behavior ----------
function initRegistrationForm() {
  var form = document.getElementById("registrationForm");
  if (!form) return;

  var $ = function (id) { return document.getElementById(id); };

  var fields = {
    fullName: { el: $("fullName"), err: $("fullNameError") },
    studentNumber: { el: $("studentNumber"), err: $("studentNumberError") },
    email: { el: $("email"), err: $("emailError") },
    mobileNumber: { el: $("mobileNumber"), err: $("mobileNumberError") },
    password: { el: $("password"), err: $("passwordError") },
    confirmPassword: { el: $("confirmPassword"), err: $("confirmPasswordError") },
    course: { el: $("course"), err: $("courseError") },
    terms: { el: $("terms"), err: $("termsError") }
  };

  var passwordFeedback = $("passwordFeedback");
  var successMessage = $("successMessage");
  var summary = $("registrationSummary");

  // Each checker returns an error message, or "" when the field is valid.
  var checkers = {
    fullName: function () {
      var v = fields.fullName.el.value.trim();
      if (v === "") return "Enter your full name.";
      if (v.length < 2) return "Full name must be at least 2 characters.";
      return "";
    },
    studentNumber: function () {
      var v = fields.studentNumber.el.value.trim();
      if (v === "") return "Student number is required.";
      if (!isValidStudentNumber(v)) return "Enter a student number in the format 24-1234-123.";
      return "";
    },
    email: function () {
      var v = fields.email.el.value.trim();
      if (v === "") return "Email address is required.";
      if (!isValidEmail(v)) return "Enter a valid email such as name@school.edu (no spaces, domain must contain a dot).";
      return "";
    },
    mobileNumber: function () {
      var v = fields.mobileNumber.el.value.trim();
      if (v === "") return "Mobile number is required.";
      if (!isValidMobileNumber(v)) return "Enter 09 or +639 followed by nine digits, with no spaces or hyphens.";
      return "";
    },
    password: function () {
      var v = fields.password.el.value;
      if (v === "") return "Password is required.";
      if (!isValidPassword(v)) return "Password needs " + getPasswordProblems(v).join(", ") + ".";
      return "";
    },
    confirmPassword: function () {
      var v = fields.confirmPassword.el.value;
      if (v === "") return "Confirm your password.";
      if (v !== fields.password.el.value) return "Passwords do not match.";
      return "";
    },
    course: function () {
      var v = fields.course.el.value;
      if (v !== "BSIT" && v !== "BSCS") return "Select BSIT or BSCS as your course.";
      return "";
    },
    terms: function () {
      if (!fields.terms.el.checked) return "You must agree to the terms to register.";
      return "";
    }
  };

  function showError(name, message) {
    var f = fields[name];
    f.err.textContent = message;
    f.el.setAttribute("aria-invalid", message ? "true" : "false");
  }

  function validateField(name) {
    var message = checkers[name]();
    showError(name, message);
    return message === "";
  }

  function updatePasswordFeedback() {
    var v = fields.password.el.value;
    passwordFeedback.classList.remove("ok", "bad");
    if (v === "") {
      passwordFeedback.textContent = "";
      return;
    }
    var problems = getPasswordProblems(v);
    if (problems.length === 0) {
      passwordFeedback.textContent = "Password meets all requirements.";
      passwordFeedback.classList.add("ok");
    } else {
      passwordFeedback.textContent = "Password still needs: " + problems.join(", ") + ".";
      passwordFeedback.classList.add("bad");
    }
  }

  function clearOutput() {
    successMessage.textContent = "";
    successMessage.hidden = true;
    summary.hidden = true;
    ["summaryName", "summaryStudentNumber", "summaryEmail", "summaryMobileNumber", "summaryCourse"]
      .forEach(function (id) { $(id).textContent = ""; });
  }

  function showSummary() {
    $("summaryName").textContent = fields.fullName.el.value.trim();
    $("summaryStudentNumber").textContent = fields.studentNumber.el.value.trim();
    $("summaryEmail").textContent = fields.email.el.value.trim();
    $("summaryMobileNumber").textContent = fields.mobileNumber.el.value.trim();
    $("summaryCourse").textContent = fields.course.el.value;
    successMessage.textContent = "Registration details validated successfully!";
    successMessage.hidden = false;
    summary.hidden = false;
  }

  // Submit: validate everything, block success if anything fails.
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    clearOutput();
    var allValid = true;
    var firstInvalid = null;
    Object.keys(fields).forEach(function (name) {
      if (!validateField(name)) {
        allValid = false;
        if (!firstInvalid) firstInvalid = fields[name].el;
      }
    });
    if (allValid) {
      showSummary();
    } else if (firstInvalid) {
      firstInvalid.focus();
    }
  });

  // Live password feedback (input event).
  fields.password.el.addEventListener("input", function () {
    updatePasswordFeedback();
    if (fields.password.el.getAttribute("aria-invalid") === "true") validateField("password");
    if (fields.confirmPassword.el.value !== "") validateField("confirmPassword");
  });

  // Full name: validate when leaving the field (blur event).
  fields.fullName.el.addEventListener("blur", function () { validateField("fullName"); });

  // Course and terms: change event.
  fields.course.el.addEventListener("change", function () { validateField("course"); });
  fields.terms.el.addEventListener("change", function () { validateField("terms"); });

  // Re-check a field as the user corrects it, so the old error disappears.
  ["fullName", "studentNumber", "email", "mobileNumber", "confirmPassword"].forEach(function (name) {
    fields[name].el.addEventListener("input", function () {
      if (fields[name].el.getAttribute("aria-invalid") === "true") validateField(name);
    });
  });

  // Reset: native reset restores control values; this clears every message and output.
  form.addEventListener("reset", function () {
    Object.keys(fields).forEach(function (name) { showError(name, ""); });
    passwordFeedback.textContent = "";
    passwordFeedback.classList.remove("ok", "bad");
    clearOutput();
  });

  clearOutput();
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initRegistrationForm);
  } else {
    initRegistrationForm();
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { isValidStudentNumber: isValidStudentNumber, isValidPassword: isValidPassword };
}

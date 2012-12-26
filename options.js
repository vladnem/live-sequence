// Save this script as `options.js`

// Saves options to localStorage.
function save_options() {
  var newDomain = document.getElementById("api-domain").value;

  localStorage["api"] = newDomain;
  
  // Update status to let user know options were saved.
  var status = document.getElementById("status");
  status.innerHTML = "Options Saved.";
  setTimeout(function() {
    status.innerHTML = "";
  }, 750);
}

// Restores select box state to saved value from localStorage.
function restore_options() {
  var domain = localStorage["api"];
  if (!domain) {
    return;
  }
  document.getElementById("api-domain").value = domain;
}

document.addEventListener('DOMContentReady', restore_options);
document.querySelector('#save').addEventListener('click', save_options);
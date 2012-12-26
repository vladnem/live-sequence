// Save this script as `options.js`

// Saves options to localStorage.
function save_options() {
  var newDomain = document.getElementById("api-domain").value;

  localStorage["api"] = newDomain;
  
  var select = document.getElementById("stylechoice");
  var style = select.children[select.selectedIndex].value;
  localStorage["style"] = style;
  
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
  if (domain) {
	  document.getElementById("api-domain").value = domain;
	}

  var style = localStorage["style"];
  if (!style) {
    return;
  }
  var select = document.getElementById("stylechoice");
  for (var i = 0; i < select.children.length; i++) {
    var child = select.children[i];
    if (child.value == style) {
      child.selected = "true";
      break;
    }
  }
}

document.addEventListener('DOMContentReady', restore_options);
document.querySelector('#save').addEventListener('click', save_options);
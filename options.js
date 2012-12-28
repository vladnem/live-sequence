// Saves options to localStorage.
function saveOptions() {
  var newDomain = document.getElementById("api-domain").value;

  localStorage["api"] = newDomain;
  
  var select = document.getElementById("stylechoice");
  var style = select.children[select.selectedIndex].value;
  localStorage["style"] = style;
  
  localStorage["toolbar"] = document.getElementById("show-errors").checked;
  
  // Update status to let user know options were saved.
  var status = document.getElementById("status");
  status.innerHTML = "Options Saved.";
  setTimeout(function() {
    status.innerHTML = "";
  }, 750);
}


document.addEventListener('DOMContentLoaded',function(){
	var domain = localStorage["api"];
	if (domain) {
	  document.getElementById("api-domain").value = domain;
	}
	
	var errors = localStorage["toolbar"];
	if (errors && (errors == "true")) {
		 document.getElementById("show-errors").checked = true;
	} else {
		 document.getElementById("show-errors").checked = false;
	}
	
	var style = localStorage["style"];
	if (style) {
		var select = document.getElementById("stylechoice");
		for (var i = 0; i < select.children.length; i++) {
			var child = select.children[i];
			if (child.value == style) {
				child.selected = "true";
				break;
			}
		}
	}
});

function resetOptions() {
	document.getElementById("show-errors").checked = true;
	document.getElementById("api-domain").value = "http://www.websequencediagrams.com";

	var select = document.getElementById("stylechoice");
	for (var i = 0; i < select.children.length; i++) {
		var child = select.children[i];
		if (child.value == "napkin") {
			child.selected = "true";
		} else {
			child.selected = null;
		}
	}

	saveOptions();
};

document.querySelector('#show-errors').addEventListener('change', saveOptions);
document.querySelector('#api-domain').addEventListener('blur', saveOptions);
document.querySelector('#stylechoice').addEventListener('change', saveOptions);


document.querySelector('#reset').addEventListener('click', resetOptions);
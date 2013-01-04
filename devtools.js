function getRequestBody(messages){
	console.log("panel->panel: setup request body");
	var body = "";
	var autonumber = localStorage["autonumber"];
	if (autonumber && (autonumber == "true")){
		body = "autonumber 0\n";
	}
			
	for (var i = 0; i < messages.length; i++){
		body += messages[i].text + "\n";
	}
	
	var style = "napkin";
	
	if (localStorage["style"]){
		style = localStorage["style"];
	}
	
	var options = {
		style: style,
		message: body,
		scale: 100,
		paginate:0,
		paper: "letter",
		landscape: 1,
		format: "png",
		apiVersion: 1
	};

	return options;
}

function displayStartLoading(panelDom) {
	console.log("panel->panel: display start loading");
	panelDom.getElementById("loading").style.display = "block";
	
};

function updateShare(panelDom, message) {
	console.log("panel->panel: update share");
	panelDom.getElementById("share").href = localStorage["api"] + "?m=" + encodeURIComponent(message);
	panelDom.getElementById("share").style.display = "block";
};

function displayEndLoading(panelDom) {
	console.log("panel->panel: display end loading");
	panelDom.getElementById("loading").style.display = "none";
};

function disableSplash(panelDom) {
	console.log("panel->panel: disable splash");
	panelDom.getElementById("missing").style.display = "none";
};

function enableSplash(panelDom) {
	console.log("panel->panel: enable splash");
	panelDomgetElementById("share").style.display = "none";
	panelDom.getElementById("missing").style.display = "block";
	panelDom.getElementById("diagram").style.display = "none";
	panelDom.getElementById("toolbar").style.display = "none";
};

function updateImage(panelDom, panelWindow, imageUrl) {
	console.log("panel->devtools: js updating diagram for\\n" + imageUrl);
	var image = panelDom.getElementById("diagram");
	image.src = imageUrl;
	image.style.display = "block";
	
	setTimeout(function() { 
		panelWindow.scrollTo(0, panelDom.body.scrollHeight); 
	}, 500);
};

function updateErrors(panelDom, errors) {
	var showToolbar = localStorage["toolbar"];
					
	if ((errors.length > 0) && showToolbar && (showToolbar == "true")){
		panelDom.getElementById("toolbar").style.display = "block";

		var errorsHtml = "";
		for (var i = 0; i < errors.length; i++){
			errorsHtml += "<li>" + errors[i] + "</li>";
		}
		
		panelDom.getElementById("error-list").innerHTML = errorsHtml;
		panelDom.getElementById("error-toggle").style.display = "block";
	} else {
		panelDom.getElementById("error-toggle").style.display = "none";
	}
};

function handleToggleErrors() {
	console.log("panel->panel: toggle errors");
	var section = window.panelWindow.document.getElementById("errors");
	if (section.style.display == "block"){
		section.style.display = "none";
	} else {
		section.style.display = "block";
	}
	return false;
};

function handlePageReloaded() {
	console.log("panel->panel: page reload");
	window.lastRequest = -1; 
}
function handlePageUnload() {
	if (window.interval) {
		console.log("panel->panel: page unload");
		window.clearInterval(window.interval);
		window.interval = null;
		window.lastRequest == -1;
	} else {
		console.log("panel->panel: no page to unload");
	}
};

function setupToolbar(panelDom) {
	console.log("panel->panel: setup toolbar");
	var showToolbar = localStorage["toolbar"];
	if (showToolbar && (showToolbar == "true")){
		panelDom.getElementById("toolbar").style.display = "block";
	} else {
		panelDom.getElementById("toolbar").style.display = "none";
	}
}

function handleCloseErrorsPane() {
	console.log("panel->panel: close errors pane");
	window.panelWindow.document.getElementById("errors").style.display = "none";
};

function attachHandlers(panelDom) {
	panelDom.getElementById("errors").onclick = handleCloseErrorsPane;
	panelDom.getElementById("error-toggle").onclick = handleToggleErrors;
	panelDom.addEventListener('DOMContentReady', handlePageReloaded);
	panelDom.onunload = handlePageUnload;
}

function requestDiagram(messages) {
	console.log("console->panel: " + messages.length + " messages received when\\nthe last update contained " + window.lastRequest);

	displayStartLoading(window.panelWindow.document);
	
	var body = getRequestBody(messages);
	
	chrome.extension.sendMessage({body: body}, function (response) {
		displayEndLoading(window.panelWindow.document);
		
		if (response.image) {
			updateShare(window.panelWindow.document, body["message"]);
			disableSplash(window.panelWindow.document);
			updateImage(window.panelWindow.document, window.panelWindow, response.image);
			updateErrors(window.panelWindow.document, response.errors);

			window.lastRequest = messages.length;
		} else {
			if (response.status == "final"){
				console.log("panel->panel: final image error");
				window.lastRequest = messages.length;
			}
			
			enableSplash(window.panelWindow.document);
		}
	});
}

function poolMessages() {
	console.log("panel->console: request messages");
	chrome.experimental.devtools.console.getMessages(function (messages){
		if ((messages.length != window.lastRequest) && (messages.length > 0)) {
			requestDiagram(messages);
		} else {
			console.log("console->panel: still " + window.lastRequest + " messages received\\nno update");
		}
	});
};

function handleShowPanel(newWindow) {
	console.log("devtools->panel: show");
	
	if (!window.interval) {
		console.log("note over panel: init window");
		window.panelWindow = newWindow;
		
		attachHandlers(window.panelWindow.document);
		setupToolbar(window.panelWindow.document);
		
		poolMessages();
		
		window.interval = window.setInterval(poolMessages, 1000);
		console.log("panel->panel: ticker #" + window.interval + " started");
	} else {
		console.log("note over panel: ticker already defined");
	}
};

var lastRequest = -1;
var panelWindow = null;
var interval = null;

chrome.devtools.panels.create("Live Sequence",
                              "live-sequence.png",
                              "panel.html",
    function(panel) {
		console.log("devtools->panel: panel created");
		panel.onShown.addListener(handleShowPanel);
		panel.onHidden.addListener(handlePageUnload);
	}
);

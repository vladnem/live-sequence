function getRequestBody(messages){
	var body = "";

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

var lastRequest = -1;
var panelWindow = null;
var interval = null;

chrome.devtools.panels.create("Live Sequence",
                              "live-sequence.png",
                              "panel.html",
                              
    function(panel) {

		panel.onShown.addListener(function (newWindow) {
			console.log("devtools js on show");
			window.panelWindow = newWindow;
		
			window.panelWindow.document.getElementById("errors").onclick = function () {
				window.panelWindow.document.getElementById("errors").style.display = "none";
			};
			
			window.panelWindow.document.getElementById("error-toggle").onclick = function () {
				var section = window.panelWindow.document.getElementById("errors");
				if (section.style.display == "block"){
					section.style.display = "none";
				} else {
					section.style.display = "block";
				}
				return false;
			};
			
			window.panelWindow.document.addEventListener('DOMContentReady', function() { 
				window.lastRequest = -1; 
			});
			
			var showToolbar = localStorage["toolbar"];
			if (showToolbar && (showToolbar == "true")){
				window.panelWindow.document.getElementById("toolbar").style.display = "block";
			} else {
				window.panelWindow.document.getElementById("toolbar").style.display = "none";
			}

			function drawDiagram() {
				console.log("draw diagram");
				chrome.experimental.devtools.console.getMessages(function (messages){
					if (messages.length > window.lastRequest) {
						var body = getRequestBody(messages);
						console.log(body);
						if (body.length > 0) {
							window.panelWindow.document.getElementById("loading").style.display = "block";
						}
						
						window.panelWindow.document.getElementById("share").href = localStorage["api"] + "?m=" + encodeURIComponent(body["message"]);
						
						chrome.extension.sendMessage({body: body}, function (response) {
							window.panelWindow.document.getElementById("loading").style.display = "none";
							if (response.image) {
								window.panelWindow.document.getElementById("share").style.display = "block";
								
								window.panelWindow.document.getElementById("missing").style.display = "none";
								console.log("devtools js updating diagram for " + response.image);
								var image = window.panelWindow.document.getElementById("diagram");
								image.src = response.image;
								
								if (window.lastRequest == -1) {
									image.style.display = "block";
								}
								
								window.lastRequest = messages.length;
								setTimeout(function(){ 
									window.panelWindow.scrollTo(0, window.panelWindow.document.body.scrollHeight); 
								}, 1000);
								
								var showErrors = localStorage["toolbar"];
								
								if ((response.errors.length > 0) && showErrors && (showErrors == "true")){
									window.panelWindow.document.getElementById("toolbar").style.display = "block";
									var errorsHtml = "";
									for (var i = 0; i < response.errors.length; i++){
										errorsHtml += "<li>" + response.errors[i] + "</li>";
									}
									//window.panelWindow.document.getElementById("error-toggle").innerHTML = response.errors.length;
									window.panelWindow.document.getElementById("error-list").innerHTML = errorsHtml;

									window.panelWindow.document.getElementById("error-toggle").style.display = "block";
								} else {
									window.panelWindow.document.getElementById("error-toggle").style.display = "none";
								}
							} else {
								window.panelWindow.document.getElementById("share").style.display = "none";
								window.panelWindow.document.getElementById("missing").style.display = "block";
								window.panelWindow.document.getElementById("toolbar").style.display = "none";
								console.log("devtools js message sent; no response");
							}
						});
					}
				});
			};

			drawDiagram();
			if (!window.interval){
				window.interval = window.setInterval(drawDiagram, 1000);
			}
			
		});

		panel.onHidden.addListener(function () {
			window.lastRequest == -1;
		});
});

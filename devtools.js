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
		apiVersion: 1,
		width: 916
	};

	return options;
}

chrome.devtools.panels.create("Live Sequence",
                              "",
                              "panel.html",
                              
    function(panel) {
		var lastRequest = -1;
		var interval = null;

		panel.onShown.addListener(function (window) {
			console.log("devtools js on show");

			function drawDiagram() {
				console.log("draw diagram");
				chrome.experimental.devtools.console.getMessages(function (messages){
					if (messages.length > lastRequest) {
						var body = getRequestBody(messages);
						console.log(body);
						chrome.extension.sendMessage({body: body}, function (response) {
							if (response) {
								console.log("devtools js updating diagram for " + response);
								var image = window.document.getElementById("diagram");								
								image.src = response;
								
								if (lastRequest == -1) {
									image.style.display = "block";
								}
								
								lastRequest = messages.length;
								//window.scrollTop = window.scrollHeight;
							} else {
								console.log("devtools js message sent; no response");
							}
						});
					}
				});
			}

			drawDiagram();
			if (!interval){
				interval = setInterval(drawDiagram, 1000);
			}
		});

		panel.onHidden.addListener(function (window) {
			var image = window.document.getElementById("diagram");
			image.style.display = "block";
			lastRequest == -1;
								
			clearInterval(interval);
		});
});

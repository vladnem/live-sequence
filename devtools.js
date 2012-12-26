function getRequestBody(messages){
	var body = "";

	for (var i = 0; i < messages.length; i++){
		body += messages[i].text + "\n";
	}
	
	var options = {
		message: body,
		style: "default",
		scale: 100,
		paginate:0,
		paper: "letter",
		landscape: 0,
		format: "png",
		apiVersion: 1,
		width: 916
	};

	return options;
}

chrome.devtools.panels.create("Live Sequence",
                              "livesequence.jpg",
                              "panel.html",
                              
    function(panel) {
		panel.onShown.addListener(function (window) {
			console.log("devtools js on show");
			var lastRequest = -1;
			var interval = null;

			function drawDiagram() {
				console.log("draw diagram");
				chrome.experimental.devtools.console.getMessages(function (messages){
					if (messages.length > lastRequest) {
						var body = getRequestBody(messages);
						console.log(body);
						chrome.extension.sendMessage({body: body}, function (response) {
							if (response) {
								lastRequest = messages.length;
								console.log("devtools js updating diagram for " + response);
								var image = window.document.getElementById("diagram");
								image.src = response;
								image.style.display = "block";
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
				interval = setInterval(drawDiagram, 1500);
			}
		});
		
});

chrome.extension.onMessage.addListener(function(request, sender, callback) {
	console.log("diagram refresh reqest");
	var domain = "http://www.websequencediagrams.com";
	
	if (localStorage["api"]){
		domain = localStorage["api"];
	}
	
	console.log("background->WSD: get image code from domain\\n" + domain + " and body length " + request.body.message.length);
	getData(request.body, domain, callback);
	return true;
});

function getData(body, domain, callback){
	var page = "/index.php";
	
	var params = [];
	var first = true;
	for (var key in body){
	    params.push(key + "=" + encodeURIComponent(body[key]));
	}

	var xhr = new XMLHttpRequest();
	xhr.open("POST", domain + page, false);
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhr.send(params.join("&"));

	try {
		console.log("WSD->backgound: some response received");
		var response = JSON.parse(xhr.responseText);
		if (response.img) {
			if (response.naturalWidth != 0) {
				console.log("backgound->panel: correct data\\nrequest paint");
				callback({image: domain + page + response.img, errors: response.errors, status: "retry"});
			} else {
				console.log("backgound->panel: 0 width image\\nrequest retry");
				callback({image: null, errors: [], status: "final"});
			}
		}
	} catch (e){
		console.log("backgound->panel: wrong response format\\nrequest retry");
		callback({image: null, errors: [], status: "retry"});
	}
};

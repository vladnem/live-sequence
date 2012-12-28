chrome.extension.onMessage.addListener(function(request, sender, callback) {
	console.log("diagram refresh reqest");
	var domain = "http://www.websequencediagrams.com";
	
	if (localStorage["api"]){
		domain = localStorage["api"];
	}
	
	getData(request.body, domain, callback);
	return true;
});

function getData(body, domain, callback){
	console.log("get data");
		
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
		var response = JSON.parse(xhr.responseText);
		if (response.img) {
			if (response.naturalWidth != 0) {
				callback({image: domain + page + response.img, errors: response.errors});
			} else {
				callback({image: null, errors: []});
			}
		}
	} catch (e){
		;
	}
};

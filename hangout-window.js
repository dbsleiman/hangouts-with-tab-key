console.log('loaded in ' + document.domain + ' with url ' + document.URL);

var parentDomain = window.parent.document.domain;
var inputDiv = null;
var windowId = null;

if (parentDomain == 'mail.google.com') {
	// observe the body for mutations
	var observer = new MutationObserver(function(mutations) {
		mutations.forEach(function(mutation) {
			if (mutation.type == 'attributes' && mutation.attributeName == 'cid') {
				windowId = document.body.getAttribute('cid');
				console.log(windowId);
				observer.disconnect();
				init();
			}
		});
	});

	var config = { attributes: true };
	observer.observe(document.body, config);

	// automatically disconnect observer after 15 seconds
	setTimeout(function() {
		observer.disconnect();
	}, 15000);
} else {
	windowId = document.URL;
	init();
}

function init() {
	if (isHangoutWindow() && windowId) {
		window.onkeydown = window.parent.onKeyDownHandler;
		window.onunload = onUnload;

		// since the html is being provided via ajax, we need to tap into the dom manipulation events
		document.addEventListener("DOMNodeInserted", onDomNodeInserted);	

		console.log('about to send message with windowId = ' + windowId);
		chrome.runtime.sendMessage({
			action: 'newWindow', 
			windowId: windowId
		});

		chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
			if (message.action == 'focusWindow' && message.windowId == windowId && inputDiv != null) {
				console.log('about to focus on window');
				inputDiv.focus();
			}
		});
	}	
}


function onUnload() {
	console.log('closing hangout window');
	chrome.runtime.sendMessage({
		action: 'closeWindow', 
		windowId: windowId
	});
}

function isHangoutWindow() {
	if (parentDomain == 'inbox.google.com')
		return document.URL.indexOf('#egtn') > -1;
	else if (parentDomain == 'mail.google.com')
		return document.URL.indexOf('#epreld') > -1;
}

function onDomNodeInserted(e) {
	if (!e.target)
		return;

	// find the div with the "dQ" class
	var elements = document.querySelectorAll('.dQ')
	if (elements.length > 0) {
		inputDiv = elements[0];
		inputDiv.addEventListener("focus", function() { window.parent.hangoutWindowGotFocus(windowId); });
		document.removeEventListener("DOMNodeInserted", onDomNodeInserted);
	}
}
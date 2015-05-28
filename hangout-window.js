(function() {

var parentDomain = window.parent.document.domain;
var inputDiv = null;
var windowId = null;

if (!isHangoutWindow()) {
	return;
}

//console.log('loaded in ' + document.domain + ' with url ' + document.URL);

if (parentDomain == 'mail.google.com') {
	// observe the body for mutations
	var windowIdObserver = new MutationObserver(function(mutations) {
		mutations.forEach(function(mutation) {
			if (mutation.type == 'attributes' && mutation.attributeName == 'cid') {
				windowId = document.body.getAttribute('cid');
				checkForNecessaryItems();
			}
		});
	});

	windowIdObserver.observe(document.body, { attributes: true });
} else {
	windowId = document.URL;
	checkForNecessaryItems();
}

var inputDivObserver = new MutationObserver(function(mutations) {
	mutations.forEach(function(mutation) {
		if (mutation.type == 'childList' && mutation.addedNodes && mutation.addedNodes.length > 0 && !inputDiv) {
			inputDiv = mutation.target.querySelector("div.editable");
			if (inputDiv) {
				checkForNecessaryItems();
			}
		}
	});
});

inputDivObserver.observe(document.body, { childList: true });

var hasInitialized = false;
function checkForNecessaryItems() {
	if (inputDiv && windowId && !hasInitialized) {
		hasInitialized = true;
		init();
	}
}

function init() {
	
	window.onkeydown = window.parent.onKeyDownHandler;
	window.onunload = onUnload;

	chrome.runtime.sendMessage({
		action: 'newWindow', 
		windowId: windowId
	});

	chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
		if (message.action == 'focusWindow' && message.windowId == windowId && inputDiv != null) {
			inputDiv.focus();
		}
	});

	inputDiv.addEventListener("focus", function() { window.parent.hangoutWindowGotFocus(windowId); });
}


function onUnload() {
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


})();
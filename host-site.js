//console.log('loaded in ' + document.domain)

var hostDomains = ["mail.google.com", "inbox.google.com"];

var hangoutWindows = [];
var hangoutWindowTargetIndex = null;

window.onkeydown = onKeyDownHandler;

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	if (message.action == 'newWindow') {
		addWindowIdToArray(message.windowId);
	} else if (message.action == "closeWindow") {
		var indexOfItem = hangoutWindows.indexOf(message.windowId);
		if (indexOfItem != -1) {
			hangoutWindows.splice(indexOfItem, 1);
		}
	}
});

function onKeyDownHandler(e) {
	if (hangoutWindows.length == 0)
		return;

	if (e.keyCode == '9') {  // tab
		var reverse = false;
		if (e.shiftKey) {
			reverse = true;
		}

		var setToStartIndex = false;
		if (hostDomains.indexOf(e.view.document.domain) != -1) {
			setToStartIndex = true;
		}

		setNextIndex(reverse, setToStartIndex);

		e.preventDefault();
		chrome.runtime.sendMessage({
			action: 'focusWindow',
			windowId: hangoutWindows[hangoutWindowTargetIndex]
		});
	}	
}

function setNextIndex(reverse, setToStartIndex) {
	var startIndex;
	if (reverse) {
		hangoutWindowTargetIndex++;
		startIndex = 0;
	}
	else {
		hangoutWindowTargetIndex--;
		startIndex = hangoutWindows.length - 1
	}

	if (setToStartIndex) {
		hangoutWindowTargetIndex = startIndex;
	} else if (hangoutWindowTargetIndex < 0 || hangoutWindowTargetIndex >= hangoutWindows.length) {
		// check to see if next index is out of range
		hangoutWindowTargetIndex = startIndex;  // index out of range, set back to start
	}
}

function hangoutWindowGotFocus(windowId) {
	addWindowIdToArray(windowId);
	hangoutWindowTargetIndex = hangoutWindows.indexOf(windowId);
}

function addWindowIdToArray(windowId) {
	if (hangoutWindows.indexOf(windowId) == -1) {
		hangoutWindows.push(windowId);	
	};
}


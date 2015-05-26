console.log('loaded in ' + document.domain)

var hangoutWindows = [];
var hangoutWindowTargetIndex = null;

window.onkeydown = onKeyDownHandler;

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	if (message.action == 'newWindow') {
		hangoutWindows.push(message.windowId);
	} else if (message.action == "closeWindow") {
		var indexOfItem = hangoutWindows.indexOf(message.windowId);
		if (indexOfItem != -1) {
			hangoutWindows.splice(indexOfItem, 1);
		}
	}	
});

function onKeyDownHandler(e) {
	console.log(hangoutWindows);
	if (hangoutWindows.length == 0)
		return;

	if (e.keyCode == '9') {  // tab
		var reverse = false;
		if (e.shiftKey) {
			reverse = true;
		}
		setNextIndex(reverse);

		console.log('current index = ' + hangoutWindowTargetIndex);
		e.preventDefault();
		chrome.runtime.sendMessage({
			action: 'focusWindow',
			windowId: hangoutWindows[hangoutWindowTargetIndex]
		});
	}	
}

function setNextIndex(reverse) {
	if (hangoutWindows.length == 0)
		return;

	var startIndex;
	if (reverse) {
		hangoutWindowTargetIndex++;
		startIndex = 0;
	}
	else {
		hangoutWindowTargetIndex--;
		startIndex = hangoutWindows.length - 1
	}

	// check to see if next index is out of range
	if (hangoutWindowTargetIndex < 0 || hangoutWindowTargetIndex >= hangoutWindows.length) {
		hangoutWindowTargetIndex = startIndex;  // index out of range, set back to start
	}
}

function hangoutWindowGotFocus(windowId) {
	console.log('got focus on window with id = ' + windowId);
	hangoutWindowTargetIndex = hangoutWindows.indexOf(windowId);
}

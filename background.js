console.log('loaded background script');

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	chrome.tabs.sendMessage(sender.tab.id, message);
});
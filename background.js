chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    let keys = Object.keys(message)
    
    if(keys.includes("link")){
        message.link.forEach(element => {
            chrome.tabs.create({ url: element });
            chrome.tabs.query({active: true}, function(tabs){
                chrome.scripting.executeScript({
                  target: {
                    tabId: tabs[0].id,
                  },
                  files: ["articleReader.js"],
                });
            });
        });
    }
    else {
        chrome.downloads.download({
            'url': 'data:text/csv,' + message[keys[0]],
            'filename': `${keys[0]}.csv`
        });
    }
});

chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.sendMessage(tab.id, tab.url);
  });
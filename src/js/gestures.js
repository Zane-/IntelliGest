export let gestureActions = {
  "neutral": function(probability) {
    return; // do nothing
  },
	"scroll-up": function(probability) {
		if (probability >= 0.7) {
			window.scrollBy(0, -20);
		}
	},
	"scroll-down": function(probability) {
		if (probability >= 0.7) {
			window.scrollBy(0, 20);
		}
  },
  "tab-prev": function(probability) {
    if (probability >= 0.9) {
      chrome.tabs.query({currentWindow: true}, function(tabs) {
        // Sort tabs according to their index in the window.
        tabs.sort((a, b) => { return a.index < b.index; });
        let activeIndex = tabs.findIndex((tab) => { return tab.active; });
        let lastTab = tabs.length - 1;
        let newIndex = activeIndex === lastTab ? 0 : activeIndex + 1;
        chrome.tabs.update(tabs[newIndex].id, {active: true, highlighted: true});
      });
    }
	},
	"tab-next": function(probability) {
		if (probability >= 0.7) {
      chrome.tabs.query({currentWindow: true}, function(tabs) {
        // Sort tabs according to their index in the window.
        tabs.sort((a, b) => { return a.index < b.index; });
        let activeIndex = tabs.findIndex((tab) => { return tab.active; });
        let lastTab = tabs.length - 1;
        let newIndex = activeIndex === 0 ? lastTab : activeIndex - 1;
        chrome.tabs.update(tabs[newIndex].id, {active: true, highlighted: true});
      });
		}
	},

	"tab-new": function(probability) {
		if (probability >= 0.9) {
			chrome.tabs.create();
		}
	},
	"tab-close": function(probability) {
		if (probability >= 0.93) {
			chrome.tabs.getCurrent(function(tab) {
				chrome.tabs.remove(tab.id);
			});
		}
	},
};

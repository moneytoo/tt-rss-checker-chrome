/* Handle showing of new item count and polling the TT-RSS server. */

var site_url;
var login;
var update_interval;
var single_user;
var badge_type;

function load_options() {
	chrome.storage.sync.get({
		site_url: null,
		login: 'admin',
		update_interval: 5,
		single_user: false,
		badge_type: '1',
	}, function(items) {
		site_url = items.site_url;
		login = items.login;
		update_interval = items.update_interval;
		single_user = items.single_user;
		badge_type = items.badge_type;

		init();
	});
}

function update() {
	//console.log('update ' + new Date());

	try {
		var requestUrl = site_url + '/public.php';
		var params = 'op=getUnread&fresh=1&login=' + encodeURIComponent(single_user ? 'admin' : login);

		var xhr = new XMLHttpRequest();

		xhr.open('POST', requestUrl, true);
		xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				var icon = new Object();
				var title = new Object();
				var badge = new Object();
				var badge_color = new Object();

				// init stuff
				icon.path = 'images/normal.png';
				title.title = '';
				badge.text = '';
				badge_color.color = [0, 0, 0, 0];

				if (xhr.status == 200) {
					var response = xhr.responseText.split(';');

					var unread = parseInt(response[0]) || 0;

					var fresh = 0;

					if (response.length == 2)
						fresh = parseInt(response[1]) || 0;

					if (unread > 0) {
						icon.path = 'images/alert.png';
						title.title = '%s unread articles'.replace('%s', unread);

						if (badge_type == '2' && fresh > 0) {
							badge.text = fresh + '';
							badge_color.color = [0, 200, 0, 255];
						} else if (badge_type == '1') {
							badge.text = unread + '';
							badge_color.color = [255, 0, 0, 255];
						}
					} else if (unread == -1) {
						icon.path = 'images/error.png';

						var errorMsg = xhr.responseText.split(';')[1];

						title.title = 'Error: %s.'.replace('%s', errorMsg.trim());
					} else {
						title.title = 'No unread articles';
					}

					localStorage['last_updated'] = new Date().getTime();
					localStorage['last_error'] = '';
				} else {
					localStorage['last_error'] = xhr.responseText;

					icon.path = 'images/error.png';
					title.title = 'Error (%s) while updating'.replace('%s', xhr.status);
				}

				chrome.browserAction.setBadgeBackgroundColor(badge_color);
				chrome.browserAction.setBadgeText(badge);
				chrome.browserAction.setTitle(title);
				chrome.browserAction.setIcon(icon);
			}
		};

		xhr.send(params);
	} catch (e) {
		console.warn(e);
	}
}

function is_newtab(url) {
	return url.indexOf('chrome://newtab/') == 0;
}

function is_site_url(url) {
	return url.indexOf(site_url) == 0;
}

function reset_alarm() {
	chrome.alarms.clearAll(function() {
		if (chrome.alarms.onAlarm.hasListener(update))
			chrome.alarms.onAlarm.removeListener(update);

		chrome.alarms.create("update", {periodInMinutes: update_interval});
		chrome.alarms.onAlarm.addListener(update);
	});
}

function init() {
	chrome.storage.onChanged.addListener(function(changes, namespace) {
		for (key in changes) {
			var storageChange = changes[key];
			if (key == "site_url")
				site_url = storageChange.newValue;
			else if (key == "login")
				login = storageChange.newValue;
			else if (key == "update_interval") {
				update_interval = storageChange.newValue;
				reset_alarm();
			} else if (key == "single_user")
				single_user = storageChange.newValue;
			else if (key == "badge_type")
				badge_type = storageChange.newValue;
		}
		update();
	});

	chrome.browserAction.onClicked.addListener(function() {
		//console.log('click');
		if (site_url) {
			chrome.tabs.query({currentWindow: true}, function(tabs) {
				// try to find already opened tab
				for (var i = 0; i < tabs.length; i++) {
					if (tabs[i].url && is_site_url(tabs[i].url)) {
						chrome.tabs.update(tabs[i].id, {active: true}, function(tab) {
							update();
						});
						return;
					}
				}

				chrome.tabs.query({currentWindow: true, active: true}, function(tabs_active) {
					var tab_to_remove;
					if (tabs_active[0].url && is_newtab(tabs_active[0].url))
						tab_to_remove = tabs_active[0].id;
					chrome.tabs.create({url: site_url}, function(tab) {
						if (tab_to_remove)
							chrome.tabs.remove(tab_to_remove);
						update();
					});
				});
			});
		} else {
			chrome.runtime.openOptionsPage();
		}
	});

	if (site_url != null) {
		update();
		reset_alarm();
	}
}

load_options();

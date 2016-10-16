/* Handle showing of new item count and polling the TT-RSS server. */

var last_updated = 0;
var prefs_last_updated = 0;

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

function param_escape(arg) {
  if (typeof encodeURIComponent != 'undefined')
    return encodeURIComponent(arg);
  else
    return escape(arg);
}

function update() {
  //console.log('update');

  var d = new Date();

  if (single_user) login = 'admin';

  var requestUrl = site_url + '/public.php';
  var params = 'op=getUnread&fresh=1&login=' + param_escape(login);

  var xhr = new XMLHttpRequest();

  xhr.open('POST', requestUrl, true);
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhr.send(params);

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

        var unread = parseInt(response[0]);

        if (isNaN(unread)) unread = 0;

        var fresh;

        if (response.length == 2)
          fresh = parseInt(response[1]);
        else
          fresh = 0;

        if (isNaN(fresh)) fresh = 0;

        if (unread > 0) {
          icon.path = 'images/alert.png';
          title.title = '%s unread articles'.replace('%s', unread);

          if (badge_type == '2' && fresh > 0) {
            badge.text = fresh + '';
            badge_color.color = [0, 200, 0, 255];
          } else {
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

        localStorage['last_updated'] = d.getTime();
        localStorage['last_error'] = '';
      } else {
        localStorage['last_error'] = xhr.responseText;

        icon.path = 'images/error.png';
        title.title = 'Error (%s) while updating'.replace('%s', xhr.status);
      }

      if (badge_type == '0') badge.text = '';

      chrome.browserAction.setBadgeBackgroundColor(badge_color);
      chrome.browserAction.setBadgeText(badge);
      chrome.browserAction.setTitle(title);
      chrome.browserAction.setIcon(icon);
    }
  };
}

function timeout() {
  var prefs_updated;

  if (localStorage['prefs_updated'])
    prefs_updated = localStorage['prefs_updated'];
  else
    prefs_updated = -1;

  var d = new Date();

  if (d.getTime() > last_updated + update_interval * 60 * 1000 ||
      prefs_updated != prefs_last_updated) {
    last_updated = d.getTime();
    try {
      update();
    } catch (e) {
      console.warn(e);
    }
  }

  prefs_last_updated = prefs_updated;
}

function is_newtab(url) {
	return url.indexOf('chrome://newtab/') == 0;
}

function is_site_url(url) {
	return url.indexOf(site_url) == 0;
}

function init() {
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (key in changes) {
      var storageChange = changes[key];
      if (key == "site_url")
        site_url = storageChange.newValue;
      else if (key == "login")
        login = storageChange.newValue;
      else if (key == "update_interval")
        update_interval = storageChange.newValue;
      else if (key == "single_user")
        single_user = storageChange.newValue;
      else if (key == "badge_type")
        badge_type = storageChange.newValue;
    }
    timeout();
  });

  chrome.browserAction.onClicked.addListener(function() {
    if (site_url) {
      // try to find already opened tab
      chrome.tabs.query({currentWindow: true}, function(tabs) {

        var found_existing = false;

        for (var i = 0, tab; tab = tabs[i]; i++) {
          if (tab.url && is_site_url(tab.url)) {
            chrome.tabs.update(tab.id, {highlighted: true});
            update();
            found_existing = true;
            return;
          }
        }

        // check if current tab is newtab (only if not updated yet)
        if (!found_existing) {
          chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
            if (tabs[0].url && is_newtab(tabs[0].url)) {
              chrome.tabs.create({url: site_url}, function(tab) {
                chrome.tabs.remove(tabs[0].id);
              });
            } else {
              chrome.tabs.create({url: site_url});
            }
          });
        } // (if (!found_existing))

      });

    } else {
      chrome.runtime.openOptionsPage();
    }
  });

  // TODO: Create smarter algorithm that sets `periodInMinutes` to
  // `feeds_update_interval` and updates the `alarm` object when extension
  // preferences are saved.
  timeout();
  chrome.alarms.create({periodInMinutes: 1});
  chrome.alarms.onAlarm.addListener(function() {timeout();});
}

load_options();


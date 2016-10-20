/* Option handling. */

function save() {
	var s = $('status');

	var site_url = document.getElementById('site_url').value;
	var login = document.getElementById('login').value;
	var update_interval = parseInt(document.getElementById('update_interval').value);
	var single_user = document.getElementById('single_user').checked;
	var badge_type = document.getElementById('badge_type').value;

	if (site_url.length < 1) {
		s.innerHTML = 'Error: Site url cannot be blank.';
		new Effect.Highlight(document.getElementById('site_url'));
		Element.show(s);
	} else if (login.length < 1 && !single_user) {
		s.innerHTML = 'Error: Login cannot be blank.';
		new Effect.Highlight(document.getElementById('login'));
		Element.show(s);
	} else if (update_interval < 1) {
		s.innerHTML = 'Error: Update interval must be greater than zero.';
		new Effect.Highlight(document.getElementById('update_interval'));
		Element.show(s);
	} else {
		chrome.storage.sync.set({
			site_url: site_url,
			login: login,
			update_interval: update_interval,
			single_user: single_user,
			badge_type: badge_type,
		}, function() {
			s.innerHTML = 'Options saved successfully.';
			Element.show(s);

			setTimeout(function() {
				s.innerHTML = '';
			}, 750);
		});
	}

	return false;
}

function single_user_toggle() {
	document.getElementById('login').disabled = document.getElementById('single_user').checked;
}

function init() {
	chrome.storage.sync.get({
		site_url: 'http://example.com/tt-rss/',
		login: 'admin',
		update_interval: 5,
		single_user: false,
		badge_type: '1',

	}, function(items) {
		document.getElementById('site_url').value = items.site_url;
		document.getElementById('login').value = items.login;
		document.getElementById('update_interval').value = items.update_interval;
		document.getElementById('single_user').checked = items.single_user;
		document.getElementById('badge_type').value = items.badge_type;

		single_user_toggle();
	});

	var last_updated = $('last_updated');
	var d = new Date();
	d.setTime(localStorage['last_updated']);
	last_updated.innerHTML = d;
}

document.addEventListener('DOMContentLoaded', function() {
	document.getElementById('save').addEventListener('click', save);
	document.querySelectorAll('input[id$="single_user"]')[0].addEventListener(
		'change', single_user_toggle);
	init();
});

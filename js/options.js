/* Option handling. */

function save() {

  var s = $('status');

  s.innerHTML = 'Options saved successfully.';

  var f = document.forms['options'];

  if (f.site_url.value.length > 0)
    localStorage['site_url'] = f.site_url.value;
  else {
    s.innerHTML = 'Error: Site url cannot be blank.';
    new Effect.Highlight(f.site_url);
  }

  if (f.login.value.length > 0)
    localStorage['login'] = f.login.value;
  else {
    s.innerHTML = 'Error: Login cannot be blank.';
    new Effect.Highlight(f.login);
  }

  var update_interval = parseInt(f.update_interval.value);

  if (update_interval > 0)
    localStorage['update_interval'] = f.update_interval.value;
  else {
    s.innerHTML = 'Error: Update interval must be greater than zero.';
    new Effect.Highlight(f.update_interval);
  }

  localStorage['show_badge'] = (f.show_badge.checked) ? '1' : '0';
  localStorage['show_fresh'] = (f.show_fresh.checked) ? '1' : '0';
  localStorage['single_user'] = (f.single_user.checked) ? '1' : '0';
  localStorage['update_feeds'] = (f.update_feeds.checked) ? '1' : '0';

  var d = new Date();

  localStorage['prefs_updated'] = d.getTime();

  Element.show(s);

  return false;
}

function single_user_toggle() {
  var f = document.forms['options'];

  f.login.disabled = f.single_user.checked;
}

function init() {
  var f = document.forms['options'];

  if (localStorage['site_url'])
    f.site_url.value = localStorage['site_url'];
  else
    f.site_url.value = 'http://example.dom/tt-rss/';

  if (localStorage['login'])
    f.login.value = localStorage['login'];
  else
    f.login.value = 'user';

  if (localStorage['update_interval'])
    f.update_interval.value = localStorage['update_interval'];
  else
    f.update_interval.value = '15';

  if (localStorage['show_badge'])
    f.show_badge.checked = localStorage['show_badge'] == '1';
  else
    f.show_badge.checked = true;

  if (localStorage['show_fresh'])
    f.show_fresh.checked = localStorage['show_fresh'] == '1';
  else
    f.show_fresh.checked = false;

  if (localStorage['single_user'])
    f.single_user.checked = localStorage['single_user'] == '1';
  else
    f.single_user.checked = false;

  if (localStorage['update_feeds'])
    f.update_feeds.checked = localStorage['update_feeds'] == '1';
  else
    f.update_feeds.checked = false;

  single_user_toggle();

  var last_updated = $('last_updated');

  var d = new Date();

  d.setTime(localStorage['last_updated']);

  last_updated.innerHTML = d;

  var feeds_last_updated = $('feeds-last-updated');

  d.setTime(localStorage['last_feeds_updated']);

  feeds_last_updated.innerHTML = d;
}

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('options').addEventListener('submit', save);
  document.querySelectorAll('input[name$="single_user"]')[0].addEventListener(
    'change', single_user_toggle);
  init();
});


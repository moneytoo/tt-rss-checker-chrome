/* Option handling. */

function save() {
  var s = $('status');

  s.innerHTML = 'Options saved successfully.';

  if (document.getElementById('site_url').value.length > 0)
    localStorage['site_url'] = document.getElementById('site_url').value;
  else {
    s.innerHTML = 'Error: Site url cannot be blank.';
    new Effect.Highlight(document.getElementById('site_url'));
  }

  if (document.getElementById('login').value.length > 0)
    localStorage['login'] = document.getElementById('login').value;
  else {
    s.innerHTML = 'Error: Login cannot be blank.';
    new Effect.Highlight(document.getElementById('login'));
  }

  var update_interval = parseInt(document.getElementById('update_interval').value);

  if (update_interval > 0)
    localStorage['update_interval'] = document.getElementById('update_interval').value;
  else {
    s.innerHTML = 'Error: Update interval must be greater than zero.';
    new Effect.Highlight(document.getElementById('update_interval'));
  }

  localStorage['single_user'] = (document.getElementById('single_user').checked) ? '1' : '0';
  localStorage['badge_type'] = document.getElementById('badge_type').value;

  var d = new Date();

  localStorage['prefs_updated'] = d.getTime();

  Element.show(s);

  return false;
}

function single_user_toggle() {
  document.getElementById('login').disabled = document.getElementById('single_user').checked;
}

function init() {
  if (localStorage['site_url'])
    document.getElementById('site_url').value = localStorage['site_url'];
  else
    document.getElementById('site_url').value = 'http://example.dom/tt-rss/';

  if (localStorage['login'])
    document.getElementById('login').value = localStorage['login'];
  else
    document.getElementById('login').value = 'admin';

  if (localStorage['update_interval'])
    document.getElementById('update_interval').value = localStorage['update_interval'];
  else
    document.getElementById('update_interval').value = '5';

  if (localStorage['single_user'])
    document.getElementById('single_user').checked = localStorage['single_user'] == '1';
  else
    document.getElementById('single_user').checked = false;

  if (localStorage['badge_type'])
    document.getElementById('badge_type').value = localStorage['badge_type'];
  else
    document.getElementById('badge_type').value = '1';

  single_user_toggle();

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


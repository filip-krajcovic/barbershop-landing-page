(function () {
  'use strict';

  var dialog = document.getElementById('booking');

  function openBooking() {
    if (dialog && !dialog.open) dialog.showModal();
  }

  function closeBooking() {
    if (dialog && dialog.open) dialog.close();
  }

  document.querySelectorAll('[data-open-booking]').forEach(function (el) {
    el.addEventListener('click', openBooking);
  });

  document.querySelectorAll('[data-close-booking]').forEach(function (el) {
    el.addEventListener('click', closeBooking);
  });

  // Klik na pozadie (backdrop) zatvorí dialóg.
  if (dialog) {
    dialog.addEventListener('click', function (e) {
      if (e.target === dialog) closeBooking();
    });
  }

  var year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();

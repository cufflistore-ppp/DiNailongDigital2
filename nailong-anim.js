/**
 * Nailong berjalan di atas bottom nav.
 * Klik: mode jalan → mobil → motor, plus efek "naik tanjakan".
 */
(function () {
  function init() {
    if (document.getElementById('nailongTrack')) return;
    // skip admin
    var page = (location.pathname.split('/').pop() || '').toLowerCase();
    if (page.indexOf('admin') === 0) return;

    var track = document.createElement('div');
    track.id = 'nailongTrack';
    track.className = 'nailong-track';
    var runner = document.createElement('div');
    runner.className = 'nailong-runner';
    runner.title = 'Klik Nailong!';
    runner.innerHTML = '<img src="nailong1.png" alt="Nailong" onerror="this.src=\'nailong.png\'">';
    track.appendChild(runner);
    document.body.appendChild(track);

    var modes = ['walk', 'car', 'motor'];
    var idx = 0;
    var imgs = ['nailong1.png', 'nailong2.png', 'nailong3.png'];

    runner.addEventListener('click', function () {
      idx = (idx + 1) % modes.length;
      runner.classList.remove('mode-car', 'mode-motor', 'climb');
      if (modes[idx] === 'car') runner.classList.add('mode-car');
      if (modes[idx] === 'motor') runner.classList.add('mode-motor');
      var img = runner.querySelector('img');
      if (img) img.src = imgs[idx % imgs.length];
      // efek naik tanjakan
      void runner.offsetWidth;
      runner.classList.add('climb');
      setTimeout(function () { runner.classList.remove('climb'); }, 1300);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

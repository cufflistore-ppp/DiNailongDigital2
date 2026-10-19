/**
 * Bottom nav indicator: line sinks, circle rises when active
 */
(function () {
  function updateIndicator() {
    var nav = document.querySelector('.bottom-nav');
    if (!nav) return;
    var active = nav.querySelector('.nav-item.active');
    var ind = document.getElementById('navIndicator');
    if (!active || !ind) return;
    var navRect = nav.getBoundingClientRect();
    var itemRect = active.getBoundingClientRect();
    var left = itemRect.left - navRect.left + itemRect.width / 2;
    ind.style.left = left + 'px';
    ind.classList.add('show');
  }

  document.addEventListener('DOMContentLoaded', function () {
    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    // Soft transition on click
    document.querySelectorAll('.bottom-nav .nav-item').forEach(function (a) {
      a.addEventListener('click', function () {
        document.querySelectorAll('.bottom-nav .nav-item').forEach(function (x) {
          x.classList.remove('active');
        });
        this.classList.add('active');
        setTimeout(updateIndicator, 30);
      });
    });
  });
})();

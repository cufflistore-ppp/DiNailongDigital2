/**
 * Nailong Digital - Balance / Saldo system
 * LocalStorage + optional Firebase user balance
 */
(function () {
  var KEY = 'nailong_balance';
  var TX_KEY = 'nailong_balance_tx';

  function getUid() {
    try {
      if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser) {
        return firebase.auth().currentUser.uid;
      }
    } catch (e) {}
    return 'guest';
  }

  function getBalance() {
    try {
      var all = JSON.parse(localStorage.getItem(KEY) || '{}');
      return parseInt(all[getUid()] || 0, 10) || 0;
    } catch (e) {
      return 0;
    }
  }

  function setBalance(val) {
    try {
      var all = JSON.parse(localStorage.getItem(KEY) || '{}');
      all[getUid()] = Math.max(0, parseInt(val, 10) || 0);
      localStorage.setItem(KEY, JSON.stringify(all));
    } catch (e) {}
  }

  function addTx(amount, desc) {
    try {
      var list = JSON.parse(localStorage.getItem(TX_KEY) || '[]');
      list.push({
        uid: getUid(),
        amount: amount,
        desc: desc || 'Transaksi',
        time: new Date().toLocaleString('id-ID'),
        ts: Date.now()
      });
      if (list.length > 200) list = list.slice(-200);
      localStorage.setItem(TX_KEY, JSON.stringify(list));
    } catch (e) {}
  }

  function formatRp(n) {
    return 'Rp ' + (n || 0).toLocaleString('id-ID');
  }

  function refreshUI() {
    var el = document.getElementById('saldoAmount');
    if (el) el.textContent = formatRp(getBalance());
  }

  async function deduct(amount, desc) {
    amount = parseInt(amount, 10) || 0;
    if (amount <= 0) return false;
    var bal = getBalance();
    if (bal < amount) return false;
    setBalance(bal - amount);
    addTx(-amount, desc);
    refreshUI();
    return true;
  }

  async function credit(amount, desc) {
    amount = parseInt(amount, 10) || 0;
    if (amount <= 0) return false;
    setBalance(getBalance() + amount);
    addTx(amount, desc);
    refreshUI();
    return true;
  }

  window.NailongBalance = {
    get: getBalance,
    deduct: deduct,
    credit: credit,
    refresh: refreshUI,
    format: formatRp
  };

  // Auto refresh on load & auth change
  document.addEventListener('DOMContentLoaded', function () {
    refreshUI();
    setTimeout(refreshUI, 800);
  });
  try {
    if (typeof firebase !== 'undefined' && firebase.auth) {
      firebase.auth().onAuthStateChanged(function () { refreshUI(); });
    }
  } catch (e) {}
})();

/**
 * Negara (semua), mata uang, bahasa ringkas, agama + pengingat ibadah.
 * Profil per akun di localStorage (dan Firebase bila ada).
 */
(function () {
  var KEY = 'nd_user_locale';

  // ISO countries — name + currency (lengkap; bahasa UI fallback ID/EN/MS)
  var COUNTRIES = [
    { code:'AF', name:'Afghanistan', currency:'AFN', symbol:'؋', lang:'en', flag:'🇦🇫' },
    { code:'AL', name:'Albania', currency:'ALL', symbol:'L', lang:'en', flag:'🇦🇱' },
    { code:'DZ', name:'Algeria', currency:'DZD', symbol:'دج', lang:'en', flag:'🇩🇿' },
    { code:'AD', name:'Andorra', currency:'EUR', symbol:'€', lang:'en', flag:'🇦🇩' },
    { code:'AO', name:'Angola', currency:'AOA', symbol:'Kz', lang:'en', flag:'🇦🇴' },
    { code:'AG', name:'Antigua and Barbuda', currency:'XCD', symbol:'$', lang:'en', flag:'🇦🇬' },
    { code:'AR', name:'Argentina', currency:'ARS', symbol:'$', lang:'en', flag:'🇦🇷' },
    { code:'AM', name:'Armenia', currency:'AMD', symbol:'֏', lang:'en', flag:'🇦🇲' },
    { code:'AU', name:'Australia', currency:'AUD', symbol:'A$', lang:'en', flag:'🇦🇺' },
    { code:'AT', name:'Austria', currency:'EUR', symbol:'€', lang:'en', flag:'🇦🇹' },
    { code:'AZ', name:'Azerbaijan', currency:'AZN', symbol:'₼', lang:'en', flag:'🇦🇿' },
    { code:'BS', name:'Bahamas', currency:'BSD', symbol:'$', lang:'en', flag:'🇧🇸' },
    { code:'BH', name:'Bahrain', currency:'BHD', symbol:'.د.ب', lang:'en', flag:'🇧🇭' },
    { code:'BD', name:'Bangladesh', currency:'BDT', symbol:'৳', lang:'en', flag:'🇧🇩' },
    { code:'BB', name:'Barbados', currency:'BBD', symbol:'$', lang:'en', flag:'🇧🇧' },
    { code:'BY', name:'Belarus', currency:'BYN', symbol:'Br', lang:'en', flag:'🇧🇾' },
    { code:'BE', name:'Belgium', currency:'EUR', symbol:'€', lang:'en', flag:'🇧🇪' },
    { code:'BZ', name:'Belize', currency:'BZD', symbol:'$', lang:'en', flag:'🇧🇿' },
    { code:'BJ', name:'Benin', currency:'XOF', symbol:'CFA', lang:'en', flag:'🇧🇯' },
    { code:'BT', name:'Bhutan', currency:'BTN', symbol:'Nu.', lang:'en', flag:'🇧🇹' },
    { code:'BO', name:'Bolivia', currency:'BOB', symbol:'Bs.', lang:'en', flag:'🇧🇴' },
    { code:'BA', name:'Bosnia and Herzegovina', currency:'BAM', symbol:'KM', lang:'en', flag:'🇧🇦' },
    { code:'BW', name:'Botswana', currency:'BWP', symbol:'P', lang:'en', flag:'🇧🇼' },
    { code:'BR', name:'Brazil', currency:'BRL', symbol:'R$', lang:'en', flag:'🇧🇷' },
    { code:'BN', name:'Brunei', currency:'BND', symbol:'B$', lang:'ms', flag:'🇧🇳' },
    { code:'BG', name:'Bulgaria', currency:'BGN', symbol:'лв', lang:'en', flag:'🇧🇬' },
    { code:'BF', name:'Burkina Faso', currency:'XOF', symbol:'CFA', lang:'en', flag:'🇧🇫' },
    { code:'BI', name:'Burundi', currency:'BIF', symbol:'FBu', lang:'en', flag:'🇧🇮' },
    { code:'CV', name:'Cabo Verde', currency:'CVE', symbol:'$', lang:'en', flag:'🇨🇻' },
    { code:'KH', name:'Cambodia', currency:'KHR', symbol:'៛', lang:'en', flag:'🇰🇭' },
    { code:'CM', name:'Cameroon', currency:'XAF', symbol:'FCFA', lang:'en', flag:'🇨🇲' },
    { code:'CA', name:'Canada', currency:'CAD', symbol:'C$', lang:'en', flag:'🇨🇦' },
    { code:'CF', name:'Central African Republic', currency:'XAF', symbol:'FCFA', lang:'en', flag:'🇨🇫' },
    { code:'TD', name:'Chad', currency:'XAF', symbol:'FCFA', lang:'en', flag:'🇹🇩' },
    { code:'CL', name:'Chile', currency:'CLP', symbol:'$', lang:'en', flag:'🇨🇱' },
    { code:'CN', name:'China', currency:'CNY', symbol:'¥', lang:'en', flag:'🇨🇳' },
    { code:'CO', name:'Colombia', currency:'COP', symbol:'$', lang:'en', flag:'🇨🇴' },
    { code:'KM', name:'Comoros', currency:'KMF', symbol:'CF', lang:'en', flag:'🇰🇲' },
    { code:'CG', name:'Congo', currency:'XAF', symbol:'FCFA', lang:'en', flag:'🇨🇬' },
    { code:'CD', name:'Congo (DRC)', currency:'CDF', symbol:'FC', lang:'en', flag:'🇨🇩' },
    { code:'CR', name:'Costa Rica', currency:'CRC', symbol:'₡', lang:'en', flag:'🇨🇷' },
    { code:'CI', name:"Côte d'Ivoire", currency:'XOF', symbol:'CFA', lang:'en', flag:'🇨🇮' },
    { code:'HR', name:'Croatia', currency:'EUR', symbol:'€', lang:'en', flag:'🇭🇷' },
    { code:'CU', name:'Cuba', currency:'CUP', symbol:'$', lang:'en', flag:'🇨🇺' },
    { code:'CY', name:'Cyprus', currency:'EUR', symbol:'€', lang:'en', flag:'🇨🇾' },
    { code:'CZ', name:'Czechia', currency:'CZK', symbol:'Kč', lang:'en', flag:'🇨🇿' },
    { code:'DK', name:'Denmark', currency:'DKK', symbol:'kr', lang:'en', flag:'🇩🇰' },
    { code:'DJ', name:'Djibouti', currency:'DJF', symbol:'Fdj', lang:'en', flag:'🇩🇯' },
    { code:'DM', name:'Dominica', currency:'XCD', symbol:'$', lang:'en', flag:'🇩🇲' },
    { code:'DO', name:'Dominican Republic', currency:'DOP', symbol:'$', lang:'en', flag:'🇩🇴' },
    { code:'EC', name:'Ecuador', currency:'USD', symbol:'$', lang:'en', flag:'🇪🇨' },
    { code:'EG', name:'Egypt', currency:'EGP', symbol:'E£', lang:'en', flag:'🇪🇬' },
    { code:'SV', name:'El Salvador', currency:'USD', symbol:'$', lang:'en', flag:'🇸🇻' },
    { code:'GQ', name:'Equatorial Guinea', currency:'XAF', symbol:'FCFA', lang:'en', flag:'🇬🇶' },
    { code:'ER', name:'Eritrea', currency:'ERN', symbol:'Nfk', lang:'en', flag:'🇪🇷' },
    { code:'EE', name:'Estonia', currency:'EUR', symbol:'€', lang:'en', flag:'🇪🇪' },
    { code:'SZ', name:'Eswatini', currency:'SZL', symbol:'E', lang:'en', flag:'🇸🇿' },
    { code:'ET', name:'Ethiopia', currency:'ETB', symbol:'Br', lang:'en', flag:'🇪🇹' },
    { code:'FJ', name:'Fiji', currency:'FJD', symbol:'$', lang:'en', flag:'🇫🇯' },
    { code:'FI', name:'Finland', currency:'EUR', symbol:'€', lang:'en', flag:'🇫🇮' },
    { code:'FR', name:'France', currency:'EUR', symbol:'€', lang:'en', flag:'🇫🇷' },
    { code:'GA', name:'Gabon', currency:'XAF', symbol:'FCFA', lang:'en', flag:'🇬🇦' },
    { code:'GM', name:'Gambia', currency:'GMD', symbol:'D', lang:'en', flag:'🇬🇲' },
    { code:'GE', name:'Georgia', currency:'GEL', symbol:'₾', lang:'en', flag:'🇬🇪' },
    { code:'DE', name:'Germany', currency:'EUR', symbol:'€', lang:'en', flag:'🇩🇪' },
    { code:'GH', name:'Ghana', currency:'GHS', symbol:'₵', lang:'en', flag:'🇬🇭' },
    { code:'GR', name:'Greece', currency:'EUR', symbol:'€', lang:'en', flag:'🇬🇷' },
    { code:'GD', name:'Grenada', currency:'XCD', symbol:'$', lang:'en', flag:'🇬🇩' },
    { code:'GT', name:'Guatemala', currency:'GTQ', symbol:'Q', lang:'en', flag:'🇬🇹' },
    { code:'GN', name:'Guinea', currency:'GNF', symbol:'FG', lang:'en', flag:'🇬🇳' },
    { code:'GW', name:'Guinea-Bissau', currency:'XOF', symbol:'CFA', lang:'en', flag:'🇬🇼' },
    { code:'GY', name:'Guyana', currency:'GYD', symbol:'$', lang:'en', flag:'🇬🇾' },
    { code:'HT', name:'Haiti', currency:'HTG', symbol:'G', lang:'en', flag:'🇭🇹' },
    { code:'HN', name:'Honduras', currency:'HNL', symbol:'L', lang:'en', flag:'🇭🇳' },
    { code:'HK', name:'Hong Kong', currency:'HKD', symbol:'HK$', lang:'en', flag:'🇭🇰' },
    { code:'HU', name:'Hungary', currency:'HUF', symbol:'Ft', lang:'en', flag:'🇭🇺' },
    { code:'IS', name:'Iceland', currency:'ISK', symbol:'kr', lang:'en', flag:'🇮🇸' },
    { code:'IN', name:'India', currency:'INR', symbol:'₹', lang:'en', flag:'🇮🇳' },
    { code:'ID', name:'Indonesia', currency:'IDR', symbol:'Rp', lang:'id', flag:'🇮🇩' },
    { code:'IR', name:'Iran', currency:'IRR', symbol:'﷼', lang:'en', flag:'🇮🇷' },
    { code:'IQ', name:'Iraq', currency:'IQD', symbol:'ع.د', lang:'en', flag:'🇮🇶' },
    { code:'IE', name:'Ireland', currency:'EUR', symbol:'€', lang:'en', flag:'🇮🇪' },
    { code:'IL', name:'Israel', currency:'ILS', symbol:'₪', lang:'en', flag:'🇮🇱' },
    { code:'IT', name:'Italy', currency:'EUR', symbol:'€', lang:'en', flag:'🇮🇹' },
    { code:'JM', name:'Jamaica', currency:'JMD', symbol:'$', lang:'en', flag:'🇯🇲' },
    { code:'JP', name:'Japan', currency:'JPY', symbol:'¥', lang:'en', flag:'🇯🇵' },
    { code:'JO', name:'Jordan', currency:'JOD', symbol:'د.ا', lang:'en', flag:'🇯🇴' },
    { code:'KZ', name:'Kazakhstan', currency:'KZT', symbol:'₸', lang:'en', flag:'🇰🇿' },
    { code:'KE', name:'Kenya', currency:'KES', symbol:'KSh', lang:'en', flag:'🇰🇪' },
    { code:'KI', name:'Kiribati', currency:'AUD', symbol:'$', lang:'en', flag:'🇰🇮' },
    { code:'KW', name:'Kuwait', currency:'KWD', symbol:'د.ك', lang:'en', flag:'🇰🇼' },
    { code:'KG', name:'Kyrgyzstan', currency:'KGS', symbol:'с', lang:'en', flag:'🇰🇬' },
    { code:'LA', name:'Laos', currency:'LAK', symbol:'₭', lang:'en', flag:'🇱🇦' },
    { code:'LV', name:'Latvia', currency:'EUR', symbol:'€', lang:'en', flag:'🇱🇻' },
    { code:'LB', name:'Lebanon', currency:'LBP', symbol:'ل.ل', lang:'en', flag:'🇱🇧' },
    { code:'LS', name:'Lesotho', currency:'LSL', symbol:'L', lang:'en', flag:'🇱🇸' },
    { code:'LR', name:'Liberia', currency:'LRD', symbol:'$', lang:'en', flag:'🇱🇷' },
    { code:'LY', name:'Libya', currency:'LYD', symbol:'ل.د', lang:'en', flag:'🇱🇾' },
    { code:'LI', name:'Liechtenstein', currency:'CHF', symbol:'Fr', lang:'en', flag:'🇱🇮' },
    { code:'LT', name:'Lithuania', currency:'EUR', symbol:'€', lang:'en', flag:'🇱🇹' },
    { code:'LU', name:'Luxembourg', currency:'EUR', symbol:'€', lang:'en', flag:'🇱🇺' },
    { code:'MO', name:'Macao', currency:'MOP', symbol:'MOP$', lang:'en', flag:'🇲🇴' },
    { code:'MG', name:'Madagascar', currency:'MGA', symbol:'Ar', lang:'en', flag:'🇲🇬' },
    { code:'MW', name:'Malawi', currency:'MWK', symbol:'MK', lang:'en', flag:'🇲🇼' },
    { code:'MY', name:'Malaysia', currency:'MYR', symbol:'RM', lang:'ms', flag:'🇲🇾' },
    { code:'MV', name:'Maldives', currency:'MVR', symbol:'Rf', lang:'en', flag:'🇲🇻' },
    { code:'ML', name:'Mali', currency:'XOF', symbol:'CFA', lang:'en', flag:'🇲🇱' },
    { code:'MT', name:'Malta', currency:'EUR', symbol:'€', lang:'en', flag:'🇲🇹' },
    { code:'MH', name:'Marshall Islands', currency:'USD', symbol:'$', lang:'en', flag:'🇲🇭' },
    { code:'MR', name:'Mauritania', currency:'MRU', symbol:'UM', lang:'en', flag:'🇲🇷' },
    { code:'MU', name:'Mauritius', currency:'MUR', symbol:'₨', lang:'en', flag:'🇲🇺' },
    { code:'MX', name:'Mexico', currency:'MXN', symbol:'$', lang:'en', flag:'🇲🇽' },
    { code:'FM', name:'Micronesia', currency:'USD', symbol:'$', lang:'en', flag:'🇫🇲' },
    { code:'MD', name:'Moldova', currency:'MDL', symbol:'L', lang:'en', flag:'🇲🇩' },
    { code:'MC', name:'Monaco', currency:'EUR', symbol:'€', lang:'en', flag:'🇲🇨' },
    { code:'MN', name:'Mongolia', currency:'MNT', symbol:'₮', lang:'en', flag:'🇲🇳' },
    { code:'ME', name:'Montenegro', currency:'EUR', symbol:'€', lang:'en', flag:'🇲🇪' },
    { code:'MA', name:'Morocco', currency:'MAD', symbol:'د.م.', lang:'en', flag:'🇲🇦' },
    { code:'MZ', name:'Mozambique', currency:'MZN', symbol:'MT', lang:'en', flag:'🇲🇿' },
    { code:'MM', name:'Myanmar', currency:'MMK', symbol:'K', lang:'en', flag:'🇲🇲' },
    { code:'NA', name:'Namibia', currency:'NAD', symbol:'$', lang:'en', flag:'🇳🇦' },
    { code:'NR', name:'Nauru', currency:'AUD', symbol:'$', lang:'en', flag:'🇳🇷' },
    { code:'NP', name:'Nepal', currency:'NPR', symbol:'₨', lang:'en', flag:'🇳🇵' },
    { code:'NL', name:'Netherlands', currency:'EUR', symbol:'€', lang:'en', flag:'🇳🇱' },
    { code:'NZ', name:'New Zealand', currency:'NZD', symbol:'NZ$', lang:'en', flag:'🇳🇿' },
    { code:'NI', name:'Nicaragua', currency:'NIO', symbol:'C$', lang:'en', flag:'🇳🇮' },
    { code:'NE', name:'Niger', currency:'XOF', symbol:'CFA', lang:'en', flag:'🇳🇪' },
    { code:'NG', name:'Nigeria', currency:'NGN', symbol:'₦', lang:'en', flag:'🇳🇬' },
    { code:'KP', name:'North Korea', currency:'KPW', symbol:'₩', lang:'en', flag:'🇰🇵' },
    { code:'MK', name:'North Macedonia', currency:'MKD', symbol:'ден', lang:'en', flag:'🇲🇰' },
    { code:'NO', name:'Norway', currency:'NOK', symbol:'kr', lang:'en', flag:'🇳🇴' },
    { code:'OM', name:'Oman', currency:'OMR', symbol:'ر.ع.', lang:'en', flag:'🇴🇲' },
    { code:'PK', name:'Pakistan', currency:'PKR', symbol:'₨', lang:'en', flag:'🇵🇰' },
    { code:'PW', name:'Palau', currency:'USD', symbol:'$', lang:'en', flag:'🇵🇼' },
    { code:'PS', name:'Palestine', currency:'ILS', symbol:'₪', lang:'en', flag:'🇵🇸' },
    { code:'PA', name:'Panama', currency:'PAB', symbol:'B/.', lang:'en', flag:'🇵🇦' },
    { code:'PG', name:'Papua New Guinea', currency:'PGK', symbol:'K', lang:'en', flag:'🇵🇬' },
    { code:'PY', name:'Paraguay', currency:'PYG', symbol:'₲', lang:'en', flag:'🇵🇾' },
    { code:'PE', name:'Peru', currency:'PEN', symbol:'S/', lang:'en', flag:'🇵🇪' },
    { code:'PH', name:'Philippines', currency:'PHP', symbol:'₱', lang:'en', flag:'🇵🇭' },
    { code:'PL', name:'Poland', currency:'PLN', symbol:'zł', lang:'en', flag:'🇵🇱' },
    { code:'PT', name:'Portugal', currency:'EUR', symbol:'€', lang:'en', flag:'🇵🇹' },
    { code:'QA', name:'Qatar', currency:'QAR', symbol:'ر.ق', lang:'en', flag:'🇶🇦' },
    { code:'RO', name:'Romania', currency:'RON', symbol:'lei', lang:'en', flag:'🇷🇴' },
    { code:'RU', name:'Russia', currency:'RUB', symbol:'₽', lang:'en', flag:'🇷🇺' },
    { code:'RW', name:'Rwanda', currency:'RWF', symbol:'FRw', lang:'en', flag:'🇷🇼' },
    { code:'KN', name:'Saint Kitts and Nevis', currency:'XCD', symbol:'$', lang:'en', flag:'🇰🇳' },
    { code:'LC', name:'Saint Lucia', currency:'XCD', symbol:'$', lang:'en', flag:'🇱🇨' },
    { code:'VC', name:'Saint Vincent and the Grenadines', currency:'XCD', symbol:'$', lang:'en', flag:'🇻🇨' },
    { code:'WS', name:'Samoa', currency:'WST', symbol:'T', lang:'en', flag:'🇼🇸' },
    { code:'SM', name:'San Marino', currency:'EUR', symbol:'€', lang:'en', flag:'🇸🇲' },
    { code:'ST', name:'Sao Tome and Principe', currency:'STN', symbol:'Db', lang:'en', flag:'🇸🇹' },
    { code:'SA', name:'Saudi Arabia', currency:'SAR', symbol:'ر.س', lang:'en', flag:'🇸🇦' },
    { code:'SN', name:'Senegal', currency:'XOF', symbol:'CFA', lang:'en', flag:'🇸🇳' },
    { code:'RS', name:'Serbia', currency:'RSD', symbol:'дин.', lang:'en', flag:'🇷🇸' },
    { code:'SC', name:'Seychelles', currency:'SCR', symbol:'₨', lang:'en', flag:'🇸🇨' },
    { code:'SL', name:'Sierra Leone', currency:'SLE', symbol:'Le', lang:'en', flag:'🇸🇱' },
    { code:'SG', name:'Singapore', currency:'SGD', symbol:'S$', lang:'en', flag:'🇸🇬' },
    { code:'SK', name:'Slovakia', currency:'EUR', symbol:'€', lang:'en', flag:'🇸🇰' },
    { code:'SI', name:'Slovenia', currency:'EUR', symbol:'€', lang:'en', flag:'🇸🇮' },
    { code:'SB', name:'Solomon Islands', currency:'SBD', symbol:'$', lang:'en', flag:'🇸🇧' },
    { code:'SO', name:'Somalia', currency:'SOS', symbol:'Sh', lang:'en', flag:'🇸🇴' },
    { code:'ZA', name:'South Africa', currency:'ZAR', symbol:'R', lang:'en', flag:'🇿🇦' },
    { code:'KR', name:'South Korea', currency:'KRW', symbol:'₩', lang:'en', flag:'🇰🇷' },
    { code:'SS', name:'South Sudan', currency:'SSP', symbol:'£', lang:'en', flag:'🇸🇸' },
    { code:'ES', name:'Spain', currency:'EUR', symbol:'€', lang:'en', flag:'🇪🇸' },
    { code:'LK', name:'Sri Lanka', currency:'LKR', symbol:'Rs', lang:'en', flag:'🇱🇰' },
    { code:'SD', name:'Sudan', currency:'SDG', symbol:'ج.س.', lang:'en', flag:'🇸🇩' },
    { code:'SR', name:'Suriname', currency:'SRD', symbol:'$', lang:'en', flag:'🇸🇷' },
    { code:'SE', name:'Sweden', currency:'SEK', symbol:'kr', lang:'en', flag:'🇸🇪' },
    { code:'CH', name:'Switzerland', currency:'CHF', symbol:'Fr', lang:'en', flag:'🇨🇭' },
    { code:'SY', name:'Syria', currency:'SYP', symbol:'£', lang:'en', flag:'🇸🇾' },
    { code:'TW', name:'Taiwan', currency:'TWD', symbol:'NT$', lang:'en', flag:'🇹🇼' },
    { code:'TJ', name:'Tajikistan', currency:'TJS', symbol:'ЅМ', lang:'en', flag:'🇹🇯' },
    { code:'TZ', name:'Tanzania', currency:'TZS', symbol:'TSh', lang:'en', flag:'🇹🇿' },
    { code:'TH', name:'Thailand', currency:'THB', symbol:'฿', lang:'en', flag:'🇹🇭' },
    { code:'TL', name:'Timor-Leste', currency:'USD', symbol:'$', lang:'id', flag:'🇹🇱' },
    { code:'TG', name:'Togo', currency:'XOF', symbol:'CFA', lang:'en', flag:'🇹🇬' },
    { code:'TO', name:'Tonga', currency:'TOP', symbol:'T$', lang:'en', flag:'🇹🇴' },
    { code:'TT', name:'Trinidad and Tobago', currency:'TTD', symbol:'$', lang:'en', flag:'🇹🇹' },
    { code:'TN', name:'Tunisia', currency:'TND', symbol:'د.ت', lang:'en', flag:'🇹🇳' },
    { code:'TR', name:'Turkey', currency:'TRY', symbol:'₺', lang:'en', flag:'🇹🇷' },
    { code:'TM', name:'Turkmenistan', currency:'TMT', symbol:'m', lang:'en', flag:'🇹🇲' },
    { code:'TV', name:'Tuvalu', currency:'AUD', symbol:'$', lang:'en', flag:'🇹🇻' },
    { code:'UG', name:'Uganda', currency:'UGX', symbol:'USh', lang:'en', flag:'🇺🇬' },
    { code:'UA', name:'Ukraine', currency:'UAH', symbol:'₴', lang:'en', flag:'🇺🇦' },
    { code:'AE', name:'United Arab Emirates', currency:'AED', symbol:'د.إ', lang:'en', flag:'🇦🇪' },
    { code:'GB', name:'United Kingdom', currency:'GBP', symbol:'£', lang:'en', flag:'🇬🇧' },
    { code:'US', name:'United States', currency:'USD', symbol:'$', lang:'en', flag:'🇺🇸' },
    { code:'UY', name:'Uruguay', currency:'UYU', symbol:'$', lang:'en', flag:'🇺🇾' },
    { code:'UZ', name:'Uzbekistan', currency:'UZS', symbol:'soʻm', lang:'en', flag:'🇺🇿' },
    { code:'VU', name:'Vanuatu', currency:'VUV', symbol:'Vt', lang:'en', flag:'🇻🇺' },
    { code:'VA', name:'Vatican City', currency:'EUR', symbol:'€', lang:'en', flag:'🇻🇦' },
    { code:'VE', name:'Venezuela', currency:'VES', symbol:'Bs.', lang:'en', flag:'🇻🇪' },
    { code:'VN', name:'Vietnam', currency:'VND', symbol:'₫', lang:'en', flag:'🇻🇳' },
    { code:'YE', name:'Yemen', currency:'YER', symbol:'﷼', lang:'en', flag:'🇾🇪' },
    { code:'ZM', name:'Zambia', currency:'ZMW', symbol:'ZK', lang:'en', flag:'🇿🇲' },
    { code:'ZW', name:'Zimbabwe', currency:'ZWL', symbol:'$', lang:'en', flag:'🇿🇼' }
  ];

  var STR = {
    id: { salam: 'Assalamualaikum', currencyLabel: 'Mata uang' },
    ms: { salam: 'Assalamualaikum', currencyLabel: 'Mata wang' },
    en: { salam: 'Hello', currencyLabel: 'Currency' }
  };

  function uid() {
    try {
      if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser)
        return firebase.auth().currentUser.uid;
    } catch (e) {}
    return 'guest';
  }

  function key() { return KEY + '_' + uid(); }

  function load() {
    try { return JSON.parse(localStorage.getItem(key()) || '{}'); } catch (e) { return {}; }
  }

  function saveProfile(patch) {
    var p = Object.assign(load(), patch || {}, { updated: Date.now() });
    try { localStorage.setItem(key(), JSON.stringify(p)); } catch (e) {}
    try {
      if (typeof firebase !== 'undefined' && firebase.database && firebase.auth && firebase.auth().currentUser) {
        firebase.database().ref('user_profiles/' + firebase.auth().currentUser.uid).update(p);
      }
    } catch (e2) {}
    return p;
  }

  function countryOf(code) {
    return COUNTRIES.find(function (c) { return c.code === code; }) || COUNTRIES.find(function (c) { return c.code === 'ID'; });
  }

  function formatMoney(amountIdr) {
    var p = load();
    var c = countryOf(p.country || 'ID');
    // tampilkan IDR sebagai dasar + label lokal (konversi penuh butuh rate API)
    var n = Number(amountIdr) || 0;
    if (c.code === 'ID') return 'Rp ' + n.toLocaleString('id-ID');
    return c.symbol + ' ' + n.toLocaleString('en-US') + ' (≈ dari Rp)';
  }

  function prayerNudge() {
    var p = load();
    var rel = p.religion || 'islam';
    var h = new Date().getHours();
    var msg = null;
    if (rel === 'islam') {
      if (h >= 4 && h < 6) msg = 'Ayo sholat Subuh — mulai hari dengan doa 🌅';
      else if (h >= 11 && h < 13) msg = 'Jangan lupa sholat Dzuhur 🕌';
      else if (h >= 15 && h < 16) msg = 'Waktunya sholat Ashar';
      else if (h >= 18 && h < 19) msg = 'Sholat Maghrib — istirahat sejenak untuk ibadah';
      else if (h >= 19 && h < 21) msg = 'Yuk sholat Isya';
      // Ramadan approximate: user flag
      if (p.ramadan) {
        if (h >= 3 && h < 5) msg = 'Waktunya Sahur — jaga tenaga untuk puasa 🌙';
        if (h >= 17 && h < 19) msg = 'Hampir berbuka — siapkan takjil, jangan lupa doa berbuka';
      }
    } else if (rel === 'kristen' || rel === 'katolik') {
      if (h >= 5 && h < 8) msg = 'Selamat pagi — luangkan waktu untuk doa pagi ✝️';
      if (h >= 18 && h < 21) msg = 'Doa malam membawa ketenangan';
      var d = new Date();
      if (d.getMonth() === 11 && d.getDate() >= 20) msg = 'Musim Natal — bagikan kebaikan hari ini 🎄';
    } else if (rel === 'hindu') {
      if (h >= 5 && h < 8) msg = 'Om — waktu baik untuk doa pagi 🙏';
    } else if (rel === 'buddha') {
      if (h >= 5 && h < 8) msg = 'Meditasi singkat pagi ini membawa damai 🕊️';
    } else if (rel === 'konghucu') {
      if (h >= 5 && h < 9) msg = 'Mulai hari dengan kebajikan dan rasa hormat';
    }
    return msg;
  }

  function showNudgeBanner() {
    var msg = prayerNudge();
    if (!msg) return;
    if (document.getElementById('ndFaithNudge')) return;
    var el = document.createElement('div');
    el.id = 'ndFaithNudge';
    el.style.cssText = 'position:fixed;top:12px;left:12px;right:12px;z-index:60;background:rgba(12,16,28,0.92);border:1px solid rgba(255,193,7,0.35);color:#fff;padding:12px 14px;border-radius:14px;font-size:13px;display:flex;gap:10px;align-items:center;backdrop-filter:blur(10px);';
    el.innerHTML = '<span style="flex:1">' + msg + '</span><button type="button" style="border:none;background:transparent;color:#FFC107;font-size:18px;cursor:pointer">&times;</button>';
    el.querySelector('button').onclick = function () { el.remove(); };
    document.body.appendChild(el);
    setTimeout(function () { if (el.parentNode) el.remove(); }, 12000);
  }

  window.ND_COUNTRIES = COUNTRIES;
  window.NDLocale = {
    COUNTRIES: COUNTRIES,
    load: load,
    saveProfile: saveProfile,
    countryOf: countryOf,
    formatMoney: formatMoney,
    prayerNudge: prayerNudge,
    showNudgeBanner: showNudgeBanner
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(showNudgeBanner, 1500); });
  } else setTimeout(showNudgeBanner, 1500);
})();

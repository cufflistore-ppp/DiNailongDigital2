(function(){
  var area, panel;
  function show(html){ panel.classList.add('active'); area.innerHTML = html; }
  function back(){ panel.classList.remove('active'); area.innerHTML=''; }
  function copyBtn(id){
    var b=document.getElementById(id); if(!b) return;
    b.onclick=function(){ var t=document.getElementById(id.replace('copy','out'))||document.getElementById('out');
      if(t){ navigator.clipboard.writeText(t.value||t.textContent||''); b.textContent='Tersalin!'; setTimeout(function(){b.textContent='Salin';},1200);} };
  }
  function field(label,id,ph,type){
    return '<label>'+label+'</label><input type="'+(type||'text')+'" id="'+id+'" class="form-input" placeholder="'+(ph||'')+'">';
  }
  function ta(label,id,ph){ return '<label>'+label+'</label><textarea id="'+id+'" class="form-input" rows="4" placeholder="'+(ph||'')+'"></textarea>'; }
  function btn(id,txt){ return '<button type="button" class="btn-pesan" id="'+id+'" style="width:100%;margin-top:10px;">'+txt+'</button>'; }

  var handlers = {

    deploy: function(){
      show('<p style="font-size:13px;color:#cfd8dc;line-height:1.5;">Upload ZIP website → ekstrak di browser → siap di-host. <b>Tanpa GitHub</b>.</p>'+
        '<input type="file" id="zipf" accept=".zip,application/zip" class="form-input">'+
        '<button type="button" class="btn-pesan" id="go" style="width:100%;margin-top:10px;">Ekstrak ZIP</button>'+
        '<div id="out" style="margin-top:12px;font-size:12px;color:#8aa0b8;"></div>'+
        '<p style="font-size:11px;color:#6b7a90;margin-top:10px;">Setelah ekstrak, pakai tombol Netlify Drop / Tiiny untuk online tanpa akun GitHub.</p>');
      document.getElementById('go').onclick = async function(){
        var f = document.getElementById('zipf').files[0];
        var out = document.getElementById('out');
        if (!f) { out.textContent = 'Pilih file ZIP dulu'; return; }
        out.innerHTML = 'Mengurai '+f.name+'…';
        try {
          if (typeof JSZip === 'undefined') {
            await new Promise(function(res,rej){
              var s=document.createElement('script');
              s.src='https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
              s.onload=res; s.onerror=rej; document.head.appendChild(s);
            });
          }
          var zip = await JSZip.loadAsync(f);
          var names = Object.keys(zip.files).filter(function(n){ return !zip.files[n].dir; });
          window.__ndZip = zip;
          window.__ndZipNames = names;
          out.innerHTML = '<b style="color:#69f0ae;">'+names.length+' file</b> siap.<br>'+
            names.slice(0,12).map(function(n){return '• '+n;}).join('<br>')+
            (names.length>12?'<br>…':'')+
            '<br><button type="button" class="btn-topup" id="toNetlify" style="width:100%;margin-top:10px;">Lanjut Netlify Drop</button>';
          document.getElementById('toNetlify').onclick=function(){ window.open('https://app.netlify.com/drop','_blank'); };
        } catch(e){ out.textContent = 'Gagal: '+(e.message||e); }
      };
    },
    netlify: function(){
      show('<p style="font-size:13px;color:#cfd8dc;">Netlify Drop = drag & drop folder/ZIP, <b>tanpa GitHub</b>, dapat link *.netlify.app</p>'+
        '<a class="btn-pesan" style="display:block;text-align:center;margin-top:12px;" href="https://app.netlify.com/drop" target="_blank" rel="noopener">Buka Netlify Drop</a>'+
        '<p style="font-size:11px;color:#8aa0b8;margin-top:10px;">1) Ekstrak ZIP di HP/PC 2) Buka link di atas 3) Drop folder 4) Dapat URL live</p>');
    },
    cfpages: function(){
      show('<p style="font-size:13px;color:#cfd8dc;">Cloudflare Pages juga bisa upload langsung (akun Cloudflare gratis, tanpa GitHub wajib).</p>'+
        '<a class="btn-pesan" style="display:block;text-align:center;margin-top:12px;" href="https://dash.cloudflare.com/?to=/:account/pages" target="_blank" rel="noopener">Buka Cloudflare Pages</a>');
    },
    tiiny: function(){
      show('<p style="font-size:13px;color:#cfd8dc;">Tiiny.host — upload ZIP, dapat link langsung. Cocok file statis.</p>'+
        '<a class="btn-pesan" style="display:block;text-align:center;margin-top:12px;" href="https://tiiny.host/" target="_blank" rel="noopener">Buka Tiiny.host</a>');
    },
    zipview: function(){
      show('<input type="file" id="zipf" accept=".zip" class="form-input">'+btn('go','Lihat isi ZIP')+'<pre id="out" style="margin-top:10px;background:#0a0e18;padding:10px;border-radius:10px;color:#cfd8dc;font-size:11px;max-height:220px;overflow:auto;"></pre>');
      document.getElementById('go').onclick = async function(){
        var f=document.getElementById('zipf').files[0]; if(!f) return;
        if (typeof JSZip==='undefined'){ await new Promise(function(r){ var s=document.createElement('script'); s.src='https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'; s.onload=r; document.head.appendChild(s); }); }
        var z=await JSZip.loadAsync(f);
        document.getElementById('out').textContent=Object.keys(z.files).join('\n');
      };
    },
    htmlhost: function(){
      show(ta('HTML','t','<!DOCTYPE html><html><body><h1>Halo</h1></body></html>')+btn('go','Preview')+'<iframe id="out" style="width:100%;height:220px;margin-top:10px;border-radius:12px;border:1px solid #333;background:#fff;"></iframe>');
      document.getElementById('go').onclick=function(){
        var blob=new Blob([document.getElementById('t').value],{type:'text/html'});
        document.getElementById('out').src=URL.createObjectURL(blob);
      };
    },
    fakeovo: function(){
      show(field('Nama','n','Nailong')+field('Saldo','s','1500000')+btn('go','Generate')+'<div id="out" style="margin-top:12px;background:linear-gradient(135deg,#7B2CBF,#5A189A);border-radius:16px;padding:20px;color:#fff;"></div>');
      document.getElementById('go').onclick=function(){
        var n=document.getElementById('n').value||'User';
        var s=parseInt(document.getElementById('s').value,10)||0;
        document.getElementById('out').innerHTML='<div style="font-size:12px;opacity:.8;">OVO</div><div style="font-size:18px;font-weight:800;margin:8px 0;">'+n+'</div><div style="font-size:22px;font-weight:800;">Rp '+s.toLocaleString('id-ID')+'</div><div style="font-size:11px;margin-top:8px;opacity:.7;">Preview UI · bukan saldo asli</div>';
      };
    },
    fakedev: function(){
      show(field('Nama','n','Dev Nailong')+field('Bio','b','Fullstack · Bot WA')+btn('go','Kartu Dev')+'<div id="out" style="margin-top:12px;background:#0d1117;border:1px solid #30363d;border-radius:12px;padding:16px;color:#c9d1d9;"></div>');
      document.getElementById('go').onclick=function(){
        document.getElementById('out').innerHTML='<div style="display:flex;gap:12px;align-items:center;"><div style="width:48px;height:48px;border-radius:50%;background:#FFC107;color:#000;display:flex;align-items:center;justify-content:center;font-weight:800;">'+(document.getElementById('n').value||'D').charAt(0)+'</div><div><b style="color:#fff;">'+document.getElementById('n').value+'</b><br><span style="font-size:12px;color:#8b949e;">'+document.getElementById('b').value+'</span></div></div>';
      };
    },
    quote: function(){
      var q=['Kerja diam-diam, hasil bicara.','Jangan bandingkan prosesmu.','Konsisten > motivasi.','Nailong Digital — otomatis, cepat, rapi.'];
      show(btn('go','Quote Random')+'<div id="out" style="margin-top:12px;padding:20px;border-radius:14px;background:#111;color:#FFC107;font-size:16px;font-weight:700;text-align:center;min-height:80px;"></div>');
      document.getElementById('go').onclick=function(){ document.getElementById('out').textContent='"'+q[Math.floor(Math.random()*q.length)]+'"'; };
    },
    nokia: function(){
      show(field('Pengirim','n','Admin')+ta('Pesan','m','Halo')+btn('go','Buat SMS Nokia')+'<div id="out" style="margin-top:12px;background:#9e9e9e;border-radius:8px;padding:12px;font-family:monospace;color:#000;font-size:13px;"></div>');
      document.getElementById('go').onclick=function(){
        document.getElementById('out').innerHTML='<b>'+document.getElementById('n').value+'</b><br>'+document.getElementById('m').value+'<br><span style="font-size:10px;">12:00</span>';
      };
    },
    prompt: function(){
      show(field('Topik','t','bot whatsapp')+btn('go','Buat Prompt')+'<textarea id="out" class="form-input" rows="5" style="margin-top:10px;"></textarea>'+btn('copy','Salin'));
      document.getElementById('go').onclick=function(){
        var t=document.getElementById('t').value||'AI';
        document.getElementById('out').value='Buatkan deskripsi profesional tentang '+t+' dalam bahasa Indonesia, singkat, jelas, dan menarik untuk website jasa digital.';
      }; copyBtn('copy');
    },
    fakeid2: function(){
      handlers.fakeid();
    },

    wa: function(){
      show(field('Nomor (62…)','n','62812…')+btn('go','Buat Link')+'<input id="out" class="form-input" style="margin-top:10px;" readonly>'+btn('copy','Salin'));
      document.getElementById('go').onclick=function(){
        var n=(document.getElementById('n').value||'').replace(/\D/g,'');
        if(n.startsWith('0')) n='62'+n.slice(1);
        document.getElementById('out').value='https://wa.me/'+n;
      }; copyBtn('copy');
    },
    watext: function(){
      show(field('Nomor','n','628…')+ta('Pesan','m','Halo…')+btn('go','Buat Link')+'<input id="out" class="form-input" style="margin-top:10px;" readonly>'+btn('copy','Salin'));
      document.getElementById('go').onclick=function(){
        var n=(document.getElementById('n').value||'').replace(/\D/g,'');
        if(n.startsWith('0')) n='62'+n.slice(1);
        document.getElementById('out').value='https://wa.me/'+n+'?text='+encodeURIComponent(document.getElementById('m').value||'');
      }; copyBtn('copy');
    },
    vacall: function(){
      show(field('Nomor','n','628…')+btn('go','Buat Call Link')+'<input id="out" class="form-input" style="margin-top:10px;" readonly>'+btn('copy','Salin'));
      document.getElementById('go').onclick=function(){
        var n=(document.getElementById('n').value||'').replace(/\D/g,'');
        document.getElementById('out').value='https://wa.me/'+n+'?call';
      }; copyBtn('copy');
    },
    sticker: function(){
      show(ta('Teks stiker','t','TULIS BESAR')+btn('go','Buat ASCII')+'<pre id="out" style="background:#0a0e18;padding:12px;border-radius:10px;color:#FFC107;overflow:auto;font-size:11px;"></pre>');
      document.getElementById('go').onclick=function(){
        var t=(document.getElementById('t').value||'NAILONG').toUpperCase();
        document.getElementById('out').textContent='★ '+t+' ★\n'+'═'.repeat(Math.min(t.length+4,20))+'\n'+t.split('').join(' ')+'\n'+'═'.repeat(Math.min(t.length+4,20));
      };
    },
    spam: function(){
      show(ta('Teks','t','halo')+field('Ulangi berapa kali','c','10','number')+btn('go','Generate')+'<textarea id="out" class="form-input" rows="6" style="margin-top:10px;"></textarea>'+btn('copy','Salin'));
      document.getElementById('go').onclick=function(){
        var t=document.getElementById('t').value||'', c=Math.min(200,parseInt(document.getElementById('c').value,10)||1);
        document.getElementById('out').value=Array(c).fill(t).join('\n');
      }; copyBtn('copy');
    },
    fakechat: function(){
      show(field('Nama pengirim','nm','Admin')+ta('Pesan','m','Halo kak')+btn('go','Preview')+'<div id="out" style="margin-top:12px;background:#0b141a;border-radius:12px;padding:12px;min-height:80px;"></div>');
      document.getElementById('go').onclick=function(){
        document.getElementById('out').innerHTML='<div style="display:flex;gap:8px;align-items:flex-end;"><div style="width:32px;height:32px;border-radius:50%;background:#FFC107;color:#0a0e18;display:flex;align-items:center;justify-content:center;font-weight:800;">'+(document.getElementById('nm').value||'A').charAt(0)+'</div><div style="background:#005c4b;color:#fff;padding:8px 12px;border-radius:12px;max-width:80%;font-size:13px;"><b style="font-size:11px;opacity:.8;">'+document.getElementById('nm').value+'</b><br>'+document.getElementById('m').value+'</div></div>';
      };
    },
    uuid: function(){
      show(btn('go','Generate UUID')+'<input id="out" class="form-input" style="margin-top:10px;" readonly>'+btn('copy','Salin'));
      document.getElementById('go').onclick=function(){
        document.getElementById('out').value=([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,function(c){return(c^(crypto.getRandomValues(new Uint8Array(1))[0]&(15>>(c/4)))).toString(16);});
      }; copyBtn('copy');
    },
    pass: function(){
      show(field('Panjang','len','16','number')+btn('go','Generate')+'<input id="out" class="form-input" style="margin-top:10px;" readonly>'+btn('copy','Salin'));
      document.getElementById('go').onclick=function(){
        var chars='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%', len=Math.min(64,parseInt(document.getElementById('len').value,10)||16), s='';
        for(var i=0;i<len;i++) s+=chars[Math.floor(Math.random()*chars.length)];
        document.getElementById('out').value=s;
      }; copyBtn('copy');
    },
    nick: function(){
      var a=['Dark','Shadow','Nailong','Cyber','Elite','Ghost','King','Pro','xX','Neo'], b=['Hunter','Slayer','Boss','Ninja','Wolf','Dragon','Storm','Blade'];
      show(btn('go','Generate Nickname')+'<input id="out" class="form-input" style="margin-top:10px;" readonly>'+btn('copy','Salin'));
      document.getElementById('go').onclick=function(){
        document.getElementById('out').value=a[Math.floor(Math.random()*a.length)]+b[Math.floor(Math.random()*b.length)]+Math.floor(Math.random()*99);
      }; copyBtn('copy');
    },
    color: function(){
      show('<input type="color" id="c" value="#FFC107" style="width:100%;height:48px;border:none;border-radius:10px;">'+btn('go','Ambil HEX')+'<input id="out" class="form-input" style="margin-top:10px;" readonly>'+btn('copy','Salin'));
      document.getElementById('go').onclick=function(){ document.getElementById('out').value=document.getElementById('c').value; }; copyBtn('copy');
    },
    lorem: function(){
      var L='Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ';
      show(field('Jumlah kalimat','n','5','number')+btn('go','Generate')+'<textarea id="out" class="form-input" rows="5" style="margin-top:10px;"></textarea>');
      document.getElementById('go').onclick=function(){ var n=parseInt(document.getElementById('n').value,10)||3; document.getElementById('out').value=L.repeat(n); };
    },
    fakeid: function(){
      var names=['Budi','Andi','Siti','Rina','Agus','Dewi'], cities=['Jakarta','Bandung','Surabaya','Medan','Makassar'];
      show(btn('go','Generate Data')+'<pre id="out" style="margin-top:10px;background:#0a0e18;padding:12px;border-radius:10px;color:#cfd8dc;font-size:12px;"></pre>');
      document.getElementById('go').onclick=function(){
        var n=names[Math.floor(Math.random()*names.length)]+' '+names[Math.floor(Math.random()*names.length)];
        document.getElementById('out').textContent='Nama: '+n+'\nKota: '+cities[Math.floor(Math.random()*cities.length)]+'\nEmail: '+n.toLowerCase().replace(/ /g,'.')+'@mail.com\nHP: 628'+Math.floor(100000000+Math.random()*899999999);
      };
    },
    encode: function(){
      show(ta('Teks','t','')+btn('enc','Encode Base64')+btn('dec','Decode Base64')+'<textarea id="out" class="form-input" rows="3" style="margin-top:10px;"></textarea>');
      document.getElementById('enc').onclick=function(){ try{document.getElementById('out').value=btoa(unescape(encodeURIComponent(document.getElementById('t').value||'')));}catch(e){document.getElementById('out').value='Error';} };
      document.getElementById('dec').onclick=function(){ try{document.getElementById('out').value=decodeURIComponent(escape(atob(document.getElementById('t').value||'')));}catch(e){document.getElementById('out').value='Error';} };
    },
    url: function(){
      show(ta('URL / teks','t','')+btn('enc','Encode')+btn('dec','Decode')+'<textarea id="out" class="form-input" rows="3" style="margin-top:10px;"></textarea>');
      document.getElementById('enc').onclick=function(){ document.getElementById('out').value=encodeURIComponent(document.getElementById('t').value||''); };
      document.getElementById('dec').onclick=function(){ try{document.getElementById('out').value=decodeURIComponent(document.getElementById('t').value||'');}catch(e){document.getElementById('out').value='Error';} };
    },
    hash: async function(){
      show(ta('Teks','t','')+btn('md','MD5 (simple)')+btn('sha','SHA-256')+'<input id="out" class="form-input" style="margin-top:10px;" readonly>'+btn('copy','Salin'));
      document.getElementById('md').onclick=function(){
        // simple non-crypto visual hash
        var s=document.getElementById('t').value||'', h=0;
        for(var i=0;i<s.length;i++) h=((h<<5)-h)+s.charCodeAt(i)|0;
        document.getElementById('out').value=('00000000'+(h>>>0).toString(16)).slice(-8)+Math.abs(h).toString(16).padStart(8,'0');
      };
      document.getElementById('sha').onclick=async function(){
        var buf=await crypto.subtle.digest('SHA-256', new TextEncoder().encode(document.getElementById('t').value||''));
        document.getElementById('out').value=Array.from(new Uint8Array(buf)).map(function(b){return b.toString(16).padStart(2,'0');}).join('');
      }; copyBtn('copy');
    },
    case: function(){
      show(ta('Teks','t','')+btn('up','UPPER')+btn('lo','lower')+btn('rev','Reverse')+'<textarea id="out" class="form-input" rows="3" style="margin-top:10px;"></textarea>');
      document.getElementById('up').onclick=function(){ document.getElementById('out').value=(document.getElementById('t').value||'').toUpperCase(); };
      document.getElementById('lo').onclick=function(){ document.getElementById('out').value=(document.getElementById('t').value||'').toLowerCase(); };
      document.getElementById('rev').onclick=function(){ document.getElementById('out').value=(document.getElementById('t').value||'').split('').reverse().join(''); };
    },
    word: function(){
      show(ta('Teks','t','')+btn('go','Hitung')+'<p id="out" style="margin-top:10px;color:#FFC107;font-weight:700;"></p>');
      document.getElementById('go').onclick=function(){
        var t=document.getElementById('t').value||'', w=t.trim()?t.trim().split(/\s+/).length:0;
        document.getElementById('out').textContent='Kata: '+w+' · Karakter: '+t.length+' · Tanpa spasi: '+t.replace(/\s/g,'').length;
      };
    },
    morse: function(){
      var M={A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',J:'.---',K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',S:'...',T:'-',U:'..-',V:'...-',W:'.--',X:'-..-',Y:'-.--',Z:'--..','0':'-----','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....','6':'-....','7':'--...','8':'---..','9':'----.',' ':'/'};
      show(ta('Teks','t','HELLO')+btn('go','Ke Morse')+'<textarea id="out" class="form-input" rows="3" style="margin-top:10px;"></textarea>');
      document.getElementById('go').onclick=function(){
        document.getElementById('out').value=(document.getElementById('t').value||'').toUpperCase().split('').map(function(c){return M[c]||c;}).join(' ');
      };
    },
    bin: function(){
      show(ta('Teks','t','Hi')+btn('enc','Ke Binary')+btn('dec','Dari Binary')+'<textarea id="out" class="form-input" rows="3" style="margin-top:10px;"></textarea>');
      document.getElementById('enc').onclick=function(){ document.getElementById('out').value=(document.getElementById('t').value||'').split('').map(function(c){return c.charCodeAt(0).toString(2).padStart(8,'0');}).join(' '); };
      document.getElementById('dec').onclick=function(){ try{ document.getElementById('out').value=(document.getElementById('t').value||'').trim().split(/\s+/).map(function(b){return String.fromCharCode(parseInt(b,2));}).join(''); }catch(e){ document.getElementById('out').value='Error'; } };
    },
    slug: function(){
      show(field('Teks','t','Judul Artikel')+btn('go','Slugify')+'<input id="out" class="form-input" style="margin-top:10px;" readonly>'+btn('copy','Salin'));
      document.getElementById('go').onclick=function(){
        document.getElementById('out').value=(document.getElementById('t').value||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
      }; copyBtn('copy');
    },
    json: function(){
      show(ta('JSON','t','{"a":1}')+btn('go','Format')+'<textarea id="out" class="form-input" rows="6" style="margin-top:10px;"></textarea>');
      document.getElementById('go').onclick=function(){ try{ document.getElementById('out').value=JSON.stringify(JSON.parse(document.getElementById('t').value||'{}'),null,2); }catch(e){ document.getElementById('out').value='JSON tidak valid'; } };
    },
    qr: function(){
      show(field('Teks / URL','t','https://')+btn('go','Generate QR')+'<div id="out" style="text-align:center;margin-top:12px;"></div>');
      document.getElementById('go').onclick=function(){
        var t=encodeURIComponent(document.getElementById('t').value||'nailong');
        document.getElementById('out').innerHTML='<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data='+t+'" alt="QR" style="border-radius:12px;background:#fff;padding:8px;">';
      };
    },
    barcode: function(){
      show(field('Kode (angka)','t','8991002105123')+btn('go','Barcode Text')+'<div id="out" style="text-align:center;margin-top:12px;background:#fff;padding:12px;border-radius:12px;"></div>');
      document.getElementById('go').onclick=function(){
        var t=encodeURIComponent(document.getElementById('t').value||'123');
        document.getElementById('out').innerHTML='<img src="https://barcode.tec-it.com/barcode.ashx?data='+t+'&code=Code128&translate-esc=true" alt="BC" style="max-width:100%;">';
      };
    },
    yt: function(){
      show(field('URL / ID YouTube','t','dQw4w9WgXcQ')+btn('go','Ambil Thumbnail')+'<div id="out" style="text-align:center;margin-top:12px;"></div>');
      document.getElementById('go').onclick=function(){
        var v=(document.getElementById('t').value||'').replace(/.*(?:v=|youtu\.be\/)/,'').slice(0,11);
        document.getElementById('out').innerHTML='<img src="https://img.youtube.com/vi/'+v+'/maxresdefault.jpg" style="width:100%;border-radius:12px;" onerror="this.src=\'https://img.youtube.com/vi/'+v+'/hqdefault.jpg\'">';
      };
    },
    meta: function(){
      show(field('URL website','t','https://')+'<p style="font-size:12px;color:#8aa0b8;">Buka di tab baru untuk cek preview OG.</p>'+btn('go','Buka'));
      document.getElementById('go').onclick=function(){ var u=document.getElementById('t').value||''; if(u) window.open(u,'_blank'); };
    },
    uang: function(){
      show(field('Angka','t','1500000','number')+btn('go','Format Rp')+'<input id="out" class="form-input" style="margin-top:10px;" readonly>');
      document.getElementById('go').onclick=function(){
        var n=parseInt(String(document.getElementById('t').value).replace(/\D/g,''),10)||0;
        document.getElementById('out').value='Rp '+n.toLocaleString('id-ID');
      };
    },
    persen: function(){
      show(field('Nilai','a','100000','number')+field('Persen %','b','10','number')+btn('go','Hitung')+'<p id="out" style="margin-top:10px;color:#FFC107;font-weight:700;"></p>');
      document.getElementById('go').onclick=function(){
        var a=parseFloat(document.getElementById('a').value)||0, b=parseFloat(document.getElementById('b').value)||0;
        document.getElementById('out').textContent=(b/100*a).toLocaleString('id-ID')+' (dari '+a.toLocaleString('id-ID')+')';
      };
    },
    waktu: function(){
      show(btn('now','Unix Sekarang')+field('Unix timestamp','t','','number')+btn('go','Ke Tanggal')+'<p id="out" style="margin-top:10px;color:#cfd8dc;"></p>');
      document.getElementById('now').onclick=function(){ document.getElementById('t').value=Math.floor(Date.now()/1000); document.getElementById('out').textContent=new Date().toLocaleString('id-ID'); };
      document.getElementById('go').onclick=function(){ var n=parseInt(document.getElementById('t').value,10); document.getElementById('out').textContent=isNaN(n)?'-':new Date(n*1000).toLocaleString('id-ID'); };
    },
    diff: function(){
      show(field('Tanggal 1','a','2026-01-01','date')+field('Tanggal 2','b','2026-12-31','date')+btn('go','Selisih')+'<p id="out" style="margin-top:10px;color:#FFC107;font-weight:700;"></p>');
      document.getElementById('go').onclick=function(){
        var d1=new Date(document.getElementById('a').value), d2=new Date(document.getElementById('b').value);
        var days=Math.round((d2-d1)/86400000);
        document.getElementById('out').textContent=days+' hari';
      };
    },
    ip: async function(){
      show('<p style="color:#8aa0b8;font-size:12px;">Mendeteksi IP publik…</p><pre id="out" style="background:#0a0e18;padding:12px;border-radius:10px;color:#cfd8dc;font-size:12px;"></pre>');
      try{
        var r=await fetch('https://ipapi.co/json/'); var j=await r.json();
        document.getElementById('out').textContent=JSON.stringify({ip:j.ip,city:j.city,region:j.region,country:j.country_name,org:j.org},null,2);
      }catch(e){ document.getElementById('out').textContent='Gagal ambil IP'; }
    },

    deployzip: function(){
      show(
        '<div style="font-size:12px;color:#8aa0b8;line-height:1.5;margin-bottom:12px;">'+
        '<b style="color:#FFC107;">Request Deploy Otomatis</b><br>'+
        '1) Isi <b>nama domain</b> yang diinginkan<br>'+
        '2) Pilih <b>Netlify</b> atau <b>Vercel</b><br>'+
        '3) Upload <b>ZIP</b> website kamu<br>'+
        'Sistem ekstrak &amp; kirim ke panel admin. Jika API token terpasang, domain langsung aktif tanpa admin kerjakan manual.'+
        '</div>'+
        '<label>Nama domain (tanpa .vercel.app / .netlify.app)</label>'+
        '<input type="text" id="depName" class="form-input" placeholder="contoh: toko-saya">'+
        '<label style="margin-top:8px;display:block;">Platform</label>'+
        '<select id="depPlat" class="form-input"><option value="netlify">Netlify (.netlify.app)</option><option value="vercel">Vercel (.vercel.app)</option></select>'+
        '<label style="margin-top:8px;display:block;">File ZIP website</label>'+
        '<input type="file" id="depZip" class="form-input" accept=".zip,application/zip">'+
        '<button type="button" class="btn-pesan" id="depGo" style="width:100%;margin-top:12px;">Kirim Request Deploy</button>'+
        '<div id="out" style="margin-top:12px;font-size:12px;color:#cfd8dc;line-height:1.5;"></div>'+
        '<div id="depNeed" style="margin-top:14px;padding:12px;border-radius:12px;background:rgba(255,193,7,0.08);border:1px solid rgba(255,193,7,0.2);font-size:11px;color:#cfd8dc;line-height:1.55;">'+
        '<b style="color:#FFC107;">API yang dibutuhkan (isi di deploy-config.js)</b><br>'+
        '• <b>NETLIFY_TOKEN</b> — dari app.netlify.com → User settings → Personal access tokens<br>'+
        '• <b>VERCEL_TOKEN</b> — dari vercel.com → Settings → Tokens<br>'+
        'Tanpa token: request tetap masuk panel admin (ZIP bisa diunduh). Dengan token: domain langsung dikirim ke user.'+
        '</div>'
      );
      document.getElementById('depGo').onclick = async function(){
        var out = document.getElementById('out');
        var name = (document.getElementById('depName').value||'').trim();
        var plat = document.getElementById('depPlat').value;
        var file = document.getElementById('depZip').files[0];
        if (!name) return alert('Isi nama domain');
        if (!file) return alert('Upload ZIP');
        if (!window.NailongDeploy) return alert('Sistem deploy belum load. Refresh halaman.');
        out.innerHTML = '<span style="color:#FFC107">Memproses ZIP &amp; mengirim request…</span>';
        try {
          var rec = await NailongDeploy.submitRequest({ name: name, platform: plat, file: file });
          var html = '<b style="color:#69f0ae">Request terkirim</b><br>ID: '+rec.id+'<br>Nama: '+rec.name+'<br>Platform: '+rec.platform+'<br>Status: <b>'+rec.status+'</b>';
          if (rec.domain) html += '<br>Domain: <a href="'+rec.domain+'" target="_blank" style="color:#FFC107">'+rec.domain+'</a>';
          if (rec.error) html += '<br><span style="color:#ff8a80">'+rec.error+'</span>';
          if (rec.status === 'pending') html += '<br><br>Menunggu auto-deploy / admin. Cek lagi nanti di Tools atau tanya admin.';
          if (rec.status === 'live') html += '<br><br>Langsung pakai domain di atas — tidak perlu setup manual.';
          out.innerHTML = html;
        } catch (e) {
          out.innerHTML = '<span style="color:#ff8a80">Gagal: '+(e.message||e)+'</span>';
        }
      };
    },
    hostcheck: function(){
      show(
        field('URL website','u','https://namamu.vercel.app')+btn('go','Cek online')+
        '<pre id="out" style="margin-top:10px;background:#0a0e18;padding:12px;border-radius:10px;color:#cfd8dc;font-size:12px;"></pre>'
      );
      document.getElementById('go').onclick = async function(){
        var u = document.getElementById('u').value.trim();
        var out = document.getElementById('out');
        out.textContent = 'Mengecek…';
        try {
          var t0 = Date.now();
          var r = await fetch(u, { mode: 'no-cors' });
          out.textContent = 'Request dikirim ('+(Date.now()-t0)+'ms).\nMode no-cors — jika URL valid, site biasanya online.\nBuka manual: '+u;
        } catch(e){ out.textContent = 'Error: '+e.message; }
      };
    },
    htmlpreview: function(){
      show(ta('Kode HTML','t','<h1>Halo</h1>')+btn('go','Preview')+'<iframe id="out" style="width:100%;height:220px;margin-top:10px;border:1px solid #333;border-radius:10px;background:#fff;"></iframe>');
      document.getElementById('go').onclick=function(){
        var doc = document.getElementById('out').contentDocument;
        doc.open(); doc.write(document.getElementById('t').value||''); doc.close();
      };
    },
    minify: function(){
      show(ta('CSS / JS','t','')+btn('go','Minify sederhana')+'<textarea id="out" class="form-input" rows="5" style="margin-top:10px;"></textarea>');
      document.getElementById('go').onclick=function(){
        var t=document.getElementById('t').value||'';
        document.getElementById('out').value=t.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/.*$/gm,'').replace(/\s+/g,' ').trim();
      };
    },
    regex: function(){
      show(field('Pattern','p','\\d+')+ta('Teks','t','abc 123 def')+btn('go','Test')+'<pre id="out" style="margin-top:10px;color:#FFC107;font-size:12px;"></pre>');
      document.getElementById('go').onclick=function(){
        try {
          var re = new RegExp(document.getElementById('p').value, 'g');
          var m = (document.getElementById('t').value||'').match(re);
          document.getElementById('out').textContent = m ? m.join('\n') : '(tidak match)';
        } catch(e){ document.getElementById('out').textContent = e.message; }
      };
    },
    difftext: function(){
      show(ta('Teks A','a','')+ta('Teks B','b','')+btn('go','Bandingkan')+'<pre id="out" style="margin-top:10px;font-size:12px;color:#cfd8dc;"></pre>');
      document.getElementById('go').onclick=function(){
        var a=(document.getElementById('a').value||'').split('\n'), b=(document.getElementById('b').value||'').split('\n');
        var lines=[], max=Math.max(a.length,b.length);
        for(var i=0;i<max;i++){
          if(a[i]===b[i]) lines.push('  '+(a[i]||''));
          else { if(a[i]!==undefined) lines.push('- '+a[i]); if(b[i]!==undefined) lines.push('+ '+b[i]); }
        }
        document.getElementById('out').textContent=lines.join('\n');
      };
    },

    useragent: function(){
      show('<pre id="out" style="background:#0a0e18;padding:12px;border-radius:10px;color:#cfd8dc;font-size:12px;word-break:break-all;"></pre>');
      document.getElementById('out').textContent=navigator.userAgent+'\n\nPlatform: '+navigator.platform+'\nLanguage: '+navigator.language;
    }
  };

  function openTool(t){
    if (!handlers[t]) {
      if (area) area.innerHTML = '<p style="color:#8aa0b8;">Tool tidak ditemukan. <a class="theme-link" href="tools.html">Kembali</a></p>';
      return;
    }
    if (panel) panel.classList.add('active');
    handlers[t]();
  }

  document.addEventListener('DOMContentLoaded', function(){
    area=document.getElementById('toolArea'); panel=document.getElementById('toolPanel');
    var backBtn = document.getElementById('toolBack');
    if (backBtn) backBtn.onclick = function(){
      if (/tool\.html/i.test(location.pathname)) location.href = 'tools.html';
      else back();
    };
    document.querySelectorAll('.tool-card').forEach(function(c){
      c.onclick=function(){
        var t=c.getAttribute('data-tool');
        if (!t) return;
        // halaman sendiri
        location.href = 'tool.html?id=' + encodeURIComponent(t);
      };
    });
    // auto-open jika di tool.html?id=
    var q = new URLSearchParams(location.search).get('id');
    if (q && area) openTool(q);
  });

  window.NailongTools = { open: openTool, handlers: handlers };
})();

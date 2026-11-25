/* ===== Intro fallback ===== */
(function(){setTimeout(function(){var i=document.getElementById('intro');if(i&&!window.__introRan)i.style.display='none'},6000);})();
/* ===== Grain + fallback bila library gagal dimuat ===== */
(function(){
/* grain kecil dibuat sekali lewat canvas (lebih ringan dari filter SVG layar penuh di iOS) */
try{var gc=document.createElement('canvas');gc.width=gc.height=128;var gx=gc.getContext('2d'),gi=gx.createImageData(128,128);for(var gi_i=0;gi_i<gi.data.length;gi_i+=4){gi.data[gi_i]=gi.data[gi_i+1]=gi.data[gi_i+2]=255;gi.data[gi_i+3]=Math.random()*140}gx.putImageData(gi,0,0);document.documentElement.style.setProperty('--grain','url('+gc.toDataURL()+')')}catch(e){}
/* grain abu halus untuk band abu: 256px ditampilkan 128px (2x lebih rapat), alpha rata-rata 3 acak = distribusi lonceng (tanpa titik ekstrem) */
try{var dc=document.createElement('canvas');dc.width=dc.height=256;var dx=dc.getContext('2d'),di=dx.createImageData(256,256);for(var dk=0;dk<di.data.length;dk+=4){di.data[dk]=di.data[dk+1]=di.data[dk+2]=120;di.data[dk+3]=(Math.random()+Math.random()+Math.random())/3*150}dx.putImageData(di,0,0);document.documentElement.style.setProperty('--grain-d','url('+dc.toDataURL()+')')}catch(e){}
/* kalau library CDN gagal dimuat (offline / diblokir), jangan biarkan layar hitam: tampilkan halaman apa adanya */
window.addEventListener('load',function(){if(!(window.gsap&&window.ScrollTrigger)){document.documentElement.classList.remove('js');var i=document.getElementById('intro');if(i)i.style.display='none'}});
})();
/* ===== CTA booking ===== */
/* CTA brand: buka form booking dengan "Brand event" sudah terpilih (scroll tetap ditangani handler anchor utama) */
(function(){var a=document.querySelector('.lu-cta a');if(!a)return;a.addEventListener('click',function(){var s=document.querySelector('#bform select[name="type"]');if(s)s.value=a.getAttribute('data-prefill')})})();
/* ===== Visibility observer ===== */
(function(){if(!('IntersectionObserver' in window))return;var io=new IntersectionObserver(function(es){es.forEach(function(e){e.target.classList.toggle('off',!e.isIntersecting)})},{rootMargin:'80px'});['top'].forEach(function(i){var h=document.getElementById(i);h&&io.observe(h)});var r=document.querySelector('.run-band');r&&io.observe(r)})();
/* ===== FAB ===== */
/* FAB: muncul setelah scroll ±50% layar, sembunyi saat form booking / footer terlihat */
(function(){var f=document.querySelector('.fab');if(!f)return;var t=[].slice.call(document.querySelectorAll('#book,footer')),hid=false;
function u(){f.classList.toggle('show',scrollY>innerHeight*.5&&!hid)}
var io=new IntersectionObserver(function(es){es.forEach(function(e){e.target._v=e.isIntersecting});hid=t.some(function(x){return x._v});u()},{threshold:.1});t.forEach(function(x){io.observe(x)});
u();
/* teks berputar: makin cepat saat scroll (sesuai kecepatan scroll), lalu pelan-pelan kembali normal */
var rg=f.querySelector('.fab-ring'),ly=scrollY,lt=performance.now(),rate=1,raf=0;
var sa=null;function spin(){if(sa)return sa;sa=(rg.getAnimations&&rg.getAnimations().filter(function(x){return x.animationName==='fabSpin'})[0])||null;return sa}
function tick(){var a=spin();rate+=(1-rate)*.05;if(rate<1.03)rate=1;if(a)a.playbackRate=rate;raf=rate>1?requestAnimationFrame(tick):0}
var pend=false;
addEventListener('scroll',function(){if(pend)return;pend=true;requestAnimationFrame(function(){pend=false;u();var y=scrollY,n=performance.now(),v=Math.abs(y-ly)/Math.max(1,n-lt);ly=y;lt=n;
  var tg=1+Math.min(v*4,9);if(tg>rate)rate+=(tg-rate)*.4;var a=spin();if(a)a.playbackRate=rate;if(!raf)raf=requestAnimationFrame(tick)})},{passive:true});
})();
/* ===== Venues toggle ===== */
/* venue: View more / View less. Mobile menampilkan 6 dulu (.m ikut disembunyikan), sisanya (.x) disembunyikan di semua ukuran.
   Animasi: tinggi wall dianimasikan (clip), tile hanya fade (tanpa geser, supaya garis grid tidak bergetar), scroll dijaga saat menutup. */
(function(){var w=document.getElementById('wall'),b=document.querySelector('.vm-btn');if(!w||!b)return;
var rm=matchMedia('(prefers-reduced-motion: reduce)').matches,busy=false,g=window.gsap;
function state(o){b.setAttribute('aria-expanded',o);b.setAttribute('aria-label',o?'View fewer venues':'View more venues')}
function lv(){try{return typeof lenis!=='undefined'&&lenis}catch(e){return false}}
function setY(y){if(lv())lenis.scrollTo(y,{immediate:true,force:true});else scrollTo(0,y)}
function H(){return w.getBoundingClientRect().height}
function autoH(){w.style.height='auto';return H()}
function refresh(){if(window.ScrollTrigger)ScrollTrigger.refresh()}
function clr(a){a.forEach(function(e){e.style.opacity='';e.style.visibility=''})}
function open(){
  busy=true;state(true);
  var cta=[].slice.call(w.querySelectorAll('.lg-cta'));
  var hid=[].slice.call(w.querySelectorAll('.lg')).filter(function(e){return getComputedStyle(e).display==='none'});
  w.classList.add('open');
  var fresh=hid.filter(function(e){return getComputedStyle(e).display!=='none'}).concat(cta);
  w.style.height='';
  /* ringan: tinggi tidak dianimasikan (tidak ada layout per frame), tile baru cuma fade + naik sedikit (opacity/transform saja) */
  if(rm||!g){clr(fresh);refresh();busy=false;return}
  g.fromTo(fresh,{autoAlpha:0,y:14},{autoAlpha:1,y:0,duration:.4,stagger:{amount:.16},ease:'power2.out',clearProps:'opacity,visibility,transform',onComplete:function(){refresh();busy=false}});
}
function close(){
  busy=true;state(false);
  var mob=matchMedia('(max-width:767px)').matches,cta=[].slice.call(w.querySelectorAll('.lg-cta'));
  var tiles=[].slice.call(w.querySelectorAll(mob?'.lg.x,.lg.m':'.lg.x'));
  function collapse(){
    /* tombol View more dijaga di posisi layar yang sama: scroll dikoreksi sekali, bukan tiap frame */
    var h0=H(),y0=scrollY;w.classList.remove('open');clr(tiles);w.style.height='';
    var h1=H();setY(y0-(h0-h1));
    if(rm||!g){clr(cta);refresh();busy=false;return}
    g.fromTo(cta,{autoAlpha:0},{autoAlpha:1,duration:.25,ease:'power1.out',clearProps:'opacity,visibility',onComplete:function(){refresh();busy=false}});
  }
  if(rm||!g)collapse();
  else g.to(tiles.concat(cta).reverse(),{autoAlpha:0,duration:.14,stagger:{amount:.06},ease:'power1.in',onComplete:collapse});
}
b.addEventListener('click',function(){if(busy)return;b.getAttribute('aria-expanded')==='true'?close():open()});
})();
/* ===== Listen (Kolektikan Vol. 1) ===== */
/* ===== LISTEN: multi-track player. SoundCloud Widget API (iframe tersembunyi) + waveform seek + jumlah play live ===== */
(function(){
  var root=document.getElementById('kl'); if(!root) return;
  var rows=[].slice.call(root.querySelectorAll('.kl-row')), n=rows.length;
  var $=function(i){return document.getElementById(i)};
  var elCover=$('klCover'),elTitle=$('klTitle'),elNow=$('klNow'),
      elCur=$('klCur'),elDur=$('klDur'),elWf=$('klWf'),cv=$('klCv'),tip=$('klTip'),
      elBox=$('klWfw'),elSt=$('klSt');
  var COVER0=elCover.getAttribute('src');
  var FLAGS='&hide_related=true&show_comments=false&show_reposts=false&show_teaser=false&visual=false';
  var OPT={hide_related:true,show_comments:false,show_reposts:false,show_teaser:false,visual:false};
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;

  var idx=0,loadedIdx=-1,widget=null,wp=null,apiP=null;
  var playing=false,hasPlayed=false,dur=0,lastPos=0,lastTs=0,lastSec=-1;
  var growRaf=0,born=0,drag=false,dragRatio=0,hoverRatio=null,vis=false,raf=0;
  var spin=null,more=$('klMore'),isOpen=false,busy=false,xs=[].slice.call(root.querySelectorAll('.kl-list li.x'));
  var wf=[],counts=rows.map(function(r){return parseInt(r.dataset.plays,10)||0});

  function now(){return (window.performance&&performance.now)?performance.now():Date.now()}
  function fmt(ms){if(!isFinite(ms)||ms<0)ms=0;var s=Math.floor(ms/1000);return Math.floor(s/60)+':'+('0'+(s%60)).slice(-2)}
  function slug(u){return u.replace(/[?#].*$/,'').split('/').pop()}
  /* judul: semua Plus Jakarta Sans, nama DJ (bagian "(NAMA Edit)") bold caps */
  function setTitle(t){
    var m=/\(([^()]+?)\s+Edit\)/i.exec(t);
    elTitle.textContent='';
    if(!m){elTitle.textContent=t;return}
    var dj=document.createElement('span');dj.className='dj';dj.textContent=m[1];
    elTitle.appendChild(document.createTextNode(t.slice(0,m.index+1)));
    elTitle.appendChild(dj);
    elTitle.appendChild(document.createTextNode(' Edit)'+t.slice(m.index+m[0].length)));
  }
  function status(t){elSt.textContent=t||''}
  function fmtCount(v){
    if(v<10000)return v.toLocaleString('en-US');
    if(v<1e6)return (v/1000).toFixed(1).replace(/\.0$/,'')+'K';
    return (v/1e6).toFixed(1).replace(/\.0$/,'')+'M';
  }
  function renderCount(i){var b=rows[i].querySelector('.kl-pc b');if(b&&counts[i])b.textContent=fmtCount(counts[i])}
  function curPos(){return playing?Math.min(dur||1e12,lastPos+(now()-lastTs)):lastPos}
  function curRatio(){return dur?Math.min(1,curPos()/dur):0}

  /* waveform */
  function seeded(str){
    var h=2166136261;for(var i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}
    return function(){h+=0x6D2B79F5;var t=h;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}
  }
  function fakeWave(key){
    var r=seeded(key),N=256,out=[],p1=r()*6,p2=r()*6;
    for(var i=0;i<N;i++){
      var e=.5+.22*Math.sin(i/N*9+p1)+.14*Math.sin(i/N*23+p2);
      var v=e*(.55+.45*r());if(i%8<2)v*=1.18;
      out.push(Math.max(.08,Math.min(1,v)));
    }
    return out;
  }
  function getWf(i){return wf[i]||(wf[i]={s:fakeWave(slug(rows[i].dataset.url)),real:false})}
  function resample(arr,N,max){
    var out=[],L=arr.length;
    for(var k=0;k<N;k++){
      var a=Math.floor(k*L/N),b=Math.max(a+1,Math.floor((k+1)*L/N)),m=0,sum=0;
      for(var j=a;j<b&&j<L;j++){sum+=arr[j];if(arr[j]>m)m=arr[j]}
      out.push(Math.min(1,(.5*m+.5*sum/(b-a))/max));
    }
    return out;
  }
  function loadWaveform(i,url){
    if(!url||(wf[i]&&wf[i].real)||!window.fetch)return;
    fetch(url.replace(/\.png(\?.*)?$/,'.json')).then(function(r){return r.json()}).then(function(j){
      if(!j||!j.samples||!j.samples.length)return;
      var max=j.height||Math.max.apply(null,j.samples)||1;
      wf[i]={s:resample(j.samples,256,max),real:true};
      if(i===idx)startGrow();
    }).catch(function(){});
  }
  function startGrow(){
    born=now();
    if(growRaf||reduce)return;
    (function f(){growRaf=0;draw();if(now()-born<1000)growRaf=requestAnimationFrame(f)})();
  }
  function rr(ctx,x,y,w,h,r){
    if(ctx.roundRect){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill()}
    else ctx.fillRect(x,y,w,h);
  }
  function draw(){
    var w=cv.clientWidth,h=cv.clientHeight;if(!w||!h)return;
    var dpr=Math.min(window.devicePixelRatio||1,2),W=Math.round(w*dpr),H=Math.round(h*dpr);
    if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H}
    var ctx=cv.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
    var bw=w<360?2:(w<520?2.2:2.6),gap=w<520?1.5:1.8,step=bw+gap,nb=Math.max(10,Math.floor((w+gap)/step));
    var s=getWf(idx).s,L=s.length,p=drag?dragRatio:curRatio(),hv=hoverRatio,x0=(w-(nb*step-gap))/2;
    var base=h*.7,gt=reduce?1e5:now()-born;
    for(var i=0;i<nb;i++){
      var a=Math.floor(i*L/nb),b=Math.max(a+1,Math.floor((i+1)*L/nb)),m=0;
      for(var k=a;k<b;k++)if(s[k]>m)m=s[k];
      var e=Math.min(1,Math.max(0,(gt-(i/nb)*420)/460));e=1-Math.pow(1-e,3);
      var up=Math.max(2,Math.pow(m,.8)*base*.96*e),dn=up*.34,pos=(i+.5)/nb,x=x0+i*step;
      var on=pos<=p,pv=!on&&hv!==null&&pos<=hv;
      ctx.fillStyle=on?'#fff':(pv?'rgba(255,255,255,.62)':'rgba(255,255,255,.3)');
      rr(ctx,x,base-up,bw,up,bw/2);
      ctx.fillStyle=on?'rgba(255,255,255,.34)':(pv?'rgba(255,255,255,.24)':'rgba(255,255,255,.1)');
      rr(ctx,x,base+1.5,bw,dn,bw/2);
    }
    elWf.setAttribute('aria-valuenow',Math.round(curPos()/1000));
    elWf.setAttribute('aria-valuetext',fmt(curPos())+' of '+fmt(dur));
  }

  function tick(){
    raf=0;if(!playing||!vis)return;
    var pos=curPos(),sec=Math.floor(pos/1000);
    if(sec!==lastSec){lastSec=sec;if(!drag)elCur.textContent=fmt(pos)}
    if(!drag)draw();
    raf=requestAnimationFrame(tick);
  }
  function kick(){if(!raf&&playing&&vis)raf=requestAnimationFrame(tick)}

  /* piringan: berputar 33 1/3 RPM dengan inersia (GSAP timeScale), CSS animation sebagai cadangan */
  (function(){
    var d=root.querySelector('.kl-disc');
    if(window.gsap&&d&&!reduce){spin=gsap.to(d,{rotation:360,duration:1.8,ease:'none',repeat:-1}).timeScale(0);root.classList.add('gs')}
  })();

  /* See more / See less: tampil top 3, sisanya dibuka lewat tombol */
  function lv(){try{return typeof lenis!=='undefined'&&lenis}catch(e){return false}}
  function setY(y){var l=lv();if(l)l.scrollTo(y,{immediate:true,force:true});else scrollTo(0,y)}
  function refresh(){if(window.ScrollTrigger)ScrollTrigger.refresh()}
  function clr(){xs.forEach(function(e){e.style.opacity='';e.style.visibility='';e.style.transform=''})}
  function setOpen(o){
    if(o===isOpen||busy)return;
    busy=true;isOpen=o;
    more.setAttribute('aria-expanded',o?'true':'false');
    more.setAttribute('aria-label',o?'See fewer tracks':'See more tracks');
    var g=window.gsap;
    if(o){
      root.classList.add('open');
      if(reduce||!g){busy=false;refresh();return}
      g.fromTo(xs,{autoAlpha:0,y:14},{autoAlpha:1,y:0,duration:.4,stagger:{amount:.16},ease:'power2.out',clearProps:'opacity,visibility,transform',onComplete:function(){busy=false;refresh()}});
    }else{
      var list=$('klList');
      function collapse(){
        var h0=list.getBoundingClientRect().height,y0=window.scrollY;
        root.classList.remove('open');clr();
        var h1=list.getBoundingClientRect().height;setY(y0-(h0-h1));
        busy=false;refresh();
      }
      if(reduce||!g)collapse();
      else g.to(xs.slice().reverse(),{autoAlpha:0,duration:.14,stagger:{amount:.06},ease:'power1.in',onComplete:collapse});
    }
  }
  more.addEventListener('click',function(){setOpen(!isOpen)});

  /* UI */
  function labels(){
    rows.forEach(function(r,i){r.dataset.cur=(i===idx&&playing)?'Pause':'Play'});
  }
  function ui(){
    root.classList.toggle('is-playing',playing);
    elNow.textContent=playing?'Now playing':(hasPlayed?'Paused':'Tap to play');
    if(spin&&window.gsap)gsap.to(spin,{timeScale:playing?1:0,duration:playing?1.2:2,ease:playing?'power2.in':'power2.out',overwrite:true});
    labels();
    if('mediaSession' in navigator)navigator.mediaSession.playbackState=playing?'playing':'paused';
  }
  function markActive(){
    rows.forEach(function(r,i){if(i===idx)r.setAttribute('aria-current','true');else r.removeAttribute('aria-current')});
    var li=rows[idx].parentNode;if(elBox.parentNode!==li)li.appendChild(elBox);
  }
    function setMeta(i){
    var r=rows[i];
    setTitle(r.dataset.title);
    elCur.textContent='0:00';elDur.textContent='--:--';dur=0;lastPos=0;lastSec=-1;
    status('');startGrow();
    if('mediaSession' in navigator&&window.MediaMetadata)
      navigator.mediaSession.metadata=new MediaMetadata({title:r.dataset.title,artist:r.dataset.by,album:'Kolektikan Vol. 1'});
  }

  /* SoundCloud widget */
  function loadApi(){
    if(window.SC&&SC.Widget)return Promise.resolve();
    if(apiP)return apiP;
    apiP=new Promise(function(res,rej){
      var s=document.createElement('script');s.src='https://w.soundcloud.com/player/api.js';
      s.onload=res;s.onerror=function(){apiP=null;rej(new Error('api'))};document.head.appendChild(s);
    });
    return apiP;
  }
  function embedSrc(u,auto){return 'https://w.soundcloud.com/player/?url='+encodeURIComponent(u)+'&auto_play='+(auto?'true':'false')+FLAGS}
  function makeFrame(src){
    var f=document.createElement('iframe');
    f.className='kl-frame';f.title='SoundCloud player';f.allow='autoplay';f.tabIndex=-1;
    f.setAttribute('aria-hidden','true');f.setAttribute('scrolling','no');f.setAttribute('frameborder','no');
    f.src=src;root.appendChild(f);return f;
  }
  function fetchMeta(){
    if(!widget)return;
    widget.getCurrentSound(function(s){
      if(!s)return;
      if(s.permalink_url&&s.permalink_url.indexOf(slug(rows[idx].dataset.url))===-1)return;
      if(s.title){setTitle(s.title);var t=rows[idx].querySelector('.kl-t');if(t)t.textContent=s.title}
      dur=s.duration||dur;elDur.textContent=fmt(dur);
      if(typeof s.playback_count==='number'){counts[idx]=s.playback_count;renderCount(idx)}
      loadWaveform(idx,s.waveform_url);
      draw();
      if('mediaSession' in navigator&&window.MediaMetadata)
        navigator.mediaSession.metadata=new MediaMetadata({title:elTitle.textContent,artist:rows[idx].dataset.by,album:'Kolektikan Vol. 1',artwork:[{src:COVER0,sizes:'500x500'}]});
    });
  }
  function bindEvents(w){
    var E=SC.Widget.Events;
    w.bind(E.PLAY,function(){var was=playing;playing=true;hasPlayed=true;lastTs=now();ui();if(!was)startGrow();status('');kick()});
    w.bind(E.PAUSE,function(){lastPos=curPos();playing=false;ui();draw()});
    w.bind(E.FINISH,function(){lastPos=0;playing=false;ui();go(idx+1>=n?0:idx+1,idx+1<n)});
    w.bind(E.PLAY_PROGRESS,function(e){
      if(!dur&&e.relativePosition>0){dur=e.currentPosition/e.relativePosition;elDur.textContent=fmt(dur)}
      lastPos=e.currentPosition;lastTs=now();
    });
    if(E.ERROR)w.bind(E.ERROR,function(){playing=false;ui();status('This track can\u2019t be played right now.')});
  }
  function ensure(i,auto){
    if(wp)return wp;
    wp=loadApi().then(function(){
      return new Promise(function(resolve){
        var f=makeFrame(embedSrc(rows[i].dataset.url,auto)),w=SC.Widget(f),first=true;
        w.bind(SC.Widget.Events.READY,function(){
          if(first){first=false;widget=w;loadedIdx=i;bindEvents(w);resolve(w)}
          fetchMeta();
        });
      });
    }).catch(function(){wp=null;status('Player failed to load. Check your connection.');throw 0});
    return wp;
  }
  function go(i,auto){
    idx=(i+n)%n;if(idx>=3&&!isOpen)setOpen(true);markActive();setMeta(idx);
    if(loadedIdx!==idx){lastPos=0;playing=false;ui()}
    ensure(idx,auto).then(function(w){
      if(loadedIdx===idx){if(auto&&!playing)w.play();fetchMeta();return}
      loadedIdx=idx;
      var o={auto_play:!!auto,callback:fetchMeta};for(var k in OPT)o[k]=OPT[k];
      w.load(rows[idx].dataset.url,o);
    }).catch(function(){});
  }

  /* jumlah play live: widget kedua membaca playback_count tiap track, diulang tiap 3 menit selama section terlihat */
  var sw=null;
  function whenVisible(fn){if(vis)fn();else setTimeout(function(){whenVisible(fn)},15000)}
  function cycle(i){
    if(i>=n){setTimeout(function(){whenVisible(function(){cycle(0)})},180000);return}
    var done=false,t=setTimeout(function(){if(!done){done=true;cycle(i+1)}},7000),o={auto_play:false};
    for(var k in OPT)o[k]=OPT[k];
    o.callback=function(){
      sw.getCurrentSound(function(s){
        if(done)return;done=true;clearTimeout(t);
        if(s&&typeof s.playback_count==='number'){counts[i]=s.playback_count;renderCount(i)}
        cycle(i+1);
      });
    };
    sw.load(rows[i].dataset.url,o);
  }
  function statsInit(){
    loadApi().then(function(){
      var f=makeFrame(embedSrc(rows[0].dataset.url,false)),w=SC.Widget(f);
      w.bind(SC.Widget.Events.READY,function(){if(!sw){sw=w;cycle(0)}});
    }).catch(function(){});
  }

  /* kontrol */
  rows.forEach(function(r,i){
    r.addEventListener('click',function(){
      if(i===idx&&widget&&loadedIdx===idx){widget.toggle();return}
      go(i,true);
    });
  });
  function commit(r){
    if(!widget||!dur||loadedIdx!==idx)return;
    var ms=Math.max(0,Math.min(.999,r))*dur;
    widget.seekTo(ms);lastPos=ms;lastTs=now();lastSec=-1;
    elCur.textContent=fmt(ms);draw();
  }
  function ratioOf(e){var b=elWf.getBoundingClientRect();return Math.min(1,Math.max(0,(e.clientX-b.left)/b.width))}
  function showTip(r){tip.textContent=fmt(r*dur);tip.style.left=(r*100)+'%';tip.classList.add('on')}
  elWf.addEventListener('pointerdown',function(e){
    drag=true;dragRatio=ratioOf(e);
    try{elWf.setPointerCapture(e.pointerId)}catch(x){}
    showTip(dragRatio);elCur.textContent=fmt(dragRatio*dur);draw();
  });
  elWf.addEventListener('pointermove',function(e){
    var r=ratioOf(e);
    if(drag){dragRatio=r;showTip(r);elCur.textContent=fmt(r*dur);draw()}
    else if(e.pointerType==='mouse'){hoverRatio=r;showTip(r);draw()}
  });
  elWf.addEventListener('pointerup',function(){
    if(!drag)return;drag=false;commit(dragRatio);
    if(hoverRatio===null)tip.classList.remove('on');
  });
  elWf.addEventListener('pointercancel',function(){drag=false;tip.classList.remove('on');draw()});
  elWf.addEventListener('pointerleave',function(){hoverRatio=null;if(!drag)tip.classList.remove('on');draw()});
  elWf.addEventListener('keydown',function(e){
    var step=e.shiftKey?15000:5000,p=curPos(),m=null;
    if(e.key==='ArrowRight'||e.key==='ArrowUp')m=p+step;
    else if(e.key==='ArrowLeft'||e.key==='ArrowDown')m=p-step;
    else if(e.key==='Home')m=0;else if(e.key==='End')m=dur-1000;
    if(m===null||!dur)return;
    e.preventDefault();commit(m/dur);
  });
  if(window.ResizeObserver)new ResizeObserver(function(){draw()}).observe(elWf);
  else window.addEventListener('resize',draw);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)kick()});

  if('mediaSession' in navigator){
    try{
      navigator.mediaSession.setActionHandler('play',function(){if(widget)widget.play()});
      navigator.mediaSession.setActionHandler('pause',function(){if(widget)widget.pause()});
      navigator.mediaSession.setActionHandler('previoustrack',function(){go(idx-1,true)});
      navigator.mediaSession.setActionHandler('nexttrack',function(){go(idx+1,true)});
      navigator.mediaSession.setActionHandler('seekto',function(d){if(dur&&d.seekTime!=null)commit(d.seekTime*1000/dur)});
    }catch(e){}
  }

  /* init: player dibuat saat section mendekati layar (600px) supaya tap pertama langsung bunyi */
  rows.forEach(function(_,i){renderCount(i)});
  markActive();setMeta(0);ui();
  var started=false;
  function boot(){ensure(idx,false).then(function(){setTimeout(statsInit,800)}).catch(function(){})}
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(en){
      vis=en[0].isIntersecting;
      if(vis){kick();draw()}
      if(vis&&!started){started=true;boot()}
    },{rootMargin:'600px 0px'}).observe(root);
  }else{vis=true;started=true;boot()}
})();
/* ===== Main (GSAP, Lenis, nav, talent, gallery, booking, dll) ===== */
const $ = (s) => document.querySelector(s);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
let lenis = null;

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true }); /* address bar HP naik-turun tidak memicu refresh berat */

/* smooth scroll (Lenis) disinkronkan dengan GSAP */
if (!reduce && window.Lenis) {
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
const EASE_IO = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2); /* easeInOutCubic untuk lompatan anchor */
const scrollTo = (id) => (lenis ? lenis.scrollTo(id, { duration: 1.0, easing: EASE_IO }) : $(id).scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }));

/* navbar sticky: transparan di paling atas, blur + sedikit gelap setelah di-scroll */
const nav = $('.nav');
/* semua state scroll lewat ScrollTrigger (tanpa listener scroll + getBoundingClientRect tiap frame) */
ScrollTrigger.create({ start: 40, end: 'max', toggleClass: { targets: nav, className: 'sc' } });
ScrollTrigger.create({ start: 60, end: 'max', toggleClass: { targets: document.documentElement, className: 'hs' } });
const hero = $('.hero');
ScrollTrigger.create({ trigger: hero, start: 'top bottom', end: 'bottom top', onToggle: (st) => hero.classList.toggle('off', !st.isActive), onRefresh: (st) => hero.classList.toggle('off', !st.isActive) });

/* wordmark footer: pas selebar grid, huruf C rata kiri, ekor K italic tidak terpotong */
function fitGiant() {
  const g = $('.giant'), t = g.querySelector('.gt');
  const ctx = document.createElement('canvas').getContext('2d');
  const m = (font, ch) => { ctx.font = font; return ctx.measureText(ch); };
  const c = m('400 100px "Plus Jakarta Sans", system-ui, sans-serif', 'C'), k = m('italic 800 100px "Plus Jakarta Sans", system-ui, sans-serif', 'K');
  const L = -c.actualBoundingBoxLeft / 100;                           /* jarak tepi kiri tinta C (em) */
  const O = Math.max(0, (k.actualBoundingBoxRight - k.width) / 100);  /* tinta K melewati kotaknya (em) */
  g.style.fontSize = '100px'; t.style.marginLeft = '0'; t.style.paddingRight = '0';
  const A = t.getBoundingClientRect().width / 100;                    /* lebar teks (em) */
  const fs = g.clientWidth / (A + 0.03 + O - L);
  g.style.fontSize = fs + 'px';
  t.style.marginLeft = (-L * fs) + 'px';
  t.style.paddingRight = ((O + 0.03) * fs) + 'px';
}
/* hero: layout murni CSS, tidak ada hitungan JS lagi */
function fitHero() { const wm = $('.wm'); if (wm) wm.style.fontSize = wm.style.bottom = wm.style.letterSpacing = wm.style.marginLeft = wm.style.alignSelf = ''; }
document.fonts.ready.then(() => { fitGiant(); fitHero(); });

/* WORDMARK hero: reveal SEKALI setelah intro + hero masuk, lalu kilau putih + glow menyapu. Tanpa loop.
   Tiga gaya (semua hanya transform/opacity, jalur compositor, tanpa blur per frame):
     rise      huruf naik dari bawah lewat masker, miring lalu tegak (default)
     eq        huruf tumbuh dari dasar seperti bar equalizer, dari tengah ke luar
     assemble  huruf melayang dari segala arah lalu berkumpul membentuk kata
   Preview cepat tanpa edit kode: tambahkan ?wm=eq atau ?wm=assemble di URL. */
(() => {
  const wm = $('.wm');
  if (!wm || reduce) return;
  const span = wm.firstElementChild, L = [...wm.querySelectorAll('.wl')];
  L.forEach((l) => (l.dataset.c = l.textContent)); /* teks untuk lapisan glow */
  const CLR = 'transform,opacity,visibility,willChange,transformOrigin', MASK = 'inset(-30% -5% 0 -5%)';
  const STY = {
    rise: {
      hide: () => { wm.style.clipPath = MASK; gsap.set(L, { yPercent: 125, skewY: 10 }); },
      play: (tl) => tl.to(L, { yPercent: 0, skewY: 0, duration: 0.85, ease: 'expo.out', stagger: 0.04, willChange: 'transform' }),
    },
    eq: {
      hide: () => gsap.set(L, { scaleY: 0, transformOrigin: '50% 100%' }),
      play: (tl) => tl.to(L, { scaleY: 1, duration: 0.7, ease: 'back.out(2.4)', stagger: { each: 0.035, from: 'center' }, willChange: 'transform' }),
    },
    assemble: {
      hide: () => gsap.set(L, { autoAlpha: 0 }),
      play: (tl) => tl.fromTo(L,
        { x: () => gsap.utils.random(-180, 180), y: () => gsap.utils.random(-140, 140), rotation: () => gsap.utils.random(-40, 40), scale: () => gsap.utils.random(1.5, 2.4), autoAlpha: 0 },
        { x: 0, y: 0, rotation: 0, scale: 1, autoAlpha: 1, duration: 0.95, ease: 'expo.out', stagger: { each: 0.035, from: 'center' }, willChange: 'transform', immediateRender: false }),
    },
  };
  const S = STY[new URLSearchParams(location.search).get('wm')] || STY.rise;
  let started = false, F = [], G = [];
  const reveal = () => { wm.style.clipPath = ''; gsap.set(L, { clearProps: CLR }); }; /* transform dilepas supaya shine bisa memotong teks */
  S.hide(); /* huruf disembunyikan sejak awal supaya tidak berkedip saat hero fade-in */
  setTimeout(() => { if (!started) { started = true; reveal(); } }, 12000); /* jaring pengaman */
  window.__wmIntro = () => {
    if (started) return; started = true;
    if (scrollY > innerHeight * 0.6) return reveal(); /* hero sudah tidak terlihat: langsung tampil */
    const tl = gsap.timeline({ paused: true });
    S.play(tl);
    tl.add(reveal)
      .add(() => {
        gsap.set(span, { '--sp': '100%' });
        const sr = span.getBoundingClientRect(); /* posisi tengah tiap huruf (0 sampai 1) untuk menyamakan glow dengan pita */
        F = L.map((l) => { const r = l.getBoundingClientRect(); return (r.left + r.width / 2 - sr.left) / sr.width; }); G = L.map(() => -1);
        span.classList.add('sh');
      })
      .to(span, { '--sp': '0%', duration: 1.3, ease: 'sine.inOut', /* warna dasar tetap, hanya pita putih + glow yang lewat */
        onUpdate() {
          const c = 2 * this.ratio - 0.5; /* posisi tengah pita di lebar teks */
          L.forEach((l, i) => {
            const x = 1 - Math.min(Math.abs(c - F[i]) / 0.22, 1), g = Math.round(x * x * (3 - 2 * x) * 100) / 100;
            if (g !== G[i]) { G[i] = g; l.style.setProperty('--g', g); }
          });
        } })
      .add(() => { span.classList.remove('sh'); gsap.set(span, { clearProps: '--sp' }); L.forEach((l) => l.style.removeProperty('--g')); });
    Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 600))]).then(() => tl.play()); /* tunggu font maks 600ms agar tidak melompat */
  };
})();
let fitT, lastW = innerWidth;
addEventListener('resize', () => {
  if (innerWidth === lastW && innerWidth < 1280) return; /* HP: address bar mengubah tinggi saja, tidak perlu hitung ulang */
  lastW = innerWidth; clearTimeout(fitT); fitT = setTimeout(() => { fitGiant(); fitHero(); }, 120);
});

/* menu mobile: buka/tutup dengan satu timeline yang bisa di-reverse */
const btn = $('.pill-menu'), menu = $('#menu'), label = btn.querySelector('span');
const iconGrid = btn.querySelector('svg').outerHTML;
const iconX = '<svg width="10" height="10" viewBox="0 0 10 10" stroke="currentColor" stroke-width="1.4"><path d="M1 1l8 8M9 1l-8 8"/></svg>';
const D = reduce ? 0 : 1;
const tl = gsap.timeline({ paused: true, onReverseComplete: () => gsap.set(menu, { visibility: 'hidden' }) })
  .set(menu, { visibility: 'visible' }, 0)
  .fromTo(menu, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.3 * D, ease: 'power4.inOut' }, 0)
  .from('.menu-links .l', { y: 24, autoAlpha: 0, scale: 0.97, duration: 0.35 * D, stagger: 0.025 * D, ease: 'power4.out' }, 0.08 * D)
  .from('.menu-soc a', { autoAlpha: 0, y: 12, duration: 0.22 * D, stagger: 0.02 * D, ease: 'power3.out' }, 0.22 * D);
let open = false;
const isDesk = () => matchMedia('(min-width:1200px)').matches;
const side = $('.side');
let mode = false; /* true = menu samping (desktop), false = panel (mobile/tablet) */
function setMenu(state) {
  if (state) mode = isDesk();
  open = state;
  btn.setAttribute('aria-expanded', open);
  btn.querySelector('svg').outerHTML = open ? iconX : iconGrid;
  label.textContent = open ? 'Close' : 'Menu';
  nav.classList.toggle('open', open);
  if (mode) {
    side.inert = !open;
    gsap.to('.side a', { autoAlpha: open ? 1 : 0, x: open ? 0 : 14, duration: reduce ? 0 : 0.2, stagger: open ? 0.025 : 0.012, delay: 0, ease: 'power3.out', overwrite: true });
  } else {
    open ? tl.timeScale(1).play() : tl.timeScale(2.2).reverse(); /* menutup lebih cepat dari membuka */
    menu.inert = !open;
    if (lenis) open ? lenis.stop() : lenis.start();
  }
}
{ const mq = matchMedia('(min-width:1200px)'), f = () => open && setMenu(false); mq.addEventListener ? mq.addEventListener('change', f) : mq.addListener(f); }
btn.addEventListener('click', () => setMenu(!open));
addEventListener('keydown', (e) => e.key === 'Escape' && open && setMenu(false));

/* anchor: desktop = menu samping TETAP terbuka (tutup hanya lewat tombol Close / Esc); mobile/tablet = tutup panel dulu, lalu scroll halus */
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a || a.getAttribute('href') === '#') return;
  e.preventDefault();
  const go = () => scrollTo(a.getAttribute('href'));
  if (open && !mode) { setMenu(false); setTimeout(go, 300); } else go();
});

/* navbar pintar: memberi ruang baca saat scroll turun, kembali saat scroll naik, fokus keyboard, menu terbuka, atau dekat atas halaman */
if (!reduce) {
  /* hide/show lewat class (transisi CSS di compositor, bukan tween JS per frame) + ambang gerak: sembunyi setelah turun 24px, muncul setelah naik 12px, supaya tidak kedip saat momentum/rubber-band di HP */
  let hid = false, lastY = scrollY, acc = 0;
  const setHide = (h) => { if (h !== hid) { hid = h; nav.classList.toggle('nh', h); } };
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (st) => {
    const y = st.scroll(), dy = y - lastY; lastY = y;
    if (open || y < 500) { acc = 0; setHide(false); return; }
    if (!dy) return;
    acc = (dy > 0) === (acc > 0) ? acc + dy : dy;
    if (acc > 24) setHide(true); else if (acc < -12) setHide(false);
  } });
  nav.addEventListener('focusin', () => setHide(false));
}

/* ===== INTRO + SCROLL ANIMASI ===== */
if (!reduce) {
  /* state awal animasi scroll, lalu lepas anti-flash (dalam 1 task yang sama, tanpa paint di antaranya) */
  gsap.set('.rv', { autoAlpha: 0, y: 36 }); gsap.set('.stg', { autoAlpha: 0, y: 48 });
  document.documentElement.classList.remove('js');
  /* intro hero: dimainkan setelah opening selesai */
  const heroTl = gsap.timeline({ paused: true })
    .from('.hero-bg', { scale: 1.15, duration: 1.2, ease: 'power3.out' }, 0)
    .call(() => window.__wmIntro && window.__wmIntro(), null, 0.05) /* wordmark langsung mulai, tidak menunggu animasi hero lain selesai */
    .from('.nav, .hero-cta', { autoAlpha: 0, y: 24, duration: 0.8, stagger: 0.1, ease: 'power3.out' }, 0.1)
    .fromTo('.hero .scue', { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', clearProps: 'opacity,visibility,transform' }, 0.4); /* cue: fromTo eksplisit agar tidak bentrok dengan transition CSS-nya */

  /* ===== OPENING: strobe slam ===== */
  const INTRO_ONCE = true; /* true = hanya sekali per sesi (disarankan saat live). Paksa tampil: tambahkan ?intro di URL */
  const intro = $('#intro');
  let seen = false;
  try { seen = INTRO_ONCE && sessionStorage.getItem('ctk-intro') && !/[?&]intro/.test(location.search); } catch (e) {}
  if (seen || reduce) { intro.remove(); heroTl.play(); }
  else {
    window.__introRan = true;
    try { sessionStorage.setItem('ctk-intro', '1'); } catch (e) {}
    const word = $('.iw'), box = $('.ibox'), flash = $('.iflash'), cnt = $('.ic');
    word.innerHTML = [...'COLLECTEAK'].map((c, i) => `<span class="il${i > 5 ? ' b' : ''}">${c}</span>`).join('');
    const L = [...word.children];
    document.documentElement.style.overflow = 'hidden'; lenis && lenis.stop();
    const tl = gsap.timeline({ paused: true, onComplete: () => { intro.remove(); document.documentElement.style.overflow = ''; lenis && lenis.start(); } });
    const hit = (t) => tl.set(flash, { opacity: 1 }, t).set(flash, { opacity: 0 }, t + 0.05); /* kilat putih 3 frame, huruf ter-invert */

    L.forEach((l, i) => { /* tiap huruf menghantam layar: scale besar, geser merah, layar goyang */
      const t = 0.2 + i * 0.07;
      tl.set(l, { opacity: 1 }, t)
        .fromTo(l, { scale: 1.6, filter: 'drop-shadow(12px 0 0 #ff2a1a)' }, { scale: 1, filter: 'drop-shadow(0px 0 0 #ff2a1a)', duration: 0.28, ease: 'expo.out', immediateRender: false }, t)
        .fromTo(box, { x: gsap.utils.random(-16, 16), y: gsap.utils.random(-10, 10) }, { x: 0, y: 0, duration: 0.18, ease: 'power3.out', immediateRender: false }, t)
        .call(() => (cnt.textContent = String(Math.round(((i + 1) / L.length) * 100)).padStart(3, '0')), null, t);
      if (i % 2) hit(t);
    });

    const F = 0.2 + L.length * 0.07 + 0.05; /* strobo final + glitch miring */
    hit(F); hit(F + 0.1); hit(F + 0.2);
    tl.set(box, { skewX: 16, scale: 1.04 }, F).set(box, { skewX: -10 }, F + 0.1).set(box, { skewX: 0, scale: 1 }, F + 0.2);

    tl.addLabel('exit', F + 0.35) /* keluar: teks pecah, tirai terbelah atas dan bawah, hero menyusul */
      .to(box, { scale: 1.1, autoAlpha: 0, duration: 0.22, ease: 'power2.in' }, 'exit')
      .to('.ic, .iskip', { autoAlpha: 0, duration: 0.2 }, 'exit')
      .to('.ip.top', { yPercent: -100, duration: 0.75, ease: 'power4.inOut' }, 'exit+=0.1')
      .to('.ip.bot', { yPercent: 100, duration: 0.75, ease: 'power4.inOut' }, 'exit+=0.1')
      .call(() => heroTl.play(), null, 'exit+=0.15');

    const doSkip = () => { if (intro.isConnected && tl.time() < tl.labels.exit) { cnt.textContent = '100'; tl.seek('exit'); } };
    intro.addEventListener('click', doSkip);
    addEventListener('keydown', (e) => ['Escape', ' ', 'Enter'].includes(e.key) && doSkip());

    Promise.race([
      document.fonts.load('400 100px "Plus Jakarta Sans", system-ui, sans-serif').then(() => document.fonts.load('italic 800 100px "Plus Jakarta Sans", system-ui, sans-serif')).catch(() => {}),
      new Promise((r) => setTimeout(r, 900)),
    ]).then(() => tl.play());
  }
  gsap.to('.hero-bg', { yPercent: 12, ease: 'none', force3D: true, scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } }); /* parallax */
  /* kedalaman: wordmark dan teks hero naik lebih cepat dari foto latar (yPercent terpisah dari animasi masuk yang memakai y) */
  const HERO_ST = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
  gsap.to('.wm', { yPercent: -16, ease: 'none', force3D: true, scrollTrigger: HERO_ST });
  gsap.to('.hero-cta', { yPercent: -8, ease: 'none', force3D: true, scrollTrigger: HERO_ST });
  gsap.matchMedia().add('(min-width: 768px)', () => { /* gallery: kolom bergerak dengan kecepatan berbeda (di HP kolom di-flatten, jadi dilewati) */
    gsap.utils.toArray('.gal .col').forEach((c, i) => { const v = i % 2 ? 44 : 14; gsap.fromTo(c, { y: v }, { y: -v, ease: 'none', force3D: true, scrollTrigger: { trigger: '.gal', start: 'top bottom', end: 'bottom top', scrub: true } }); });
  });
  const REV = { autoAlpha: 1, y: 0, duration: 1, stagger: 0.08, ease: 'power3.out', overwrite: true, clearProps: 'transform,opacity,visibility' }; /* clearProps: layer GPU dilepas setelah selesai */
  ScrollTrigger.batch('.rv', { start: 'top 90%', end: 'max', once: true, onEnter: (b) => gsap.to(b, REV) });
  ScrollTrigger.batch('.stg', { start: 'top 94%', end: 'max', once: true, onEnter: (b) => gsap.to(b, REV) }); /* kartu muncul bergantian */
}

/* ===== CAROUSEL: drag mouse + snap + marker ===== */
function drag(el, onEnd) {
  let down = false, moved = false, sx = 0, lx = 0, sl = 0, v = 0;
  el.addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch') return; down = true; moved = false; sx = lx = e.clientX; sl = el.scrollLeft; v = 0; });
  addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - sx;
    if (!moved && Math.abs(dx) > 4) { moved = true; el.classList.add('drag'); }
    if (moved) { el.scrollLeft = sl - dx; v = lx - e.clientX; lx = e.clientX; }
  });
  const up = () => { if (!down) return; down = false; if (moved) { el.classList.remove('drag'); onEnd && onEnd(v); } };
  addEventListener('pointerup', up); addEventListener('pointercancel', up);
  el.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
}

/* ===== ABOUT: warna kata naik level mengikuti scroll (redup -> terang). Tanpa JS / reduced motion = warna akhir langsung ===== */
(() => {
  const root = $('#about'); if (!root) return;
  const split = (el) => { /* bungkus tiap kata dengan <span class="cw">, <em> ikut terjaga */
    [...el.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const f = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((t) => {
          if (!t) return;
          if (/^\s+$/.test(t)) f.append(t);
          else { const w = document.createElement('span'); w.className = 'cw'; w.textContent = t; f.append(w); }
        });
        n.replaceWith(f);
      } else if (n.nodeType === 1 && !n.matches('b')) split(n);
    });
  };
  root.querySelectorAll('.abt-h, .abt-p').forEach(split);
  /* desktop/tablet: blok teks dipepetkan ke kanan, lebarnya = baris terpanjang, jadi ujung kanan teks sejajar dengan ujung tombol Contact di navbar (dan tepi kanan kartu performer) */
  const body = root.querySelector('.abt-body'), words = [...root.querySelectorAll('.abt-p .cw')];
  const fit = () => {
    body.style.width = ''; body.style.justifySelf = '';
    return; /* about rata tengah: tidak ada penyejajaran ke kanan */
    const l = body.getBoundingClientRect().left;
    const r = Math.max(...words.map((w) => w.getBoundingClientRect().right));
    body.style.width = Math.ceil(r - l) + 'px'; body.style.justifySelf = 'end';
  };
  fit(); document.fonts.ready.then(fit);
  let rt; new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(fit, 80); }).observe(root.querySelector('.abt-in'));
  if (reduce) return;
  const DIM = '#3a3f4a';
  const mm = gsap.matchMedia();
  const lit = (words, dim = DIM) => { /* warna akhir diambil dari CSS, jadi level tiap kata (abu / putih) tetap diatur di stylesheet */
    const to = words.map((w) => getComputedStyle(w).color);
    gsap.fromTo(words, { color: dim }, { color: (i) => to[i], ease: 'none', stagger: 0.12, duration: 0.3,
      scrollTrigger: { trigger: '.abt-in', start: 'top 80%', end: 'bottom 52%', scrub: 0.6 } });
  };
  mm.add('(min-width:768px)', () => { lit([...root.querySelectorAll('.abt-h .cw, .abt-p .cw')]); });
  mm.add('(max-width:767px)', () => { lit([...root.querySelectorAll('.abt-p .cw')], '#7b8190'); }); /* mobile: headline identitas statis (selalu terbaca), hanya paragraf yang menyala; awal redup dinaikkan agar kontras cukup */
})();
drag($('.tal'));
const tal = $('.tal'), tbar = $('.tprog i');
const tprog = () => { /* lebar bar = porsi yang terlihat, posisinya mengikuti scroll */
  const sw = tal.scrollWidth, cw = tal.clientWidth, w = Math.min(100, (cw / sw) * 100), r = tal.scrollLeft / Math.max(1, sw - cw);
  tbar.style.width = w + '%'; tbar.style.marginLeft = r * (100 - w) + '%';
};
tal.addEventListener('scroll', tprog, { passive: true }); addEventListener('resize', tprog); tprog();

/* SoundCloud / Press Kit tanpa link (href="#"): tombol tetap tampil aktif, klik tidak melakukan apa-apa */
document.querySelectorAll('.tsc, .tpk-btn, .soc a[href="#"], a[data-presskit][href="#"]').forEach((a) => {
  if (a.getAttribute('href') !== '#') return; /* link belum ada: tombol tetap tampil aktif, tapi klik tidak melakukan apa-apa */
  a.removeAttribute('target'); a.setAttribute('aria-label', a.getAttribute('aria-label').replace(/ \(opens.*\)/, ''));
  a.addEventListener('click', (e) => e.preventDefault());
});
/* popup "Coming soon": tombol Press kit yang ditandai data-soon (belum ada link) membuka popup; tutup lewat tombol Close, klik area blur, atau Esc */
{
  const pop = $('#soon'), pt = $('#soonT'), pp = $('#soonP'), px = pop.querySelector('.soon-x');
  let from = null;
  const setSoon = (on, who) => {
    if (on) { pt.textContent = 'Coming soon'; pp.textContent = (who ? who + '\u2019s press kit' : 'The press kit') + ' is on its way. Stay tuned.'; }
    pop.classList.toggle('on', on); pop.inert = !on; pop.setAttribute('aria-hidden', !on);
    if (lenis && !open) on ? lenis.stop() : lenis.start();
    if (on) { from = document.activeElement; px.focus({ preventScroll: true }); } else if (from) { from.focus({ preventScroll: true }); from = null; }
  };
  document.querySelectorAll('[data-soon]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); setSoon(true, a.dataset.soon); }));
  px.addEventListener('click', () => setSoon(false));
  pop.addEventListener('click', (e) => { if (e.target === pop) setSoon(false); });
  addEventListener('keydown', (e) => { if (pop.classList.contains('on')) { if (e.key === 'Escape') { e.stopPropagation(); setSoon(false); } else if (e.key === 'Tab') { e.preventDefault(); px.focus(); } } }, true);
}
/* video loop: AUTOPLAY (muted + loop), jeda hanya saat di luar layar (hemat baterai). Kalau browser menahan autoplay (mis. Low Power Mode iOS), dicoba lagi pada sentuhan pertama */
{
  const tv = $('.tloop');
  if (tv) {
    tv.muted = true; tv.defaultMuted = true; tv.setAttribute('muted', ''); tv.setAttribute('playsinline', ''); /* Safari: harus muted agar boleh autoplay */
    let vis = false;
    const sync = () => { vis ? tv.play().catch(() => {}) : tv.pause(); };
    new IntersectionObserver(([e]) => { vis = e.isIntersecting; sync(); }, { threshold: 0.15 }).observe(tv);
    ['loadeddata', 'canplay'].forEach((ev) => tv.addEventListener(ev, sync));
    document.addEventListener('visibilitychange', sync);
    addEventListener('pointerdown', sync, { once: true, passive: true });
  }
}

/* ===== LATEST VIDEOS: klik thumbnail = putar di tempat (youtube-nocookie); kalau iframe diblokir, buka YouTube di tab baru ===== */
document.querySelectorAll('.vid').forEach((a) => a.addEventListener('click', (e) => {
  if (location.protocol === 'file:') return; /* dibuka dari file lokal: YouTube menolak embed tanpa referrer (error 153), jadi biarkan link membuka YouTube di tab baru */
  e.preventDefault();
  document.querySelectorAll('.vthumb iframe').forEach((x) => { x.parentElement.classList.remove('on'); x.remove(); }); /* satu video aktif sekaligus */
  const t = a.querySelector('.vthumb'), f = document.createElement('iframe');
  f.src = `https://www.youtube-nocookie.com/embed/${a.dataset.id}?autoplay=1&rel=0&playsinline=1`;
  f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'; f.referrerPolicy = 'strict-origin-when-cross-origin'; f.allowFullscreen = true; f.title = a.getAttribute('aria-label');
  f.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0;z-index:3';
  t.append(f); t.classList.add('on');
}));
document.addEventListener('securitypolicyviolation', (e) => {
  const f = /frame|child/.test(e.violatedDirective) && document.querySelector('.vthumb iframe');
  if (f) { const id = f.closest('.vid').dataset.id; f.parentElement.classList.remove('on'); f.remove(); window.open('https://youtu.be/' + id, '_blank', 'noopener'); }
});

/* ===== ABOUT count-up, status event, form booking, tombol Book mobile, kursor ===== */
const stm = $('#statement');
if (stm && !reduce) { /* kata-kata redup lalu menyala satu per satu mengikuti scroll */
  const ws = stm.querySelectorAll('.w'); gsap.set(ws, { opacity: 0.16 });
  gsap.to(ws, { opacity: 1, ease: 'none', stagger: 0.12, duration: 0.3, scrollTrigger: { trigger: stm, start: 'top 82%', end: 'bottom 48%', scrub: 0.6 } });
}
document.querySelectorAll('[data-count]').forEach((el) => {
  const n = +el.dataset.count, s = el.dataset.suffix || '', o = { v: 0 };
  if (reduce) return;
  el.textContent = '0' + s;
  ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: () => gsap.to(o, { v: n, duration: 1.6, ease: 'power3.out', onUpdate: () => (el.textContent = Math.round(o.v) + s) }) });
});

const WA = '6281932440500'; /* isi nomor WhatsApp format 628xxxxxxxxxx; kosong = tombol Book us membuka email */
const bk = $('#bookbtn');
if (WA && bk) { bk.href = `https://wa.me/${WA}?text=${encodeURIComponent("Hi Collecteak, I'd like to book you.")}`; bk.target = '_blank'; bk.rel = 'noopener noreferrer'; }

/* mobile: tombol Contact di navbar muncul setelah hero, hilang saat sudah sampai form booking */
ScrollTrigger.create({ start: () => innerHeight * 0.8, endTrigger: '#book', end: 'top 85%', invalidateOnRefresh: true, toggleClass: { targets: nav, className: 'ct' } });
document.fonts.ready.then(() => ScrollTrigger.refresh());

if (matchMedia('(hover:hover) and (pointer:fine)').matches && !reduce) {
  const cur = $('.cur'), lab = cur.firstElementChild;
  const cx = gsap.quickTo(cur, 'x', { duration: 0.2, ease: 'power3' }), cy = gsap.quickTo(cur, 'y', { duration: 0.2, ease: 'power3' });
  addEventListener('pointermove', (e) => {
    cur.classList.add('on'); cx(e.clientX); cy(e.clientY);
    const t = e.target.closest && e.target.closest('[data-cur]');
    cur.classList.toggle('big', !!t); if (t) lab.textContent = t.dataset.cur;
  }, { passive: true });
  document.addEventListener('mouseleave', () => cur.classList.remove('on'));
}

/* talent: di layar sentuh, kartu yang berada di tengah carousel jadi aktif (warna, nama di tengah, kartu naik, pil IG + ikon SoundCloud + Press Kit muncul). Tap kartu = aktifkan manual */
if (matchMedia('(hover:none)').matches) {
  const tws = [...document.querySelectorAll('.tw:not(.tw-cta)')];
  const tio = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle('on', e.isIntersecting)), { root: $('.tal'), rootMargin: '0px -36% 0px -36%' });
  tws.forEach((w) => tio.observe(w));
  tws.forEach((w) => w.addEventListener('click', (e) => { if (e.target.closest('a')) return; const was = w.classList.contains('tap'); tws.forEach((x) => x.classList.remove('tap')); if (!was) w.classList.add('tap'); }));
}

/* Wordmark footer: partikel melayang, membentuk COLLECTEAK, bertahan, pecah, loop (10 detik). */
(() => {
  const root = document.querySelector('.giant');
  if (!root || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const gt = root.querySelector('.gt'), cv = root.querySelector('.gc');
  let PAD = 220; const CYCLE = 8, ss = (a, b, x) => { x = Math.min(Math.max((x - a) / (b - a), 0), 1); return x * x * (3 - 2 * x); };
  let visible = false, started = false, onVis = null;

  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting; onVis && onVis();
    if (visible && !started) {
      started = true;
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/three@0.149.0/build/three.min.js';
      s.onload = init;
      document.head.appendChild(s);
    }
  }, { rootMargin: '400px' }).observe(root);

  const VS = `
    attribute vec3 aT; attribute vec4 aR;
    uniform float uT, uPR, uH, uSolid; uniform vec2 uM, uS;
    varying float vA;
    float eo(float x){ return x >= 1. ? 1. : 1. - pow(2., -10. * x); }
    void main(){
      float w = 6.2831853 / 8.;
      vec2 cloud = position.xy + vec2(sin(uT*w*2. + aR.y*6.28), cos(uT*w*3. + aR.z*6.28)) * 26.;
      float k = clamp((uT - 2. - aR.x*.6) / 1.2, 0., 1.);
      float d = clamp((uT - 6.4 - (1.-aR.x)*.25) / 1.4, 0., 1.);
      float ek = eo(k), ed = eo(d);
      vec2 p = mix(mix(cloud, aT.xy, ek), cloud, ed);
      p += (aR.zw - .5) * 2. * 160. * sin(3.14159 * d);
      vec2 dv = p - uM;
      p += normalize(dv + .0001) * (1. - smoothstep(0., 120., length(dv))) * 36. * ek * (1. - ed) * (1. - uSolid);
      vA = mix(.3, 1., ek * (1. - ed)) * smoothstep(uH, uH - 160., p.y) * (1. - uSolid);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 0., 1.);
      gl_PointSize = 2.4 * uPR;
    }`;
  const FS = `
    varying float vA;
    void main(){
      float d = length(gl_PointCoord - .5); if (d > .5) discard;
      gl_FragColor = vec4(1., 1., 1., vA * smoothstep(.5, .25, d));
    }`;

  async function init() {
    try {
      await Promise.all([document.fonts.load('400 100px "Plus Jakarta Sans", system-ui, sans-serif'), document.fonts.load('italic 800 100px "Plus Jakarta Sans", system-ui, sans-serif')]);
    } catch (e) {}
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: false, premultipliedAlpha: true, preserveDrawingBuffer: false, powerPreference: 'low-power' }); renderer.setClearColor(0x000000, 0); } catch (e) { return; }
    const scene = new THREE.Scene(), u = {
      uT: { value: 0 }, uSolid: { value: 0 }, uPR: { value: 1 }, uH: { value: 1 }, uM: { value: new THREE.Vector2(-9999, -9999) }, uS: { value: new THREE.Vector2(1, 1) },
    };
    let points = null, cam = null, lost = false;

    function sample(w, h, N) {
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const x = c.getContext('2d', { willReadFrequently: true });
      const rr = root.getBoundingClientRect(), fs = parseFloat(getComputedStyle(gt).fontSize);
      const rg = document.createRange(); rg.selectNodeContents(gt.firstChild);
      const a = rg.getBoundingClientRect(), b = gt.querySelector('b').getBoundingClientRect();
      const base = gt.querySelector('.bl').getBoundingClientRect().bottom - rr.top;
      x.fillStyle = '#fff'; x.textBaseline = 'alphabetic';
      const LS = -0.03 * fs, hasLS = 'letterSpacing' in x;
      if (hasLS) x.letterSpacing = LS + 'px';
      const put = (t, px) => { if (hasLS) return x.fillText(t, px, base); for (const ch of t) { x.fillText(ch, px, base); px += x.measureText(ch).width + LS; } }; /* Safari: tanpa canvas letterSpacing */
      x.font = `400 ${fs}px "Plus Jakarta Sans", system-ui, sans-serif`; put('COLLEC', a.left - rr.left);
      x.font = `italic 800 ${fs}px "Plus Jakarta Sans", system-ui, sans-serif`; put('TEAK', b.left - rr.left);
      const d = x.getImageData(0, 0, w, h).data, pts = [];
      for (let j = 0; j < h; j += 2) for (let i = 0; i < w; i += 2) if (d[(j * w + i) * 4 + 3] > 128) pts.push(i, j);
      const n = pts.length / 2, out = [];
      for (let i = 0; i < N; i++) { const k = (Math.random() * n | 0) * 2; out.push(pts[k] + Math.random() * 2, pts[k + 1] + Math.random() * 2); }
      return out;
    }

    function build() {
      if (window.fitGiant) fitGiant();
      PAD = innerWidth < 768 ? 130 : 220;
      const w = Math.round(root.clientWidth), h = Math.round(root.clientHeight);
      if (!w || !h) return;
      const pr = Math.min(devicePixelRatio || 1, innerWidth < 768 ? 1.5 : 2);
      renderer.setPixelRatio(pr); renderer.setSize(w, h + PAD, false);
      u.uPR.value = pr; u.uH.value = h + PAD; u.uS.value.set(w, h);
      cam = new THREE.OrthographicCamera(0, w, h + PAD, 0, -1, 1);
      const N = innerWidth < 768 ? 6000 : 14000, pts = sample(w, h, N);
      const pos = new Float32Array(N * 3), tg = new Float32Array(N * 3), rn = new Float32Array(N * 4);
      for (let i = 0; i < N; i++) {
        pos[i * 3] = Math.random() * w; pos[i * 3 + 1] = Math.random() * (h + PAD);
        tg[i * 3] = pts[i * 2]; tg[i * 3 + 1] = h - pts[i * 2 + 1];
        rn.set([pts[i * 2] / w, Math.random(), Math.random(), Math.random()], i * 4);
      }
      if (points) { points.geometry.dispose(); points.material.dispose(); scene.remove(points); }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      g.setAttribute('aT', new THREE.BufferAttribute(tg, 3));
      g.setAttribute('aR', new THREE.BufferAttribute(rn, 4));
      points = new THREE.Points(g, new THREE.ShaderMaterial({ uniforms: u, vertexShader: VS, fragmentShader: FS, transparent: true, depthTest: false }));
      points.frustumCulled = false; scene.add(points);
    }
    build();

    /* GPU/OS bisa membuang konteks WebGL (memori penuh, tab lama di background): tanpa handler, canvas jadi kotak gelap */
    cv.addEventListener('webglcontextlost', (e) => { e.preventDefault(); lost = true; cv.style.visibility = 'hidden'; gt.style.opacity = 1; }, false);
    cv.addEventListener('webglcontextrestored', () => { lost = false; renderer.setClearColor(0x000000, 0); build(); cv.style.visibility = ''; render(); }, false);

    let rz, lw = innerWidth; addEventListener('resize', () => { if (innerWidth === lw && innerWidth < 1280) return; lw = innerWidth; clearTimeout(rz); rz = setTimeout(build, 250); });
    addEventListener('mousemove', (e) => {
      const r = root.getBoundingClientRect();
      u.uM.value.set(e.clientX - r.left, r.height - (e.clientY - r.top));
    }, { passive: true });

    /* mulai di fase hold (4,5 s) supaya teks solid yang sudah tampil tidak melompat */
    const t0 = performance.now() - 5400;
    let ticking = false;
    const render = () => {
      if (document.hidden || !points || lost || !cam) return;
      const t = ((performance.now() - t0) / 1000) % CYCLE;
      u.uT.value = t;
      /* menyatu: partikel -> teks solid putih polos (tanpa glitch, kilau, atau noise) */
      /* partikel sudah ~97% mendarat di t=2,6-3,2 s: teks solid fade-in di jendela itu, partikel ikut hilang (tanpa titik tersisa) */
      const solid = ss(3.1, 3.8, t) * (1 - ss(6.4, 6.7, t));
      gt.style.opacity = solid;
      u.uSolid.value = solid;
      renderer.render(scene, cam);
    };
    /* loop hanya berjalan saat footer terlihat (sebelumnya rAF jalan terus walau di luar layar) */
    onVis = () => { if (visible && !ticking) { render(); gsap.ticker.add(render); ticking = true; } else if (!visible && ticking) { gsap.ticker.remove(render); ticking = false; if (!lost) renderer.clear(); } };
    document.addEventListener('visibilitychange', () => { if (!document.hidden && visible && !lost) render(); });
    onVis();
  }
})();


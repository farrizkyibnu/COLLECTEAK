/* ===== Shared state ===== */
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
let lenis = null; /* set once Lenis is created (see smooth scroll below) */

/* ===== Boot safety nets ===== */
/* Never leave the intro covering the page if the main script did not start it. */
setTimeout(() => {
  const intro = document.getElementById('intro');
  if (intro && !window.__introRan) intro.style.display = 'none';
}, 6000);

/* If GSAP or ScrollTrigger failed to load (offline, blocked), show the page as is instead of a black screen. */
addEventListener('load', () => {
  if (window.gsap && window.ScrollTrigger) return;
  document.documentElement.classList.remove('js');
  const intro = document.getElementById('intro');
  if (intro) intro.style.display = 'none';
});

/* ===== Film grain textures ===== */
/* Built once on a small canvas (cheaper than a full-screen SVG filter on iOS), exposed as CSS variables.
   Runs when the browser is idle so it never competes with first paint. */
function makeGrain(size, cssVar, shade, alpha) {
  try {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d'), img = ctx.createImageData(size, size), d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      d[i] = d[i + 1] = d[i + 2] = shade;
      d[i + 3] = alpha();
    }
    ctx.putImageData(img, 0, 0);
    document.documentElement.style.setProperty(cssVar, `url(${c.toDataURL()})`);
  } catch{/* ignore */}
}
(window.requestIdleCallback || ((f) => setTimeout(f, 1)))(() => {
  makeGrain(128, '--grain', 255, () => Math.random() * 140);
  /* Softer grey grain for the grey bands: bell-shaped alpha (mean of three random values). */
  makeGrain(256, '--grain-d', 120, () => ((Math.random() + Math.random() + Math.random()) / 3) * 150);
}, { timeout: 800 });

/* ===== Pause CSS animations while off-screen ===== */
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle('off', !e.isIntersecting)), { rootMargin: '80px' });
  document.querySelectorAll('.run-band').forEach((el) => io.observe(el));
}

/* ===== FAB ===== */
/* FAB: appears after scrolling about half a screen, hidden while the booking section or footer is visible */
(function(){var f=document.querySelector('.fab');if(!f)return;var t=[].slice.call(document.querySelectorAll('#book,footer')),hid=false;
function u(){f.classList.toggle('show',scrollY>innerHeight*.5&&!hid)}
var io=new IntersectionObserver(function(es){es.forEach(function(e){e.target._v=e.isIntersecting});hid=t.some(function(x){return x._v});u()},{threshold:.1});t.forEach(function(x){io.observe(x)});
u();
/* Ring text: spins faster with scroll speed, then eases back to normal */
var rg=f.querySelector('.fab-ring'),ly=scrollY,lt=performance.now(),rate=1,raf=0;
var sa=null;function spin(){if(sa)return sa;sa=(rg.getAnimations&&rg.getAnimations().filter(function(x){return x.animationName==='fabSpin'})[0])||null;return sa}
function tick(){var a=spin();rate+=(1-rate)*.05;if(rate<1.03)rate=1;if(a)a.playbackRate=rate;raf=rate>1?requestAnimationFrame(tick):0}
var pend=false;
addEventListener('scroll',function(){if(pend)return;pend=true;requestAnimationFrame(function(){pend=false;u();var y=scrollY,n=performance.now(),v=Math.abs(y-ly)/Math.max(1,n-lt);ly=y;lt=n;
  var tg=1+Math.min(v*4,9);if(tg>rate)rate+=(tg-rate)*.4;var a=spin();if(a)a.playbackRate=rate;if(!raf)raf=requestAnimationFrame(tick)})},{passive:true});
})();
/* After a "View more" list opens, its toggle is pushed down the page. Scroll just enough to keep the toggle in view,
   but never so far that the first new item leaves the screen. Does nothing if the toggle is already visible. */
function keepToggleInView(btn, first) {
  const vh = innerHeight;
  let dy = btn.getBoundingClientRect().bottom - (vh - 28);
  if (first) dy = Math.min(dy, first.getBoundingClientRect().top - vh * 0.2);
  if (dy <= 4) return;
  const y = scrollY + dy;
  if (lenis) lenis.scrollTo(y, { duration: reduce ? 0 : 0.7, immediate: reduce, easing: (t) => 1 - Math.pow(1 - t, 3) });
  else scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
}
/* ===== Venues toggle ===== */
/* Venues: View more / View less. Mobile shows 6 tiles first (.m tiles hidden), the rest (.x) stay hidden at every size.
   The wall height is clipped, tiles only fade (no translate, so grid lines do not shimmer), and scroll position is kept when collapsing. */
(function(){var w=document.getElementById('wall'),b=document.querySelector('.vm-btn[aria-controls="wall"]');if(!w||!b)return;
var busy=false,g=window.gsap;
function state(o){b.setAttribute('aria-expanded',o);b.setAttribute('aria-label',o?'View fewer venues':'View more venues')}
function setY(y){if(lenis)lenis.scrollTo(y,{immediate:true,force:true});else scrollTo(0,y)}
function H(){return w.getBoundingClientRect().height}
function refresh(){if(window.ScrollTrigger)ScrollTrigger.refresh()}
function clr(a){a.forEach(function(e){e.style.opacity='';e.style.visibility=''})}
function open(){
  busy=true;state(true);
  var hid=[].slice.call(w.querySelectorAll('.lg')).filter(function(e){return getComputedStyle(e).display==='none'});
  w.classList.add('open');
  var fresh=hid.filter(function(e){return getComputedStyle(e).display!=='none'});
  w.style.height='';keepToggleInView(b,fresh[0]);
  /* Lightweight: height is not animated (no per-frame layout). New tiles only fade and rise slightly (opacity and transform only). */
  if(reduce||!g){clr(fresh);refresh();busy=false;return}
  g.fromTo(fresh,{autoAlpha:0,y:14},{autoAlpha:1,y:0,duration:.4,stagger:{amount:.16},ease:'power2.out',clearProps:'opacity,visibility,transform',onComplete:function(){refresh();busy=false}});
}
function close(){
  busy=true;state(false);
  var mob=matchMedia('(max-width:767px)').matches;
  var tiles=[].slice.call(w.querySelectorAll(mob?'.lg.x,.lg.m':'.lg.x'));
  function collapse(){
    /* Keep the toggle at the same screen position: correct the scroll once instead of every frame. */
    var h0=H(),y0=scrollY;w.classList.remove('open');clr(tiles);w.style.height='';
    var h1=H();setY(y0-(h0-h1));
    refresh();busy=false;
  }
  if(reduce||!g)collapse();
  else g.to(tiles.slice().reverse(),{autoAlpha:0,duration:.14,stagger:{amount:.06},ease:'power1.in',onComplete:collapse});
}
b.addEventListener('click',function(){if(busy)return;b.getAttribute('aria-expanded')==='true'?close():open();setTimeout(function(){busy=false},1500)}); /* the timeout is a safety net: never leave the toggle locked */
})();
/* ===== Listen: multi-track player. SoundCloud Widget API (hidden iframes), waveform seek ===== */
(function(){
  var root=document.getElementById('kl'); if(!root) return;
  var rows=[].slice.call(root.querySelectorAll('.kl-row')), n=rows.length;
  var $=function(i){return document.getElementById(i)};
  var elCover=$('klCover'),elTitle=$('klTitle'),elNow=$('klNow'),
      elCur=$('klCur'),elDur=$('klDur'),elWf=$('klWf'),cv=$('klCv'),tip=$('klTip'),
      elBox=$('klWfw'),elSt=$('klSt');
  var COVER0=elCover.getAttribute('src');
  var FLAGS='&hide_related=true&show_comments=false&show_reposts=false&show_teaser=false&visual=false';

  var idx=0,W=[],durs=[],apiP=null,opt=null,optT=0;
  var playing=false,hasPlayed=false,dur=0,lastPos=0,lastTs=0,lastSec=-1,lastDraw=0;
  var growRaf=0,born=0,drag=false,dragRatio=0,hoverRatio=null,vis=false,raf=0;
  var spin=null,more=$('klMore'),isOpen=false,busy=false,xs=[].slice.call(root.querySelectorAll('.kl-list li.x'));
  var wf=[],counts=rows.map(function(r){return parseInt(r.dataset.plays,10)||0});

  function now(){return (window.performance&&performance.now)?performance.now():Date.now()}
  function fmt(ms){if(!isFinite(ms)||ms<0)ms=0;var s=Math.floor(ms/1000);return Math.floor(s/60)+':'+('0'+(s%60)).slice(-2)}
  function slug(u){return u.replace(/[?#].*$/,'').split('/').pop()}
  /* Title: all Plus Jakarta Sans, with the DJ name (the "(NAME Edit)" part) in bold. */
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
  /* Optimistic UI: the interface reacts on tap (opt = true or false) without waiting for the SoundCloud iframe.
     The real PLAY or PAUSE event then takes over. With no confirmation after 4 seconds it falls back to the real state. */
  function isOn(){return opt!==null?opt:playing}
  function setOpt(v){opt=v;clearTimeout(optT);if(v!==null)optT=setTimeout(function(){var was=opt;opt=null;ui();if(was===true&&!playing)status('Tap again to play')},4000)}
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
    if(!drag&&now()-lastDraw>100){lastDraw=now();draw()} /* progress moves slowly: ~10 redraws per second is plenty */
    raf=requestAnimationFrame(tick);
  }
  function kick(){if(!raf&&playing&&vis)raf=requestAnimationFrame(tick)}

  /* Vinyl disc: spins at 33 1/3 RPM with inertia (GSAP timeScale), CSS animation as a fallback. */
  (function(){
    var d=root.querySelector('.kl-disc');
    if(window.gsap&&d&&!reduce){spin=gsap.to(d,{rotation:360,duration:1.8,ease:'none',repeat:-1}).timeScale(0);root.classList.add('gs')}
  })();

  /* View more / View less: the top 3 tracks show, the rest open with the button. */
  function setY(y){if(lenis)lenis.scrollTo(y,{immediate:true,force:true});else scrollTo(0,y)}
  function refresh(){if(window.ScrollTrigger)ScrollTrigger.refresh()}
  function clr(){xs.forEach(function(e){e.style.opacity='';e.style.visibility='';e.style.transform=''})}
  function setOpen(o){
    if(o===isOpen||busy)return;
    busy=true;isOpen=o;
    more.setAttribute('aria-expanded',o?'true':'false');
    more.setAttribute('aria-label',o?'View fewer tracks':'View more tracks');
    var g=window.gsap;
    if(o){
      root.classList.add('open');keepToggleInView(more,xs[0]);
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
    rows.forEach(function(r,i){r.dataset.cur=(i===idx&&isOn())?'Pause':'Play'});
  }
  function ui(){
    var on=isOn();
    root.classList.toggle('is-playing',on);
    elNow.textContent=on?'Now playing':(hasPlayed?'Paused':'');
    if(spin&&window.gsap)gsap.to(spin,{timeScale:on?1:0,duration:on?1.2:2,ease:on?'power2.in':'power2.out',overwrite:true});
    labels();if(on)draw();
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
  /* One iframe per track: a ready track can play or pause instantly on tap (no refetch), and play() runs synchronously
     inside the click handler, which passes mobile autoplay rules more often. The top 3 are preloaded, the rest are created
     on hover, touch or selection. */
  function cw(){var s=W[idx];return s&&s.ready?s.w:null}
  function fetchMeta(i){
    var s=W[i];if(!s||!s.ready)return;
    s.w.getCurrentSound(function(m){
      if(!m)return;
      if(m.permalink_url&&m.permalink_url.indexOf(slug(rows[i].dataset.url))===-1)return;
      durs[i]=m.duration||durs[i]||0;
      if(typeof m.playback_count==='number'){counts[i]=m.playback_count;renderCount(i)}
      if(m.title){var t=rows[i].querySelector('.kl-t');if(t)t.textContent=m.title}
      loadWaveform(i,m.waveform_url);
      if(i!==idx)return;
      if(m.title)setTitle(m.title);
      dur=durs[i];elDur.textContent=fmt(dur);draw();
      if('mediaSession' in navigator&&window.MediaMetadata)
        navigator.mediaSession.metadata=new MediaMetadata({title:elTitle.textContent,artist:rows[idx].dataset.by,album:'Kolektikan Vol. 1',artwork:[{src:COVER0,sizes:'500x500'}]});
    });
  }
  function bindEvents(w,i){
    var E=SC.Widget.Events;
    w.bind(E.PLAY,function(){
      if(i!==idx){try{w.pause()}catch{/* ignore */}return}
      setOpt(null);var was=playing;playing=true;hasPlayed=true;lastTs=now();ui();if(!was)startGrow();status('');kick();
    });
    w.bind(E.PAUSE,function(){if(i!==idx)return;lastPos=curPos();playing=false;setOpt(null);ui();draw()});
    w.bind(E.FINISH,function(){if(i!==idx)return;lastPos=0;playing=false;setOpt(null);ui();go(idx+1>=n?0:idx+1,idx+1<n)});
    w.bind(E.PLAY_PROGRESS,function(e){
      if(i!==idx)return;
      if(!dur&&e.relativePosition>0){dur=e.currentPosition/e.relativePosition;elDur.textContent=fmt(dur)}
      lastPos=e.currentPosition;lastTs=now();
    });
    if(E.ERROR)w.bind(E.ERROR,function(){if(i!==idx)return;playing=false;setOpt(null);ui();status('This track can\u2019t be played right now.')});
  }
  function makeWidget(i){
    if(W[i])return W[i];
    var s=W[i]={w:null,ready:false,p:null};
    s.p=loadApi().then(function(){
      return new Promise(function(resolve){
        var f=makeFrame(embedSrc(rows[i].dataset.url,false)),w=SC.Widget(f);
        s.w=w;
        w.bind(SC.Widget.Events.READY,function(){
          if(s.ready)return;
          s.ready=true;bindEvents(w,i);resolve(w);fetchMeta(i);
        });
      });
    }).catch(function(){W[i]=null;throw 0});
    s.p.catch(function(){});
    return s;
  }
  function preload(){
    var seq=Promise.resolve();
    for(var k=1;k<Math.min(3,n);k++)(function(i){
      seq=seq.then(function(){return (W[i]||makeWidget(i)).p}).then(function(){return new Promise(function(r){setTimeout(r,500)})}).catch(function(){});
    })(k);
    return seq;
  }
  function go(i,auto){
    var prev=idx;idx=(i+n)%n;if(idx>=3&&!isOpen)setOpen(true);
    if(prev!==idx){
      var o=W[prev];if(o&&o.ready){try{o.w.pause()}catch{/* ignore */}}
      playing=false;lastPos=0;
    }
    markActive();setMeta(idx);
    if(durs[idx]){dur=durs[idx];elDur.textContent=fmt(dur)}
    var s=W[idx]||makeWidget(idx),at=idx;
    setOpt(auto?true:null);ui();
    if(s.ready){if(auto&&!playing)s.w.play();fetchMeta(idx);return}
    s.p.then(function(w){
      if(idx!==at)return;
      if(auto&&!playing)w.play();
      fetchMeta(at);
    }).catch(function(){if(idx===at){setOpt(null);ui();status('Player failed to load. Check your connection.')}});
  }

  /* Controls */
  rows.forEach(function(r,i){
    r.addEventListener('click',function(){
      var s=W[i];
      if(i===idx&&s&&s.ready){
        if(isOn()){setOpt(false);ui();s.w.pause()}else{setOpt(true);ui();s.w.play()}
        return;
      }
      go(i,true);
    });
    /* Prepare this track's iframe early (mouse hover or touch start) so the next click plays right away. */
    r.addEventListener('pointerdown',function(){if(!W[i])makeWidget(i)},{passive:true});
    r.addEventListener('pointerenter',function(e){if(e.pointerType==='mouse'&&!W[i])makeWidget(i)},{passive:true});
  });
  function commit(r){
    var w=cw();if(!w||!dur)return;
    var ms=Math.max(0,Math.min(.999,r))*dur;
    w.seekTo(ms);lastPos=ms;lastTs=now();lastSec=-1;
    elCur.textContent=fmt(ms);draw();
  }
  function ratioOf(e){var b=elWf.getBoundingClientRect();return Math.min(1,Math.max(0,(e.clientX-b.left)/b.width))}
  function showTip(r){tip.textContent=fmt(r*dur);tip.style.left=(r*100)+'%';tip.classList.add('on')}
  elWf.addEventListener('pointerdown',function(e){
    drag=true;dragRatio=ratioOf(e);
    try{elWf.setPointerCapture(e.pointerId)}catch{/* ignore */}
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
      navigator.mediaSession.setActionHandler('play',function(){var w=cw();if(w)w.play()});
      navigator.mediaSession.setActionHandler('pause',function(){var w=cw();if(w)w.pause()});
      navigator.mediaSession.setActionHandler('previoustrack',function(){go(idx-1,true)});
      navigator.mediaSession.setActionHandler('nexttrack',function(){go(idx+1,true)});
      navigator.mediaSession.setActionHandler('seekto',function(d){if(dur&&d.seekTime!=null)commit(d.seekTime*1000/dur)});
    }catch{/* ignore */}
  }

  /* Init: the player is created when the section nears the viewport (600px) so the first tap plays right away. */
  rows.forEach(function(_,i){renderCount(i)});
  markActive();setMeta(0);ui();
  var started=false;
  function boot(){makeWidget(idx).p.then(function(){fetchMeta(idx);return preload()}).catch(function(){status('Player failed to load. Check your connection.')})}
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(en){
      vis=en[0].isIntersecting;
      if(vis){kick();draw()}
      if(vis&&!started){started=true;boot()}
    },{rootMargin:'600px 0px'}).observe(root);
  }else{vis=true;started=true;boot()}
})();
/* ===== Main (GSAP, Lenis, nav, talent, gallery, booking, cursor) ===== */
const $ = (s) => document.querySelector(s);

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true }); /* The mobile address bar showing or hiding must not trigger a heavy refresh. */

/* Smooth scroll (Lenis) synced with GSAP. */
if (!reduce && window.Lenis) {
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
const EASE_IO = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2); /* easeInOutCubic for anchor jumps */
const scrollToTarget = (id) => (lenis ? lenis.scrollTo(id, { duration: 1.0, easing: EASE_IO }) : $(id).scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }));

/* Sticky navbar: transparent at the top, blurred and slightly darker after scrolling. */
const nav = $('.nav');
/* All scroll state goes through ScrollTrigger (no scroll listener or getBoundingClientRect per frame). */
ScrollTrigger.create({ start: 40, end: 'max', toggleClass: { targets: nav, className: 'sc' } });
ScrollTrigger.create({ start: 60, end: 'max', toggleClass: { targets: document.documentElement, className: 'hs' } });
const hero = $('.hero');
ScrollTrigger.create({ trigger: hero, start: 'top bottom', end: 'bottom top', onToggle: (st) => hero.classList.toggle('off', !st.isActive), onRefresh: (st) => hero.classList.toggle('off', !st.isActive) });

/* Footer wordmark: fits the grid width, C aligned left, the italic K tail is not clipped. */
function fitGiant() {
  const g = $('.giant'), t = g.querySelector('.gt');
  const ctx = document.createElement('canvas').getContext('2d');
  const m = (font, ch) => { ctx.font = font; return ctx.measureText(ch); };
  const c = m('400 100px "Plus Jakarta Sans", system-ui, sans-serif', 'C'), k = m('italic 800 100px "Plus Jakarta Sans", system-ui, sans-serif', 'K');
  const L = -c.actualBoundingBoxLeft / 100;                           /* left ink offset of the C (em) */
  const O = Math.max(0, (k.actualBoundingBoxRight - k.width) / 100);  /* how far the K ink overshoots its box (em) */
  g.style.fontSize = '100px'; t.style.marginLeft = '0'; t.style.paddingRight = '0';
  const A = t.getBoundingClientRect().width / 100;                    /* text width (em) */
  const fs = g.clientWidth / (A + 0.03 + O - L);
  g.style.fontSize = fs + 'px';
  t.style.marginLeft = (-L * fs) + 'px';
  t.style.paddingRight = ((O + 0.03) * fs) + 'px';
}
document.fonts.ready.then(fitGiant);

/* Hero wordmark: revealed once after the intro, then a white shine sweeps across it. No loop.
   Letters rise from below through a mask, skewed then upright. Only transform and opacity are animated
   (compositor friendly, no per-frame blur). */
(() => {
  const wm = $('.wm');
  if (!wm || reduce) return;
  const span = wm.firstElementChild, L = [...wm.querySelectorAll('.wl')];
  L.forEach((l) => (l.dataset.c = l.textContent)); /* text for the glow layer */
  const CLR = 'transform,opacity,visibility,willChange,transformOrigin', MASK = 'inset(-30% -5% 0 -5%)';
  const hide = () => { wm.style.clipPath = MASK; gsap.set(L, { yPercent: 125, skewY: 10 }); };
  const play = (tl) => tl.to(L, { yPercent: 0, skewY: 0, duration: 0.85, ease: 'expo.out', stagger: 0.04, willChange: 'transform' });
  let started = false, F = [], G = [];
  const reveal = () => { wm.style.clipPath = ''; gsap.set(L, { clearProps: CLR }); }; /* transforms are released so the shine can clip the text */
  hide(); /* letters start hidden so they do not flicker while the hero fades in */
  setTimeout(() => { if (!started) { started = true; reveal(); } }, 12000); /* safety net */
  window.__wmIntro = () => {
    if (started) return; started = true;
    if (scrollY > innerHeight * 0.6) return reveal(); /* hero is already off-screen: show immediately */
    const tl = gsap.timeline({ paused: true });
    play(tl);
    tl.add(reveal)
      .add(() => {
        gsap.set(span, { '--sp': '100%' });
        const sr = span.getBoundingClientRect(); /* center of each letter (0 to 1) so the glow follows the shine band */
        F = L.map((l) => { const r = l.getBoundingClientRect(); return (r.left + r.width / 2 - sr.left) / sr.width; }); G = L.map(() => -1);
        span.classList.add('sh');
      })
      .to(span, { '--sp': '0%', duration: 1.3, ease: 'sine.inOut', /* base color stays, only the white band and glow pass over it */
        onUpdate() {
          const c = 2 * this.ratio - 0.5; /* band center across the text width */
          L.forEach((l, i) => {
            const x = 1 - Math.min(Math.abs(c - F[i]) / 0.22, 1), g = Math.round(x * x * (3 - 2 * x) * 100) / 100;
            if (g !== G[i]) { G[i] = g; l.style.setProperty('--g', g); }
          });
        } })
      .add(() => { span.classList.remove('sh'); gsap.set(span, { clearProps: '--sp' }); L.forEach((l) => l.style.removeProperty('--g')); });
    Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 600))]).then(() => tl.play()); /* wait for fonts, 600ms at most, to avoid a layout jump */
  };
})();
let fitT, lastW = innerWidth;
addEventListener('resize', () => {
  if (innerWidth === lastW && innerWidth < 1280) return; /* Phones: the address bar only changes the height, no recalculation needed. */
  lastW = innerWidth; clearTimeout(fitT); fitT = setTimeout(fitGiant, 120);
});

/* Mobile menu: open and close with one reversible timeline. */
const btn = $('.pill-menu'), menu = $('#menu'), label = btn.querySelector('span');
const iconGrid = btn.querySelector('svg').outerHTML;
const iconX = '<svg width="10" height="10" viewBox="0 0 10 10" stroke="currentColor" stroke-width="1.4"><path d="M1 1l8 8M9 1l-8 8"/></svg>';
const D = reduce ? 0 : 1;
const tl = gsap.timeline({ paused: true, onReverseComplete: () => gsap.set(menu, { visibility: 'hidden' }) })
  .set(menu, { visibility: 'visible' }, 0)
  .fromTo(menu, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.3 * D, ease: 'power4.inOut' }, 0)
  .from('.menu-links .l', { y: 24, autoAlpha: 0, duration: 0.35 * D, stagger: 0.025 * D, ease: 'power4.out' }, 0.08 * D)
  .from('.menu-soc a', { autoAlpha: 0, y: 12, duration: 0.22 * D, stagger: 0.02 * D, ease: 'power3.out' }, 0.22 * D);
let menuOpen = false;
const isDesk = () => matchMedia('(min-width:1200px)').matches;
const side = $('.side');
let mode = false; /* true = side menu (desktop), false = panel (mobile and tablet) */
function setMenu(state) {
  if (state) mode = isDesk();
  menuOpen = state;
  btn.setAttribute('aria-expanded', menuOpen);
  btn.querySelector('svg').outerHTML = menuOpen ? iconX : iconGrid;
  label.textContent = menuOpen ? 'Close' : 'Menu';
  nav.classList.toggle('open', menuOpen);
  if (mode) {
    side.inert = !menuOpen;
    gsap.to('.side a', { autoAlpha: menuOpen ? 1 : 0, x: menuOpen ? 0 : 14, duration: reduce ? 0 : 0.2, stagger: menuOpen ? 0.025 : 0.012, delay: 0, ease: 'power3.out', overwrite: true });
  } else {
    menuOpen ? tl.timeScale(1).play() : tl.timeScale(2.2).reverse(); /* closing is faster than opening */
    menu.inert = !menuOpen;
    if (lenis) menuOpen ? lenis.stop() : lenis.start();
  }
}
{ const mq = matchMedia('(min-width:1200px)'), f = () => menuOpen && setMenu(false); mq.addEventListener ? mq.addEventListener('change', f) : mq.addListener(f); }
btn.addEventListener('click', () => setMenu(!menuOpen));
addEventListener('keydown', (e) => e.key === 'Escape' && menuOpen && setMenu(false));

/* Anchors: on desktop the side menu stays open (close with the Close button or Esc); on mobile and tablet the panel closes first, then the page scrolls smoothly. */
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a || a.getAttribute('href') === '#') return;
  e.preventDefault();
  const go = () => scrollToTarget(a.getAttribute('href'));
  if (menuOpen && !mode) { setMenu(false); setTimeout(go, 300); } else go();
});

/* Smart navbar: hides while scrolling down to give reading room, returns on scroll up, keyboard focus, open menu, or near the top. */
if (!reduce) {
  /* Hide and show through a class (CSS transition on the compositor, not a per-frame JS tween) with motion thresholds:
     hides after 24px down, shows after 12px up, so it does not flicker with momentum or rubber-band scrolling on phones. */
  let hid = false, lastY = scrollY, acc = 0;
  const setHide = (h) => { if (h !== hid) { hid = h; nav.classList.toggle('nh', h); } };
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (st) => {
    const y = st.scroll(), dy = y - lastY; lastY = y;
    if (menuOpen || y < 500) { acc = 0; setHide(false); return; }
    if (!dy) return;
    acc = (dy > 0) === (acc > 0) ? acc + dy : dy;
    if (acc > 24) setHide(true); else if (acc < -12) setHide(false);
  } });
  nav.addEventListener('focusin', () => setHide(false));
}

/* ===== Intro and scroll animations ===== */
if (!reduce) {
  /* Initial scroll-animation state, then release the anti-flash class (same task, no paint in between). */
  gsap.set('.rv', { autoAlpha: 0, y: 36 }); gsap.set('.stg', { autoAlpha: 0, y: 48 });
  document.documentElement.classList.remove('js');
  /* Hero intro: plays after the opening finishes. */
  const heroTl = gsap.timeline({ paused: true })
    .from('.hero-bg', { scale: 1.15, duration: 1.2, ease: 'power3.out' }, 0)
    .call(() => window.__wmIntro && window.__wmIntro(), null, 0.05) /* the wordmark starts at once, without waiting for the other hero animations */
    .from('.nav, .hero-cta', { autoAlpha: 0, y: 24, duration: 0.8, stagger: 0.1, ease: 'power3.out' }, 0.1)
    .fromTo('.hero .scue', { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', clearProps: 'opacity,visibility,transform' }, 0.4); /* explicit fromTo so it does not clash with the element's CSS transition */

  /* ===== OPENING: strobe slam ===== */
  /* Play the intro once per session. Add ?intro to the URL to force it. */
  const intro = $('#intro');
  let seen = false;
  try { seen = sessionStorage.getItem('ctk-intro') && !/[?&]intro/.test(location.search); } catch{/* ignore */}
  if (seen || reduce) { intro.remove(); heroTl.play(); }
  else {
    window.__introRan = true;
    try { sessionStorage.setItem('ctk-intro', '1'); } catch{/* ignore */}
    const word = $('.iw'), box = $('.ibox'), flash = $('.iflash'), cnt = $('.ic');
    word.innerHTML = [...'COLLECTEAK'].map((c, i) => `<span class="il${i > 5 ? ' b' : ''}">${c}</span>`).join('');
    const L = [...word.children];
    document.documentElement.style.overflow = 'hidden'; lenis && lenis.stop();
    const tl = gsap.timeline({ paused: true, onComplete: () => { intro.remove(); document.documentElement.style.overflow = ''; lenis && lenis.start(); } });
    const hit = (t) => tl.set(flash, { opacity: 1 }, t).set(flash, { opacity: 0 }, t + 0.05); /* 3-frame white flash, letters inverted */

    L.forEach((l, i) => { /* each letter slams the screen: big scale, red offset, screen shake */
      const t = 0.2 + i * 0.07;
      tl.set(l, { opacity: 1 }, t)
        .fromTo(l, { scale: 1.6, filter: 'drop-shadow(12px 0 0 #ff2a1a)' }, { scale: 1, filter: 'drop-shadow(0px 0 0 #ff2a1a)', duration: 0.28, ease: 'expo.out', immediateRender: false }, t)
        .fromTo(box, { x: gsap.utils.random(-16, 16), y: gsap.utils.random(-10, 10) }, { x: 0, y: 0, duration: 0.18, ease: 'power3.out', immediateRender: false }, t)
        .call(() => (cnt.textContent = String(Math.round(((i + 1) / L.length) * 100)).padStart(3, '0')), null, t);
      if (i % 2) hit(t);
    });

    const F = 0.2 + L.length * 0.07 + 0.05; /* final strobe and skewed glitch */
    hit(F); hit(F + 0.1); hit(F + 0.2);
    tl.set(box, { skewX: 16, scale: 1.04 }, F).set(box, { skewX: -10 }, F + 0.1).set(box, { skewX: 0, scale: 1 }, F + 0.2);

    tl.addLabel('exit', F + 0.35) /* exit: text breaks apart, curtains split top and bottom, hero follows */
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
  /* Depth: the wordmark and hero text rise faster than the background photo (yPercent is separate from the entrance animation, which uses y). */
  const HERO_ST = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
  gsap.to('.wm', { yPercent: -16, ease: 'none', force3D: true, scrollTrigger: HERO_ST });
  gsap.to('.hero-cta', { yPercent: -8, ease: 'none', force3D: true, scrollTrigger: HERO_ST });
  gsap.matchMedia().add('(min-width: 768px)', () => { /* Gallery: columns move at different speeds (columns are flattened on phones, so skipped). */
    gsap.utils.toArray('.gal .col').forEach((c, i) => { const v = i % 2 ? 44 : 14; gsap.fromTo(c, { y: v }, { y: -v, ease: 'none', force3D: true, scrollTrigger: { trigger: '.gal', start: 'top bottom', end: 'bottom top', scrub: true } }); });
  });
  const REV = { autoAlpha: 1, y: 0, duration: 1, stagger: 0.08, ease: 'power3.out', overwrite: true, clearProps: 'transform,opacity,visibility' }; /* clearProps releases the GPU layer when done */
  ScrollTrigger.batch('.rv', { start: 'top 90%', end: 'max', once: true, onEnter: (b) => gsap.to(b, REV) });
  ScrollTrigger.batch('.stg', { start: 'top 94%', end: 'max', once: true, onEnter: (b) => gsap.to(b, REV) }); /* cards appear one after another */
}

/* ===== Carousel: mouse drag, snap and marker ===== */
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

drag($('.tal'));
const tal = $('.tal'), tbar = $('.tprog i');
const tprog = () => { /* bar width = visible share, its position follows the scroll */
  const sw = tal.scrollWidth, cw = tal.clientWidth, w = Math.min(100, (cw / sw) * 100), r = tal.scrollLeft / Math.max(1, sw - cw);
  tbar.style.width = w + '%'; tbar.style.marginLeft = r * (100 - w) + '%';
};
tal.addEventListener('scroll', tprog, { passive: true }); addEventListener('resize', tprog); tprog();

/* SoundCloud and Press Kit buttons without a link (href="#"): they look active but clicking does nothing. */
document.querySelectorAll('.tsc, .tpk-btn, .soc a[href="#"], a[data-presskit][href="#"]').forEach((a) => {
  if (a.getAttribute('href') !== '#') return; /* no link yet: keep the button looking active, click does nothing */
  a.removeAttribute('target'); a.setAttribute('aria-label', a.getAttribute('aria-label').replace(/ \(opens.*\)/, ''));
  a.addEventListener('click', (e) => e.preventDefault());
});
/* "Coming soon" popup: Press kit buttons marked data-soon (no link yet) open it; close with the Close button, a click on the blur area, or Esc. */
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
/* Loop video: autoplay (muted, loop), paused only while off-screen to save battery. If the browser blocks autoplay
     (for example iOS Low Power Mode), it retries on the first touch. */
{
  const tv = $('.tloop');
  if (tv) {
    tv.muted = true; tv.defaultMuted = true; tv.setAttribute('muted', ''); tv.setAttribute('playsinline', ''); /* Safari: must be muted to be allowed to autoplay */
    let vis = false;
    const sync = () => { vis ? tv.play().catch(() => {}) : tv.pause(); };
    new IntersectionObserver(([e]) => { vis = e.isIntersecting; sync(); }, { threshold: 0.15 }).observe(tv);
    ['loadeddata', 'canplay'].forEach((ev) => tv.addEventListener(ev, sync));
    document.addEventListener('visibilitychange', sync);
    addEventListener('pointerdown', sync, { once: true, passive: true });
  }
}

/* ===== Latest videos: a thumbnail click plays in place (youtube-nocookie); if the iframe is blocked, open YouTube in a new tab ===== */
document.querySelectorAll('.vid').forEach((a) => a.addEventListener('click', (e) => {
  if (location.protocol === 'file:') return; /* Opened from a local file: YouTube refuses embeds without a referrer (error 153), so let the link open YouTube in a new tab. */
  e.preventDefault();
  document.querySelectorAll('.vthumb iframe').forEach((x) => { x.parentElement.classList.remove('on'); x.remove(); }); /* only one video active at a time */
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

/* ===== Booking button ===== */
const WA = '6281932440500'; /* WhatsApp number in 628xxxxxxxxxx format; empty means the Book us button opens email */
const bk = $('#bookbtn');
if (WA && bk) { bk.href = `https://wa.me/${WA}?text=${encodeURIComponent("Hi Collecteak, I'd like to book you.")}`; bk.target = '_blank'; bk.rel = 'noopener noreferrer'; }

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

/* Talent: on touch screens the card at the center of the carousel becomes active (color, centered name, raised card,
   IG pill, SoundCloud icon and Press Kit appear). Tapping a card activates it manually. */
if (matchMedia('(hover:none)').matches) {
  const tws = [...document.querySelectorAll('.tw:not(.tw-cta)')];
  const tio = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle('on', e.isIntersecting)), { root: $('.tal'), rootMargin: '0px -36% 0px -36%' });
  tws.forEach((w) => tio.observe(w));
  tws.forEach((w) => w.addEventListener('click', (e) => { if (e.target.closest('a')) return; const was = w.classList.contains('tap'); tws.forEach((x) => x.classList.remove('tap')); if (!was) w.classList.add('tap'); }));
}

/* Footer wordmark: particles float in, form COLLECTEAK, hold, break apart, loop (8 second cycle). */
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
    } catch{/* ignore */}
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: false, premultipliedAlpha: true, preserveDrawingBuffer: false, powerPreference: 'low-power' }); renderer.setClearColor(0x000000, 0); } catch { return; }
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
      const put = (t, px) => { if (hasLS) return x.fillText(t, px, base); for (const ch of t) { x.fillText(ch, px, base); px += x.measureText(ch).width + LS; } }; /* Safari: no canvas letterSpacing support */
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

    /* The GPU or OS can drop the WebGL context (low memory, old background tab). Without a handler the canvas turns into a dark box. */
    cv.addEventListener('webglcontextlost', (e) => { e.preventDefault(); lost = true; cv.style.visibility = 'hidden'; gt.style.opacity = 1; }, false);
    cv.addEventListener('webglcontextrestored', () => { lost = false; renderer.setClearColor(0x000000, 0); build(); cv.style.visibility = ''; render(); }, false);

    let rz, lw = innerWidth; addEventListener('resize', () => { if (innerWidth === lw && innerWidth < 1280) return; lw = innerWidth; clearTimeout(rz); rz = setTimeout(build, 250); });
    addEventListener('mousemove', (e) => {
      const r = root.getBoundingClientRect();
      u.uM.value.set(e.clientX - r.left, r.height - (e.clientY - r.top));
    }, { passive: true });

    /* start in the hold phase (4.5 s) so the already visible solid text does not jump */
    const t0 = performance.now() - 5400;
    let ticking = false;
    const render = () => {
      if (document.hidden || !points || lost || !cam) return;
      const t = ((performance.now() - t0) / 1000) % CYCLE;
      u.uT.value = t;
      /* merge: particles become plain white solid text (no glitch, shine or noise) */
      /* particles are ~97% landed at t = 2.6 to 3.2 s: solid text fades in over that window and the particles fade out (no leftover dots) */
      const solid = ss(3.1, 3.8, t) * (1 - ss(6.4, 6.7, t));
      gt.style.opacity = solid;
      u.uSolid.value = solid;
      renderer.render(scene, cam);
    };
    /* the loop only runs while the footer is visible (it used to run rAF even off-screen) */
    onVis = () => { if (visible && !ticking) { render(); gsap.ticker.add(render); ticking = true; } else if (!visible && ticking) { gsap.ticker.remove(render); ticking = false; if (!lost) renderer.clear(); } };
    document.addEventListener('visibilitychange', () => { if (!document.hidden && visible && !lost) render(); });
    onVis();
  }
})();


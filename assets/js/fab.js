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

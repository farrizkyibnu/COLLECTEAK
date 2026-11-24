/* venue: View more / View less. Mobile menampilkan 6 dulu (.m ikut disembunyikan), sisanya (.x) disembunyikan di semua ukuran.
   Animasi: tinggi wall dianimasikan (clip), tile hanya fade (tanpa geser, supaya garis grid tidak bergetar), scroll dijaga saat menutup. */
(function(){var w=document.getElementById('wall'),b=document.querySelector('.vm-btn');if(!w||!b)return;
var rm=matchMedia('(prefers-reduced-motion: reduce)').matches,busy=false,g=window.gsap;
function state(o){b.setAttribute('aria-expanded',o);b.setAttribute('aria-label',o?'View fewer venues':'View more venues')}
function lv(){return typeof lenis!=='undefined'&&lenis}
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

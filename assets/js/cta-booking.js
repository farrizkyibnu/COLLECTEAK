/* CTA brand: buka form booking dengan "Brand event" sudah terpilih (scroll tetap ditangani handler anchor utama) */
(function(){var a=document.querySelector('.lu-cta a');if(!a)return;a.addEventListener('click',function(){var s=document.querySelector('#bform select[name="type"]');if(s)s.value=a.getAttribute('data-prefill')})})();

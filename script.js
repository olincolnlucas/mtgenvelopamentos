(() => {
  const content = window.MTG_CONTENT;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const icon = (id) => `<svg aria-hidden="true"><use href="#${id}"/></svg>`;
  document.querySelectorAll('[data-whatsapp]').forEach(a => a.href = content.whatsapp);
  document.getElementById('copyright-year').textContent = new Date().getFullYear();

  const fleetsSection = document.getElementById('frotas');
  const heroSection = document.querySelector('.hero');
  if (fleetsSection && heroSection) heroSection.insertAdjacentElement('afterend', fleetsSection);

  const header = document.getElementById('site-header');
  const setHeader = () => header.classList.toggle('scrolled', scrollY > 30);
  setHeader(); addEventListener('scroll', setHeader, {passive:true});

  const toggle = document.querySelector('.menu-toggle');
  const mobile = document.getElementById('mobile-nav');
  const closeMenu = () => { toggle.setAttribute('aria-expanded','false'); toggle.setAttribute('aria-label','Abrir menu'); mobile.hidden=true; mobile.classList.remove('is-open'); };
  toggle.addEventListener('click', () => { const open=toggle.getAttribute('aria-expanded')!=='true'; toggle.setAttribute('aria-expanded',String(open)); toggle.setAttribute('aria-label',open?'Fechar menu':'Abrir menu'); mobile.hidden=!open; mobile.classList.toggle('is-open',open); });
  mobile.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  addEventListener('resize', () => { if(innerWidth>900) closeMenu(); });

  const lazyVideo = (video) => { if(!video || video.dataset.loaded) return; const source=video.querySelector('source[data-src]'); if(source){source.src=source.dataset.src; video.load();} video.dataset.loaded='true'; };
  const updateVideoButton = (video, button) => { const playing=!video.paused; button.setAttribute('aria-pressed',String(playing)); button.setAttribute('aria-label',playing?'Pausar vídeo':'Reproduzir vídeo'); const use=button.querySelector('use'); if(use) use.setAttribute('href',playing?'#i-pause':'#i-play'); };
  document.querySelectorAll('[data-toggle-video]').forEach(button => { const video=document.getElementById(button.dataset.toggleVideo); button.addEventListener('click',async()=>{ lazyVideo(video); if(video.paused){try{await video.play();}catch(e){}}else video.pause(); updateVideoButton(video,button); }); video.addEventListener('play',()=>updateVideoButton(video,button)); video.addEventListener('pause',()=>updateVideoButton(video,button)); });
  const heroVideo=document.getElementById('hero-video'); const reel=document.getElementById('instagram-video');
  if(heroVideo){
    lazyVideo(heroVideo); heroVideo.muted=true; heroVideo.defaultMuted=true; heroVideo.play().catch(()=>{});
    const heroObserver=new IntersectionObserver(([entry])=>{ if(entry.isIntersecting) heroVideo.play().catch(()=>{}); else heroVideo.pause(); },{rootMargin:'120px',threshold:.15});
    heroObserver.observe(heroVideo);
  }

  let reelVisible=false, reelAudioUnlocked=false;
  const stopReel=()=>{ if(!reel)return; reel.pause(); reel.muted=true; };
  const playReel=async()=>{
    if(!reel || !reelVisible || document.visibilityState!=='visible')return;
    reel.volume=1; reel.muted=false;
    try{ await reel.play(); }
    catch(err){
      reel.muted=true;
      try{ await reel.play(); }catch(ignore){}
      if(reelAudioUnlocked&&reelVisible){ reel.muted=false; reel.play().catch(()=>{ reel.muted=true; }); }
    }
  };
  const unlockReelAudio=()=>{ reelAudioUnlocked=true; if(!reelVisible || !reel)return; reel.muted=false; reel.volume=1; reel.play().catch(()=>{ reel.muted=true; }); };
  document.addEventListener('pointerdown',unlockReelAudio,{passive:true});
  document.addEventListener('keydown',unlockReelAudio);
  if(reel){
    reel.muted=true; reel.defaultMuted=true;
    const reelObserver=new IntersectionObserver(([entry])=>{ reelVisible=entry.isIntersecting&&entry.intersectionRatio>=.35; if(reelVisible)playReel(); else stopReel(); },{threshold:[0,.35,.7]});
    reelObserver.observe(reel);
    document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='hidden')stopReel(); else playReel(); });
  }

  const projects=document.getElementById('projects-grid');
  projects.innerHTML=content.projects.map(p=>`<article class="project reveal"><button class="project-photo" data-gallery="${p.gallery}" aria-label="Abrir galeria: ${p.title}"><img src="${p.image}" alt="${p.description}" width="1000" height="800" loading="lazy" style="object-position:${p.focus||'center'}"><span class="project-category">${p.category}</span><span class="project-open">${icon('i-arrow')}</span></button><div class="project-description"><h3>${p.title}</h3></div></article>`).join('');

  const comparisonSection=document.getElementById('antes-depois');
  if(content.comparison){ const c=content.comparison; comparisonSection.hidden=false; document.getElementById('comparison-mount').innerHTML=`<div class="comparison-pair"><figure><img src="${c.before}" alt="${c.beforeAlt}" loading="lazy"><figcaption>Antes</figcaption></figure><figure><img src="${c.after}" alt="${c.afterAlt}" loading="lazy"><figcaption>Depois</figcaption></figure></div><div class="comparison-story"><div><h3>${c.title}</h3><p>${c.description}</p></div><a class="text-link" href="${content.whatsapp}" target="_blank" rel="noopener noreferrer">Quero transformar ${icon('i-arrow')}</a></div>`; }
  if(content.testimonials.length){ const section=document.getElementById('depoimentos'); section.hidden=false; document.getElementById('testimonials-grid').innerHTML=content.testimonials.map(t=>`<article class="testimonial"><div class="testimonial-stars" aria-label="5 estrelas">★★★★★</div><blockquote>${t.comment}</blockquote><div class="testimonial-person"><span class="testimonial-avatar">${t.name[0]}</span><div><strong>${t.name}</strong><small>${t.service}</small></div></div></article>`).join(''); }

  const dialog=document.getElementById('gallery-dialog'), image=document.getElementById('gallery-image'), caption=document.getElementById('gallery-caption'), count=document.getElementById('gallery-count'), error=document.getElementById('gallery-error'), galleryBudget=document.getElementById('gallery-budget');
  let set=[], index=0, opener=null;
  const show=(next) => { if(!set.length)return; index=(next+set.length)%set.length; const item=set[index]; error.hidden=true; image.removeAttribute('data-error'); image.src=item.src; image.alt=item.alt; caption.textContent=item.caption; count.textContent=`${index+1} de ${set.length}`; document.querySelector('.gallery-prev').hidden=set.length<2; document.querySelector('.gallery-next').hidden=set.length<2; };
  const openGallery=(key,button) => { set=content.galleries[key]||[]; if(!set.length)return; opener=button; galleryBudget.href=(key==='frotas'||key==='gcm-transformacao')?content.fleetWhatsapp:content.whatsapp; show(Number(button.dataset.galleryIndex)||0); dialog.showModal(); document.body.classList.add('modal-open'); };
  document.addEventListener('click',e=>{ const button=e.target.closest('[data-gallery]'); if(button)openGallery(button.dataset.gallery,button); });
  document.querySelector('.gallery-prev').addEventListener('click',()=>show(index-1)); document.querySelector('.gallery-next').addEventListener('click',()=>show(index+1));
  const closeGallery=()=>dialog.close(); document.querySelector('.gallery-close').addEventListener('click',closeGallery); dialog.addEventListener('click',e=>{if(e.target===dialog)closeGallery();}); dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');opener?.focus();});
  image.addEventListener('error',()=>{image.setAttribute('data-error','');error.hidden=false;});
  let touchX=0; dialog.addEventListener('touchstart',e=>touchX=e.changedTouches[0].clientX,{passive:true}); dialog.addEventListener('touchend',e=>{const d=e.changedTouches[0].clientX-touchX;if(Math.abs(d)>55)show(index+(d<0?1:-1));},{passive:true});

  const fleetCards=[...document.querySelectorAll('[data-fleet-video]')];
  const fleetVideos=fleetCards.map(card=>card.querySelector('.fleet-inline-video'));
  const fleetDialog=document.getElementById('fleet-video-dialog');
  const fleetDialogTitle=document.getElementById('fleet-video-dialog-title');
  const fleetModalVideo=document.getElementById('fleet-modal-video');
  const fleetDialogClose=document.querySelector('.fleet-video-dialog-close');
  let fleetOpener=null;
  const playInlineFleetVideo=(video)=>{ if(!video || fleetDialog.open || document.visibilityState!=='visible' || video.dataset.inView!=='true')return; lazyVideo(video); video.muted=true; video.defaultMuted=true; video.play().catch(()=>{}); };
  const fleetObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{ const video=entry.target; video.dataset.inView=String(entry.isIntersecting&&entry.intersectionRatio>=.12); if(video.dataset.inView==='true')playInlineFleetVideo(video); else video.pause(); }),{rootMargin:'180px 0px',threshold:[0,.12,.4]});
  fleetVideos.forEach(video=>{ video.muted=true; video.defaultMuted=true; fleetObserver.observe(video); });
  fleetCards.forEach(card=>card.addEventListener('click',()=>{
    const inlineVideo=card.querySelector('.fleet-inline-video');
    fleetOpener=card;
    fleetVideos.forEach(video=>video.pause());
    fleetDialogTitle.textContent=card.dataset.fleetTitle||'Projeto de frota';
    fleetModalVideo.src=card.dataset.fleetVideo;
    fleetModalVideo.poster=inlineVideo.poster;
    fleetModalVideo.muted=false;
    fleetModalVideo.volume=1;
    try{fleetModalVideo.currentTime=inlineVideo.currentTime||0;}catch(ignore){}
    fleetDialog.showModal();
    document.body.classList.add('modal-open');
    fleetModalVideo.play().catch(()=>{});
  }));
  const closeFleetVideo=()=>{ if(fleetDialog.open)fleetDialog.close(); };
  fleetDialogClose.addEventListener('click',closeFleetVideo);
  fleetDialog.addEventListener('click',event=>{if(event.target===fleetDialog)closeFleetVideo();});
  fleetDialog.addEventListener('close',()=>{
    fleetModalVideo.pause();
    fleetModalVideo.removeAttribute('src');
    fleetModalVideo.load();
    document.body.classList.remove('modal-open');
    fleetVideos.forEach(playInlineFleetVideo);
    fleetOpener?.focus();
  });
  document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='hidden')fleetVideos.forEach(video=>video.pause()); else fleetVideos.forEach(playInlineFleetVideo); });

  if(!reduced){ document.documentElement.classList.add('motion-ready'); const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target);}}),{threshold:.08,rootMargin:'0px 0px -40px'}); document.querySelectorAll('.reveal').forEach(el=>observer.observe(el)); }
})();

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
  // One playback policy for all inline videos. Audio is only enabled by a direct tap.
  const inlineVideos=[...document.querySelectorAll('#hero-video,#instagram-video,.fleet-inline-video')];
  const playback=new Map();
  const isOnscreen=video=>{
    const box=video.getBoundingClientRect();
    return box.width>0&&box.height>0&&box.bottom>0&&box.top<innerHeight&&box.right>0&&box.left<innerWidth;
  };
  const canAutoplay=video=>document.visibilityState==='visible'&&isOnscreen(video)&&!document.getElementById('fleet-video-dialog')?.open;
  const playInline=video=>{
    const state=playback.get(video);
    if(!state||!canAutoplay(video)||state.pending||!video.paused)return;
    video.muted=!state.audio;
    lazyVideo(video);
    state.pending=true;
    video.play().then(()=>{
      if(!canAutoplay(video)){video.pause();video.muted=true;state.audio=false;}
      if(state.retry)state.retry.hidden=true;
    }).catch(error=>{
      if(error.name==='NotAllowedError'&&state.retry)state.retry.hidden=false;
    }).finally(()=>{state.pending=false;});
  };
  const syncInline=()=>inlineVideos.forEach(video=>{
    if(canAutoplay(video))playInline(video);
    else{video.pause();video.muted=true;playback.get(video).audio=false;}
  });
  inlineVideos.forEach(video=>{
    video.muted=true;video.defaultMuted=true;video.autoplay=true;video.loop=true;video.playsInline=true;
    video.setAttribute('muted','');video.setAttribute('playsinline','');video.setAttribute('webkit-playsinline','');
    video.controls=false;
    const state={pending:false,audio:false,retry:null};
    playback.set(video,state);
    if(video.id){
      const retry=document.createElement('button');
      retry.type='button';retry.className='autoplay-retry';retry.hidden=true;
      retry.setAttribute('aria-label','Reproduzir vídeo');retry.innerHTML=icon('i-play');
      retry.addEventListener('click',()=>playInline(video));
      (video.id==='hero-video'?heroSection:video.parentElement).append(retry);
      state.retry=retry;
    }
    ['loadeddata','canplay'].forEach(event=>video.addEventListener(event,()=>playInline(video)));
    video.addEventListener('playing',()=>{if(state.retry)state.retry.hidden=true;});
    video.addEventListener('ended',()=>{video.currentTime=0;playInline(video);});
  });
  const inlineObserver=new IntersectionObserver(syncInline,{threshold:[0,.01,.15,.35]});
  inlineVideos.forEach(video=>inlineObserver.observe(video));
  document.addEventListener('visibilitychange',syncInline);
  addEventListener('pageshow',syncInline);
  addEventListener('online',syncInline);
  // Retry in the user's gesture when a mobile browser refuses autoplay.
  ['pointerdown','touchend','keydown'].forEach(event=>document.addEventListener(event,syncInline,{passive:true}));
  const reel=document.getElementById('instagram-video');
  if(reel){
    reel.setAttribute('tabindex','0');
    const toggleReelAudio=()=>{const state=playback.get(reel);state.audio=!state.audio;reel.muted=!state.audio;playInline(reel);};
    reel.addEventListener('click',toggleReelAudio);
    reel.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();toggleReelAudio();}});
  }
  syncInline();

  const projects=document.getElementById('projects-grid');
  projects.innerHTML=content.projects.map(p=>`<article class="project reveal"><button class="project-photo" data-gallery="${p.gallery}" aria-label="Abrir galeria: ${p.title}"><img src="${p.image}" alt="${p.description}" width="1000" height="800" loading="lazy" style="object-position:${p.focus||'center'}"><span class="project-category">${p.category}</span><span class="project-open">${icon('i-arrow')}</span></button><div class="project-description"><h3>${p.title}</h3></div></article>`).join('');

  const comparisonSection=document.getElementById('antes-depois');
  if(content.comparison){ const c=content.comparison; comparisonSection.hidden=false; document.getElementById('comparison-mount').innerHTML=`<h3>${c.title}</h3><div class="transformation-pair" tabindex="0" role="region" aria-label="Antes e depois do carrinho de pipoca. Deslize para comparar."><figure><img src="${c.before}" alt="${c.beforeAlt}" loading="lazy"><figcaption>Antes</figcaption></figure><figure><img src="${c.after}" alt="${c.afterAlt}" loading="lazy"><figcaption>Depois</figcaption></figure></div><div class="comparison-story"><div><p>${c.description}</p></div><a class="text-link" href="${content.whatsapp}" target="_blank" rel="noopener noreferrer">Quero transformar ${icon('i-arrow')}</a></div>`; }
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
  fleetCards.forEach(card=>card.addEventListener('click',()=>{
    const inlineVideo=card.querySelector('.fleet-inline-video');
    fleetOpener=card;
    fleetDialogTitle.textContent=card.dataset.fleetTitle||'Projeto de frota';
    fleetModalVideo.src=card.dataset.fleetVideo;
    fleetModalVideo.poster=inlineVideo.poster;
    fleetModalVideo.muted=false;
    fleetModalVideo.volume=1;
    try{fleetModalVideo.currentTime=inlineVideo.currentTime||0;}catch(ignore){}
    fleetDialog.showModal();
    syncInline();
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
    syncInline();
    fleetOpener?.focus();
  });

  if(!reduced){ document.documentElement.classList.add('motion-ready'); const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target);}}),{threshold:.08,rootMargin:'0px 0px -40px'}); document.querySelectorAll('.reveal').forEach(el=>observer.observe(el)); }
})();

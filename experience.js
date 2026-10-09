/* Per-chapter presentation scenes. Add ?experience=off to use the original transitions. */
(() => {
  const q = selector => document.querySelector(selector);
  if (new URLSearchParams(location.search).get("experience") === "off") {
    document.body.dataset.experience = "off";
    return;
  }
  const language = () => document.documentElement.lang === "en" ? "en" : "tr";
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const deckSlides = [...document.querySelectorAll(".slide")];
  const overlay = q("#operationMapOverlay"), romaniaGrid = q(".romania-grid");
  const chapter = q("#chapterTransition"), visual = q("#chapterTransitionVisual");
  let mapTimers = [], mapRun = 0, chapterTimers = [], chapterRun = 0, chapterIndex = -1;
  let pendingIndex = null, lastSlideIndex = -1;

  const scenes = [
    {type:"opening",duration:2300,accent:"#1264d7",wash:"#dbeaff"},
    {type:"agenda",duration:2600,accent:"#087e77",wash:"#def7ee"},
    {type:"team",duration:2700,accent:"#6557c7",wash:"#ece8ff"},
    {type:"partnership",duration:2800,accent:"#137dab",wash:"#dff3fb"},
    {type:"projects",duration:3000,accent:"#1264d7",wash:"#def5f8"},
    {type:"mail",duration:2700,accent:"#078c79",wash:"#def8ee"},
    {type:"special",duration:2700,accent:"#5366bd",wash:"#e8edff"},
    {type:"romania",duration:0,accent:"#b78c24",wash:"#fff2d1"},
    {type:"supalan",duration:2900,accent:"#087ba6",wash:"#ddf3fc"},
    {type:"closing",duration:2800,accent:"#a07926",wash:"#fff1d8"}
  ];
  function chapterTitle(index) {
    const locale = language();
    if (index === 4) return locale === "tr" ? "Aycube & Projeler" : "Aycube & Projects";
    if (index === 5) return "Otomail";
    return deckSlides[index]?.dataset[locale === "tr" ? "titleTr" : "titleEn"] || "";
  }
  const paths = {
    bank:'<path d="m3 8 9-5 9 5H3Zm2 3v7m5-7v7m5-7v7m4-7v7M3 21h18"/><path d="m16 16 2 2 3-4"/>',
    compass:'<circle cx="12" cy="12" r="9"/><path d="m16 8-3 5-5 3 3-5 5-3Z"/>',
    cube:'<path d="m12 3 9 5v9l-9 5-9-5V8l9-5Zm0 10L3 8m9 5 9-5m-9 5v9"/>',
    handshake:'<path d="m3 7 5-3 4 2 4-2 5 3-3 9-4 3-3-1-3 1-5-4-2-5m7-6-3 6 3 2 4-4 5 6m-9-1 5 5m-8-2 3 3"/>',
    shield:'<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/>',
    leaf:'<path d="M20 3C10 2 3 6 4 13c1 5 8 7 12 3 4-4 4-13 4-13ZM5 20l11-11"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 3"/>',
    search:'<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6M7 10h6M10 7v6"/>',
    code:'<path d="m8 6-6 6 6 6m8-12 6 6-6 6M14 3l-4 18"/>',
    iterate:'<path d="M20 8a8 8 0 0 0-14-3L3 8m0-5v5h5M4 16a8 8 0 0 0 14 3l3-3m0 5v-5h-5"/>',
    box:'<path d="m12 3 9 5v12H3V8l9-5ZM3 8h18M12 8v12m-4-6h8"/>',
    camera:'<path d="m8 6 2-3h4l2 3h5v14H3V6h5Z"/><circle cx="12" cy="13" r="4"/>',
    plate:'<rect x="2" y="6" width="20" height="12" rx="3"/><path d="M6 10h3m2 0h3m2 0h2M6 14h8"/>',
    gate:'<path d="M4 21V5h3v16M17 21V5h3v16M4 8h16M9 12h6m-3-3v6"/>',
    folderSearch:'<path d="M3 7h7l2 3h9v10H3V7ZM3 7V4h7l2 3"/><circle cx="14" cy="14" r="3"/><path d="m16 16 3 3"/>',
    sparkle:'<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z"/>',
    truck:'<path d="M2 5h12v12H2V5Zm12 5h5l3 4v3h-8v-7Zm2 1v3h5M2 17h20"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="19" r="2"/>'
  };
  function sceneIcon(type) {
    if (!paths[type]) return romaniaProjectIcon(type);
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+paths[type]+'</svg>';
  }
  function routeGraphic(vertical = false) {
    const suffix=vertical?"tall":"wide",route=vertical?"M180 70V550":"M100 150H900";
    const nodes=["document","tbr","bank","documents","mail"].map((name,index)=>{
      const [x,y]=vertical?[180,70+index*120]:[100+index*200,150];
      return '<g transform="translate('+x+' '+y+')" style="--xp-node-order:'+index+'"><circle class="xp-file-halo" r="66"/><circle class="xp-file-node" r="54"/><g class="xp-file-symbol">'+sceneIcon(name).replace('<svg ','<svg x="-27" y="-27" width="54" height="54" ')+'</g></g>';
    }).join("");
    const gradientCoordinates=vertical?'x1="180" y1="70" x2="180" y2="550"':'x1="100" y1="150" x2="900" y2="150"';
    return '<svg class="xp-file-graphic xp-file-'+suffix+'" viewBox="'+(vertical?'0 0 360 620':'0 0 1000 330')+'" fill="none" aria-hidden="true"><defs><linearGradient id="xp-file-line-'+suffix+'" gradientUnits="userSpaceOnUse" '+gradientCoordinates+'><stop stop-color="#1264d7"/><stop offset="1" stop-color="#20a593"/></linearGradient></defs><path class="xp-file-rail" d="'+route+'"/><path class="xp-file-route" d="'+route+'" pathLength="100" stroke="url(#xp-file-line-'+suffix+')"/>'+nodes+'<g transform="'+(vertical?'translate(180 70)':'translate(100 150)')+'"><g class="xp-file-traveller"><path d="M-8-17H5L13-9V16H-8Z" fill="#fff" stroke="#1264d7" stroke-width="2"/><path d="M5-17V-9H13M-3-2H8M-3 4H8M-3 10H4" stroke="#1264d7" stroke-width="1.7" stroke-linecap="round"/></g></g></svg>';
  }
  function sceneMarkup(type) {
    if(type==="opening") return '<div class="xp-brand-meeting"><img src="assets/aygen-color.png" alt="" decoding="async"/><span class="xp-brand-join">'+sceneIcon("handshake")+'</span><img src="assets/ford-otosan.webp" alt="" decoding="async"/></div>';
    if(type==="agenda") return '<div class="xp-agenda-orbit"><svg class="xp-orbit-lines" viewBox="0 0 600 340" fill="none"><ellipse cx="300" cy="170" rx="208" ry="122"/></svg><span class="xp-orbit-hub">'+sceneIcon("compass")+'</span>'+["user","cube","clock","shield","leaf"].map((name,index)=>{const angle=(-90+index*72)*Math.PI/180;return '<span class="xp-orbit-node" style="--xp-order:'+index+';left:'+(50+Math.cos(angle)*35)+'%;top:'+(50+Math.sin(angle)*36)+'%">'+sceneIcon(name)+'</span>';}).join("")+'</div>';
    if(type==="team") return '<div class="xp-team-network">'+[...document.querySelectorAll(".team-photo-wrap img")].map((image,index)=>'<div class="xp-team-person" style="--xp-order:'+index+'"><span class="xp-team-fallback">'+sceneIcon("user")+'</span><img src="'+image.getAttribute("src")+'" alt="" decoding="async"/><i aria-hidden="true"></i></div>').join("")+'</div>';
    if(type==="partnership") return '<div class="xp-process-ribbon">'+["handshake","search","code","shield","iterate","box"].map((name,index)=>'<div class="xp-process-node" style="--xp-order:'+index+'"><span>'+sceneIcon(name)+'</span><i aria-hidden="true"></i></div>').join("")+'</div>';
    if(type==="projects") return routeGraphic()+routeGraphic(true);
    if(type==="mail") return '<div class="xp-mail-scene"><div class="xp-report-fan">'+[-80,0,80].map((x,index)=>'<span class="xp-report-paper" style="--xp-order:'+index+';--xp-paper-x:'+x+'px;--xp-paper-angle:'+(index-1)*12+'deg">'+sceneIcon("document")+'</span>').join("")+'</div><span class="xp-mail-hub">'+sceneIcon("mail")+'<i></i></span><div class="xp-mail-people">'+[0,1,2].map(index=>'<span style="--xp-order:'+index+'">'+sceneIcon("user")+'</span>').join("")+'</div></div>';
    if(type==="special") return '<div class="xp-special-stage">'+["folderSearch","gate","bank"].map((name,index)=>'<div class="xp-special-plinth" style="--xp-order:'+index+'"><span>'+sceneIcon(name)+'</span><i></i></div>').join("")+'</div>';
    if(type==="supalan") return '<div class="xp-security-scene"><div class="xp-security-badges">'+["camera","shield","plate"].map((name,index)=>'<span style="--xp-order:'+index+'">'+sceneIcon(name)+'</span>').join("")+'</div><div class="xp-road"><span class="xp-truck">'+sceneIcon("truck")+'</span><span class="xp-gate-post"><i class="xp-gate-arm"></i></span></div></div>';
    if(type==="closing") return '<div class="xp-finale-scene"><span class="xp-finale-spark">'+sceneIcon("sparkle")+'</span><div class="xp-finale-brands">'+["assets/aycube.png","assets/berkbot.png","assets/brands/bir-dizi-gumruk.png","assets/brands/cube-academy.png"].map((src,index)=>'<img src="'+src+'" alt="" decoding="async" style="--xp-order:'+index+'"/>').join("")+'</div></div>';
    return "";
  }
  function hideChapter(immediate=false) {
    chapterRun+=1;chapterTimers.forEach(clearTimeout);chapterTimers=[];
    if(chapter.hidden)return;
    const finishingIndex=chapterIndex;
    const finish=()=>{chapter.hidden=true;chapter.classList.remove("is-playing","is-leaving");visual.innerHTML="";document.dispatchEvent(new CustomEvent("presentation:chapterend",{detail:{index:finishingIndex}}));};
    if(immediate||reducedMotion.matches)finish();
    else{chapter.classList.add("is-leaving");chapterTimers.push(setTimeout(finish,250));}
  }
  function showChapter(index) {
    if(index===7||!scenes[index]||reducedMotion.matches||document.hidden||document.querySelector("dialog[open]"))return;
    if(!chapter.hidden&&chapterIndex===index)return;
    hideChapter(true);
    const scene=scenes[index],run=++chapterRun;
    chapterIndex=index;
    chapter.dataset.index=String(index);chapter.dataset.scene=scene.type;
    chapter.style.setProperty("--xp-accent",scene.accent);chapter.style.setProperty("--xp-wash",scene.wash);
    q("#chapterTransitionTitle").textContent=chapterTitle(index);
    visual.innerHTML=sceneMarkup(scene.type);
    visual.querySelectorAll("img").forEach(image=>image.addEventListener("error",()=>image.hidden=true,{once:true}));
    chapter.hidden=false;chapter.classList.remove("is-leaving");
    requestAnimationFrame(()=>{if(run===chapterRun)chapter.classList.add("is-playing");});
    chapterTimers.push(setTimeout(()=>hideChapter(),scene.duration));
  }

  // The map connection represents a shared ecosystem, not live cross-border transfers.
  function renderMap() {
    const tr = language() === "tr";
    q("#operationMapEyebrow").textContent = tr ? "BİR EKOSİSTEM · İKİ OPERASYON" : "ONE ECOSYSTEM · TWO OPERATIONS";
    q("#operationMapTitle").textContent = tr ? "Romanya" : "Romania";
    q("#operationMapDescription").textContent = tr ? "Türkiye’den Romanya’ya, operasyon ihtiyaçlarına uyarlanan dijital çözümler." : "Digital solutions adapted to operational needs, from Turkey to Romania.";
    q("#operationMapContinueLabel").textContent = tr ? "Romanya’ya devam et" : "Continue to Romania";
    q("#operationMapNote").textContent = tr ? "Ortak çözüm ekosistemi · Canlı ülkeler arası veri aktarımı gösterimi değildir." : "Shared solution ecosystem · Not a live cross-border data-transfer display.";
    [["#operationMapTurkey",tr?"Türkiye":"Turkey","Aycube.com","TR"],["#operationMapRomania",tr?"Romanya":"Romania","Aycube.ro","RO"]].forEach(([selector,country,platform,code]) => {
      q(selector).innerHTML = '<span class="xp-map-country-code">'+code+'</span><h3>'+country+'</h3><strong>'+platform+'</strong><ul><li>'+(tr?"Entegrasyon":"Integration")+'</li><li>'+(tr?"Arşiv":"Archive")+'</li><li>Otomail</li></ul>';
    });
  }
  function clearMapTimers() { mapTimers.forEach(clearTimeout); mapTimers = []; }
  function hideMap(immediate = false) {
    const run = ++mapRun;
    clearMapTimers(); romaniaGrid.inert = false;
    if (overlay.hidden) return;
    const restore = overlay.contains(document.activeElement);
    overlay.classList.remove("is-showing","is-focused");
    const finish = () => {
      if (run !== mapRun) return;
      overlay.hidden = true;
      if (restore && q(".slide-romania.is-active")) q("#operationMapReplay").focus({preventScroll:true});
    };
    if (immediate || reducedMotion.matches) finish();
    else mapTimers.push(setTimeout(finish,320));
  }
  function showMap() {
    if (!q(".slide-romania.is-active") || document.querySelector("dialog[open]")) return;
    hideChapter(true);
    clearMapTimers();
    const run = ++mapRun;
    renderMap(); overlay.hidden = false;
    overlay.querySelector(".xp-map-content").scrollTop = 0;
    romaniaGrid.inert = true;
    requestAnimationFrame(() => { if (run === mapRun) overlay.classList.add("is-showing"); });
    if (!reducedMotion.matches) mapTimers.push(setTimeout(() => { if (run === mapRun) overlay.classList.add("is-focused"); },1000));
    q("#operationMapContinue").focus({preventScroll:true});
    // Intentionally stays open until the centred CTA or normal slide navigation is used.
  }

  function syncSlide() {
    const index=deckSlides.findIndex(slide=>slide.classList.contains("is-active"));
    const requested=pendingIndex===index,changed=lastSlideIndex!==index;
    pendingIndex=null;lastSlideIndex=index;
    if(index===7){
      hideChapter(true);
      if((changed||requested)&&!reducedMotion.matches&&!document.hidden)showMap();
    }else{
      hideMap(true);showChapter(index);
    }
  }
  q("#operationMapReplay").addEventListener("click",showMap);
  q("#operationMapContinue").addEventListener("click",()=>hideMap());
  document.addEventListener("presentation:slidewillchange",event=>{
    pendingIndex=event.detail.index;hideMap(true);
    if(reducedMotion.matches||document.hidden){hideChapter(true);return;}
    if(event.detail.index===7)hideChapter(true);else showChapter(event.detail.index);
    // Take over the old curtain so the viewer sees one coherent chapter scene.
    if(event.cancelable)event.preventDefault();
  });
  document.addEventListener("presentation:slidechange",syncSlide);
  document.addEventListener("presentation:languagechange",()=>{
    renderMap();if(!chapter.hidden)q("#chapterTransitionTitle").textContent=chapterTitle(chapterIndex);
  });
  document.addEventListener("visibilitychange",()=>{if(document.hidden){hideChapter(true);hideMap(true);}});
  document.addEventListener("keydown",event=>{
    if(!overlay.hidden&&([" ","Enter"].includes(event.key)&&event.target.closest?.("#operationMapContinue"))){hideMap();event.preventDefault();event.stopImmediatePropagation();}
    else if(!overlay.hidden&&event.key==="Escape"){hideMap();event.preventDefault();event.stopImmediatePropagation();}
    else if(!chapter.hidden&&event.key==="Escape"){hideChapter(true);event.preventDefault();event.stopImmediatePropagation();}
  },true);
  new MutationObserver(()=>{
    if(document.querySelector("dialog[open]")){hideMap(true);hideChapter(true);}
  }).observe(document.body,{subtree:true,attributes:true,attributeFilter:["open"]});
  reducedMotion.addEventListener("change",()=>{if(reducedMotion.matches){hideMap(true);hideChapter(true);}});
  renderMap();syncSlide();
})();

/* Card-origin zoom, a seven-second volume reveal and an optional platform cutaway. */
(() => {
  if(new URLSearchParams(location.search).get("experience")==="off")return;
  const q=selector=>document.querySelector(selector),motion=matchMedia("(prefers-reduced-motion: reduce)");
  const locale=()=>document.documentElement.lang==="en"?"en":"tr";
  const origins=new WeakMap(),moving=new Map();let clickOrigin=null;
  document.addEventListener("click",event=>{
    clickOrigin=event.target.closest?.("button,[role=button]")||null;
    const captured=clickOrigin;queueMicrotask(()=>{if(clickOrigin===captured)clickOrigin=null;});
  },true);
  function sourceRect(source){
    if(!source?.isConnected)return null;
    const rect=source.getBoundingClientRect();
    return rect.width>0&&rect.height>0&&rect.right>0&&rect.bottom>0&&rect.left<innerWidth&&rect.top<innerHeight?rect:null;
  }
  function zoomFrame(rect,target,source){
    const sx=rect.width/target.width,sy=rect.height/target.height;
    const radius=parseFloat(getComputedStyle(source).borderRadius)||18;
    return {transform:'translate('+(rect.left-target.left)+'px,'+(rect.top-target.top)+'px) scale('+sx+','+sy+')',borderRadius:(radius/Math.min(sx,sy))+'px'};
  }
  function releaseMotion(modal){
    const state=moving.get(modal);if(!state)return;
    moving.delete(modal);clearTimeout(state.deadline);state.animation?.cancel();state.inner?.cancel();
    state.source?.classList.remove("xp-origin-source");
    modal.removeAttribute("data-xp-zoom");modal.removeAttribute("data-xp-phase");
  }
  document.addEventListener("presentation:dialogopen",event=>{
    const {modal,resume}=event.detail;
    if(!modal||modal.open)return;
    const candidate=event.detail.origin||clickOrigin||document.activeElement;
    const trigger=resume?origins.get(modal)?.trigger:(candidate?.matches?.("button,[role=button]")?candidate:null);
    const source=trigger?.id==="systemXrayTrigger"?trigger.closest(".aycube-statement"):trigger;
    if(!resume)origins.delete(modal);
    if(sourceRect(source))origins.set(modal,{source,trigger});
    const origin=origins.get(modal),rect=sourceRect(origin?.source);
    if(motion.matches||document.hidden||!rect)return;
    event.preventDefault();releaseMotion(modal);
    modal.dataset.xpZoom="true";modal.dataset.xpPhase=resume?"open":"opening";
    modal.showModal();if(!resume)modal.scrollTop=0;
    if(modal.classList.contains("solution-modal"))modal.classList.add("is-open");
    origin.source.classList.add("xp-origin-source");
    const state={source:origin.source,trigger:origin.trigger,phase:"opening",animation:null,inner:null,deadline:0};moving.set(modal,state);
    if(resume){state.phase="open";return;}
    const target=modal.getBoundingClientRect();
    state.animation=modal.animate([{transform:zoomFrame(rect,target,origin.source).transform,opacity:.55},{transform:"none",opacity:1}],{duration:580,easing:"cubic-bezier(.2,.8,.2,1)",fill:"both"});
    const inner=modal.querySelector(".solution-panel,.xp-xray-content");
    if(inner)state.inner=inner.animate([{opacity:.12},{opacity:1}],{duration:280,delay:100,fill:"both"});
    const opened=()=>{if(moving.get(modal)!==state||state.phase!=="opening")return;clearTimeout(state.deadline);state.animation.cancel();state.inner?.cancel();state.phase="open";modal.dataset.xpPhase="open";};
    state.animation.onfinish=opened;state.deadline=setTimeout(opened,620);
  });
  document.addEventListener("presentation:dialogclose",event=>{
    const {modal,immediate}=event.detail,state=moving.get(modal);
    if(!state)return;
    if(immediate||motion.matches||document.hidden){releaseMotion(modal);return;}
    event.preventDefault();if(state.phase==="closing")return;
    const currentStyle=getComputedStyle(modal),from={transform:currentStyle.transform,opacity:currentStyle.opacity};
    clearTimeout(state.deadline);state.animation?.cancel();state.inner?.cancel();
    state.phase="closing";modal.dataset.xpPhase="closing";
    const rect=sourceRect(state.source),target=modal.getBoundingClientRect();
    const to=rect?{transform:zoomFrame(rect,target,state.source).transform,opacity:.2}:{transform:"scale(.97)",opacity:0};
    state.animation=modal.animate([from,to],{duration:390,easing:"cubic-bezier(.4,0,.2,1)",fill:"both"});
    const closed=()=>{
      if(moving.get(modal)!==state)return;
      const trigger=state.trigger;modal.classList.remove("is-open");modal.close();releaseMotion(modal);
      if(trigger?.isConnected&&sourceRect(trigger))trigger.focus({preventScroll:true});
    };
    state.animation.onfinish=closed;state.deadline=setTimeout(closed,420);
  });
  document.querySelectorAll(".solution-modal,#infoModal,#systemXray").forEach(modal=>{
    modal.addEventListener("cancel",event=>{event.preventDefault();closePresentationDialog(modal);});
    modal.addEventListener("close",()=>{if(!modal.open)releaseMotion(modal);});
  });
  document.addEventListener("keydown",event=>{
    if(event.key==="Escape"){
      const open=[...document.querySelectorAll("dialog[open]")];
      if(open.length){
        const active=document.activeElement?.closest?.("dialog[open]")||[...moving.keys()].reverse().find(modal=>modal.open)||open.at(-1);
        event.preventDefault();event.stopImmediatePropagation();closePresentationDialog(active);return;
      }
      if(scaleRunning&&!q("#overview.is-open")){event.preventDefault();event.stopImmediatePropagation();finishScale(true);}
    }
    if(event.key===" "&&event.target.closest?.("#volumeReplay,.xp-scale-skip"))event.stopImmediatePropagation();
  },true);
  function settleMotion(){
    [...moving].forEach(([modal,state])=>{
      if(state.phase==="closing"){modal.close();releaseMotion(modal);}
      else{clearTimeout(state.deadline);state.animation?.cancel();state.inner?.cancel();state.phase="open";modal.dataset.xpPhase="open";}
    });
  }
  window.addEventListener("resize",settleMotion);

  const volumeGrid=q(".otomail-volume-grid"),numbers=[...volumeGrid.querySelectorAll("[data-xp-volume]")],machine=q(".mail-machine");
  const stage=document.createElement("section");stage.className="xp-volume-stage";stage.hidden=true;stage.setAttribute("aria-label","Gönderim ölçeği");
  stage.innerHTML='<button class="xp-scale-skip" type="button" aria-label="Ölçek animasyonunu tamamla">×</button><p class="xp-scale-heading"></p><div class="xp-scale-field" aria-hidden="true">'+Array.from({length:72},(_,i)=>'<span style="--xp-tile:'+i+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M5 3h9l5 5v13H5V3Zm9 0v5h5M8 12h8M8 16h8"/></svg></span>').join("")+'</div><div class="xp-scale-number" aria-hidden="true"><strong></strong><span></span></div><p class="xp-scale-note"></p><div class="xp-scale-progress" aria-hidden="true"><i></i></div>';
  machine.append(stage);
  let scaleFrame=0,scaleDeadline=0,scaleFade=0,scaleRun=0,scaleProgress=1,scaleReady=false,scaleRunning=false,scaleStart=0,lastPaint=0;
  const isMail=()=>q(".slide-otomail.is-active");
  function paintVolume(progress){
    scaleProgress=progress;
    const formatter=new Intl.NumberFormat(locale()==="tr"?"tr-TR":"en-US"),eased=1-Math.pow(1-progress,2.2);
    numbers.forEach(node=>node.textContent=(node.dataset.approximate==="true"?"~":"")+formatter.format(Math.round(Number(node.dataset.xpVolume)*eased)));
    stage.querySelector(".xp-scale-number strong").textContent=formatter.format(Math.round(53966*eased));
    volumeGrid.style.setProperty("--xp-volume-progress",String(progress));stage.style.setProperty("--xp-volume-progress",String(progress));
  }
  function scaleText(){
    const tr=locale()==="tr";
    stage.querySelector(".xp-scale-heading").textContent=tr?"Otomail · Gönderim ölçeği":"Otomail · Delivery scale";
    stage.querySelector(".xp-scale-number span").textContent=tr?"yıllık rapor gönderimi":"yearly report deliveries";
    stage.querySelector(".xp-scale-note").textContent=tr?"Yaklaşık gönderim hacmi · Ölçek görselleştirmesi":"Approximate delivery volume · Scale visualisation";
    stage.setAttribute("aria-label",tr?"Gönderim ölçeği":"Delivery scale");
    stage.querySelector("button").setAttribute("aria-label",tr?"Ölçek animasyonunu tamamla":"Finish the scale animation");
    q("#volumeReplay").title=tr?"Gönderim ölçeğini yeniden göster":"Replay the delivery scale";
    q("#volumeReplay").setAttribute("aria-label",q("#volumeReplay").title);paintVolume(scaleProgress);
  }
  function finishScale(immediate=false){
    ++scaleRun;cancelAnimationFrame(scaleFrame);clearTimeout(scaleDeadline);clearTimeout(scaleFade);
    scaleRunning=false;scaleReady=false;paintVolume(1);volumeGrid.classList.remove("xp-volume-running");
    const finish=()=>{stage.hidden=true;stage.classList.remove("is-counting","is-leaving");machine.classList.remove("xp-scale-active");};
    if(immediate||motion.matches||stage.hidden)finish();
    else{stage.classList.add("is-leaving");scaleFade=setTimeout(finish,280);}
  }
  function prepareScale(){
    finishScale(true);if(motion.matches||document.hidden)return;
    scaleReady=true;paintVolume(0);
  }
  function startScale(){
    if(!isMail()||scaleRunning||motion.matches||document.hidden||document.querySelector("dialog[open]"))return;
    finishScale(true);scaleReady=false;scaleRunning=true;
    const run=++scaleRun;scaleStart=performance.now();lastPaint=0;paintVolume(0);scaleText();
    stage.hidden=false;machine.classList.add("xp-scale-active");volumeGrid.classList.add("xp-volume-running");
    requestAnimationFrame(()=>{if(run===scaleRun)stage.classList.add("is-counting");});
    function frame(now){
      if(run!==scaleRun)return;
      const progress=Math.min(1,(now-scaleStart)/7000);
      if(now-lastPaint>=40||progress===1){paintVolume(progress);lastPaint=now;}
      if(progress<1)scaleFrame=requestAnimationFrame(frame);else finishScale();
    }
    scaleFrame=requestAnimationFrame(frame);scaleDeadline=setTimeout(()=>finishScale(),7350);
  }
  function syncScale(){
    if(isMail()){
      prepareScale();
      if(q("#chapterTransition").hidden)startScale();
    }else finishScale(true);
  }
  q("#volumeReplay").addEventListener("click",startScale);
  stage.querySelector("button").addEventListener("click",()=>finishScale(true));
  document.addEventListener("presentation:slidewillchange",()=>finishScale(true));
  document.addEventListener("presentation:slidechange",syncScale);
  document.addEventListener("presentation:chapterend",event=>{if(event.detail.index===5&&scaleReady)startScale();});

  const xray=q("#systemXray"),stack=q("#systemXrayStack"),legend=q("#systemXrayLegend"),xrayStage=q(".xp-xray-stage");let xrayTimer=0;
  new ResizeObserver(()=>{
    if(xrayStage.clientWidth>0)xrayStage.style.setProperty("--xp-xray-scale",String(Math.min(.82,xrayStage.clientWidth/620,xrayStage.clientHeight/530)));
  }).observe(xrayStage);
  const layers=[
    {tr:"Aycube ekranları",en:"Aycube screens",copyTr:"Operasyon ve raporların ortak çalışma alanı.",copyEn:"A shared workspace for operations and reporting.",color:"#1264d7",icon:"screen"},
    {tr:"Entegrasyon",en:"Integration",copyTr:"Sistemler arasında kontrollü veri akışı.",copyEn:"Controlled data flow between systems.",color:"#0f9b9c",icon:"tbr"},
    {tr:"Operasyonel veri",en:"Operational data",copyTr:"Dosya, beyanname ve evrak kayıtları.",copyEn:"File, declaration and document records.",color:"#6557c7",icon:"documents"},
    {tr:"Erişim kontrolü",en:"Access control",copyTr:"Yetkilendirilmiş kullanıcılar için kontrollü erişim.",copyEn:"Controlled access for authorised users.",color:"#b48828",icon:"lock"},
    {tr:"İzlenebilirlik",en:"Traceability",copyTr:"İşlem ve teslim kayıtlarıyla takip.",copyEn:"Tracking through transaction and delivery records.",color:"#16466e",icon:"document"}
  ];
  function layerIcon(type){
    if(type==="screen")return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4M5 7h5m-5 4h10"/></svg>';
    if(type==="lock")return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3"/></svg>';
    return romaniaProjectIcon(type);
  }
  function renderXray(){
    stack.innerHTML=layers.map((layer,index)=>'<div class="xp-xray-plate'+(index===0?' xp-xray-screen':'')+'" style="--xp-depth:'+(4-index)+';--xp-layer:'+layer.color+'">'+(index===0?'<img src="assets/aycube_screens/aycube-ana-ekran.png" alt="" decoding="async"/>':'<span>'+layerIcon(layer.icon)+'</span><div class="xp-xray-traces"><i></i><i></i><i></i></div>')+'</div>').reverse().join("");
    legend.innerHTML=layers.map(layer=>'<article style="--xp-layer:'+layer.color+'"><i>'+layerIcon(layer.icon)+'</i><div><h3 data-tr="'+layer.tr+'" data-en="'+layer.en+'">'+layer[locale()]+'</h3><p data-tr="'+layer.copyTr+'" data-en="'+layer.copyEn+'">'+layer[locale()==="tr"?"copyTr":"copyEn"]+'</p></div></article>').join("");
    xrayControls();
  }
  function xrayControls(){
    const expanded=xray.classList.contains("is-exploded"),tr=locale()==="tr",toggle=q("#systemXrayToggle");
    toggle.setAttribute("aria-pressed",String(expanded));
    toggle.querySelector("span").textContent=expanded?(tr?"Katmanları Birleştir":"Bring Layers Together"):(tr?"Katmanları Aç":"Reveal Layers");
    q("#systemXrayClose").setAttribute("aria-label",tr?"Kapat":"Close");
    q("#systemXrayTrigger").title=tr?"Platformun katmanlarını gör":"Explore the platform layers";
  }
  q("#systemXrayTrigger").addEventListener("click",()=>{
    if(xray.open)return;
    clearTimeout(xrayTimer);renderXray();xray.classList.remove("is-exploded");
    openPresentationDialog(xray,q("#systemXrayTrigger"));
    xrayTimer=setTimeout(()=>{if(xray.open){xray.classList.add("is-exploded");xrayControls();}},motion.matches?0:650);
  });
  q("#systemXrayToggle").addEventListener("click",()=>{clearTimeout(xrayTimer);xray.classList.toggle("is-exploded");xrayControls();});
  q("#systemXrayClose").addEventListener("click",()=>closePresentationDialog(xray));
  xray.addEventListener("click",event=>{if(event.target===xray)closePresentationDialog(xray);});
  xray.addEventListener("close",()=>{if(!xray.open){clearTimeout(xrayTimer);xray.classList.remove("is-exploded");}});
  document.addEventListener("presentation:languagechange",()=>{scaleText();xrayControls();});
  document.addEventListener("visibilitychange",()=>{if(document.hidden){finishScale(true);settleMotion();}});
  new MutationObserver(()=>{if(document.querySelector("dialog[open]"))finishScale(true);}).observe(document.body,{subtree:true,attributes:true,attributeFilter:["open"]});
  motion.addEventListener("change",()=>{if(motion.matches){finishScale(true);settleMotion();}});
  scaleText();xrayControls();syncScale();
})();

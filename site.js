'use strict';
(() => {
  document.documentElement.classList.add('js-ready');
  const english = document.documentElement.lang === 'en';
  const translations = {
    '기기의 동작 줄이기 사용 중':'Using Reduce Motion',
    '움직임 다시 켜기':'Resume motion', '움직임 멈추기':'Pause motion',
    '잠깐의 쉼이 지나갔어요. 조금 더 머물러도 괜찮아요.':'Your quiet minute is complete. Stay a little longer if you like.',
    '휴식을 시작했어요. 편안하게 머물러요.':'Your rest has started. Make yourself comfortable.'
  };
  const t = text => english ? translations[text] || text : text;
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  let userPaused = false;
  const motionControls = [...document.querySelectorAll('.motion-control')];
  const greetings = new Map();
  const motionPaused = () => userPaused || motionPreference.matches;
  function clearGreetings() {
    greetings.forEach((timeout, character) => {clearTimeout(timeout); character.classList.remove('greeting');});
    greetings.clear();
  }
  function updateMotion() {
    document.body.classList.toggle('motion-paused', motionPaused());
    motionControls.forEach(button => {
      button.hidden = false;
      button.textContent = motionPreference.matches ? t('기기의 동작 줄이기 사용 중') : userPaused ? t('움직임 다시 켜기') : t('움직임 멈추기');
      button.setAttribute('aria-pressed', String(motionPaused()));
      button.disabled = motionPreference.matches;
    });
  }
  motionControls.forEach(button => button.addEventListener('click', () => {userPaused = !userPaused; updateMotion();}));
  motionPreference.addEventListener('change', updateMotion);
  updateMotion();
  document.querySelectorAll('[data-character]').forEach(character => {
    character.addEventListener('click', () => {
      clearTimeout(greetings.get(character));
      character.classList.remove('greeting');
      void character.offsetWidth;
      character.classList.add('greeting');
      greetings.set(character, setTimeout(() => {character.classList.remove('greeting'); greetings.delete(character);}, 1400));
    });
  });

  const menu = document.querySelector('#site-nav');
  const menuToggle = document.querySelector('.menu-toggle');
  function closeMenu(restoreFocus = false) {
    if (!menuToggle || !menu) return;
    menu.classList.remove('is-open'); menuToggle.setAttribute('aria-expanded', 'false');
    if (restoreFocus) menuToggle.focus();
  }
  if (menuToggle && menu) {
    menuToggle.hidden = false;
    menuToggle.addEventListener('click', () => {
      const open = menuToggle.getAttribute('aria-expanded') !== 'true';
      menuToggle.setAttribute('aria-expanded', String(open)); menu.classList.toggle('is-open', open);
    });
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      const wasOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      closeMenu();
      const href = link.getAttribute('href');
      if (wasOpen && href.startsWith('#')) {
        const destination = document.querySelector(href);
        const heading = destination?.querySelector('h2') || destination;
        if (heading) requestAnimationFrame(() => {heading.tabIndex = -1; heading.focus({preventScroll:true});});
      }
    }));
    menu.addEventListener('keydown', event => {if (event.key === 'Escape') {event.preventDefault(); closeMenu(true);}});
    menuToggle.addEventListener('keydown', event => {if (event.key === 'Escape') closeMenu(true);});
    matchMedia('(min-width: 761px)').addEventListener('change', () => closeMenu());
  }
  document.querySelectorAll('[data-page]').forEach(link => {
    if (link.tagName === 'A' && link.dataset.page === document.body.dataset.page) link.setAttribute('aria-current', 'page');
  });

  function wireTabKeys(tabs, select) {
    tabs.forEach((tab, index) => tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) {event.preventDefault(); select(tabs[next]); tabs[next].focus();}
    }));
  }
  const examples = {
    rest: {symbol:'☁', place:'담요에 담아둔 기억', title:'쉬고 싶어', point:['28%','61%'], lines:['햇볕이 들던 주말 오후.','아무것도 하지 않아도','마음이 편안했던 순간.'], note:'그때의 나처럼, 오늘도 쉬어도 괜찮아요.'},
    encouragement: {symbol:'☼', place:'스탠드에 담아둔 기억', title:'응원이 필요해', point:['70%','50%'], lines:['처음엔 어렵게만 느껴졌던 일.','내 속도로 한 걸음씩 걸어서','결국 해냈던 그날.'], note:'잘 버텨온 나를, 오늘도 기억해요.'},
    connection: {symbol:'♡', place:'머그잔에 담아둔 기억', title:'연결감을 느끼고 싶어', point:['48%','53%'], lines:['별일 없는 날의 짧은 안부.','내 이야기를 끝까지 들어준','그 따뜻한 마음.'], note:'함께했던 온기가, 오늘의 곁에도 있어요.'}
  };
  if (english) {
    Object.assign(examples.rest, {place:'A memory by your blanket',title:'I need rest',lines:['A sunlit weekend afternoon.','Nothing I needed to do.','A moment of feeling at ease.'],note:'You can give yourself that rest today, too.'});
    Object.assign(examples.encouragement, {place:'A memory by your lamp',title:'I need encouragement',lines:['It felt difficult at first.','One small step at my own pace.','The day I finally made it through.'],note:'Remember the you who kept going.'});
    Object.assign(examples.connection, {place:'A memory by your mug',title:'I need connection',lines:['A small hello on an ordinary day.','Someone who listened to the end.','The warmth of being heard.'],note:'That kindness can stay beside you today.'});
  }
  const comfortPanel = document.querySelector('#comfort-panel');
  const comfortTabs = [...document.querySelectorAll('.comfort-options [role="tab"]')];
  const comfortButtons = [...document.querySelectorAll('[data-kind]')];
  const demoCharacter = document.querySelector('.demo-character');
  function selectKind(control, announce = true) {
    const kind = control.dataset.kind;
    const sample = examples[kind];
    if (!sample || !comfortPanel) return;
    comfortButtons.forEach(button => {
      const chosen = button.dataset.kind === kind;
      if (button.getAttribute('role') === 'tab') {button.setAttribute('aria-selected', String(chosen)); button.tabIndex = chosen ? 0 : -1;}
      else button.setAttribute('aria-pressed', String(chosen));
    });
    comfortPanel.setAttribute('aria-labelledby', `tab-${kind}`);
    comfortPanel.querySelector('.memory-symbol').textContent = sample.symbol;
    comfortPanel.querySelector('.memory-date').textContent = sample.place;
    const text = comfortPanel.querySelector('blockquote');
    text.replaceChildren();
    sample.lines.forEach((line, index) => {if (index) text.append(document.createElement('br')); text.append(document.createTextNode(line));});
    comfortPanel.querySelector('.memory-footnote').textContent = sample.note;
    if (demoCharacter) {
      clearTimeout(greetings.get(demoCharacter)); greetings.delete(demoCharacter); demoCharacter.classList.remove('greeting');
      demoCharacter.style.setProperty('--oni-x', sample.point[0]); demoCharacter.style.setProperty('--oni-y', sample.point[1]);
    }
    comfortPanel.classList.remove('changing');
    if (!motionPaused()) {void comfortPanel.offsetWidth; comfortPanel.classList.add('changing');}
    if (announce) document.querySelector('#comfort-announcement').textContent = english ? sample.title + ' — example: ' + sample.place + '.' : `${sample.title} — ${sample.place} 예시를 보여드려요.`;
  }
  comfortButtons.forEach(button => button.addEventListener('click', () => selectKind(button)));
  wireTabKeys(comfortTabs, selectKind);
  if (comfortPanel) comfortPanel.addEventListener('animationend', () => comfortPanel.classList.remove('changing'));

  const deviceTabs = [...document.querySelectorAll('[data-device]')];
  const devicePanels = [...document.querySelectorAll('.device-panel')];
  function selectDevice(tab) {
    deviceTabs.forEach(button => {const chosen = button === tab; button.setAttribute('aria-selected', String(chosen)); button.tabIndex = chosen ? 0 : -1;});
    devicePanels.forEach(panel => {panel.hidden = panel.id !== tab.getAttribute('aria-controls');});
  }
  deviceTabs.forEach(tab => tab.addEventListener('click', () => selectDevice(tab)));
  wireTabKeys(deviceTabs, selectDevice);
  if (deviceTabs.length) selectDevice(deviceTabs[0]);

  const dialog = document.querySelector('#rest-dialog');
  const openRestButtons = [...document.querySelectorAll('[data-open-rest]')];
  const counter = dialog?.querySelector('.rest-counter');
  const restMessage = dialog?.querySelector('#rest-message');
  let restInterval = null;
  let elapsed = 0;
  let lastTick = null;
  let restRunning = false;
  let restTrigger = null;
  function stopRestClock() {clearInterval(restInterval); restInterval = null; lastTick = null;}
  function renderRest() {
    const remaining = Math.max(0, Math.ceil((60000 - elapsed) / 1000));
    counter.textContent = `${String(Math.floor(remaining / 60)).padStart(2,'0')}:${String(remaining % 60).padStart(2,'0')}`;
    if (elapsed >= 60000 && restRunning) {
      restRunning = false; stopRestClock(); dialog.dataset.restState = 'complete';
      restMessage.textContent = t('잠깐의 쉼이 지나갔어요. 조금 더 머물러도 괜찮아요.');
    }
  }
  function tickRest() {
    if (!restRunning || !dialog?.open) return;
    const now = performance.now();
    if (lastTick !== null) elapsed = Math.min(60000, elapsed + Math.max(0, now - lastTick));
    lastTick = now; renderRest();
  }
  function resumeRestClock() {
    if (!restRunning || !dialog.open || document.hidden || document.body.classList.contains('page-unfocused') || restInterval !== null) return;
    lastTick = performance.now(); restInterval = setInterval(tickRest, 200);
  }
  function closeRest() {if (dialog?.open) dialog.close();}
  if (dialog && typeof dialog.showModal === 'function') {
    openRestButtons.forEach(button => {
      button.hidden = false;
      button.addEventListener('click', () => {
        if (dialog.open) return;
        stopRestClock(); elapsed = 0; restRunning = true; restTrigger = button;
        restMessage.textContent = t('휴식을 시작했어요. 편안하게 머물러요.');
        dialog.dataset.restState = 'running'; renderRest(); clearGreetings(); closeMenu();
        dialog.showModal(); document.body.classList.add('rest-open');
        dialog.querySelector('#close-web-rest').focus(); resumeRestClock();
      });
    });
    dialog.querySelector('#close-web-rest').addEventListener('click', closeRest);
    dialog.querySelector('#return-from-rest').addEventListener('click', closeRest);
    dialog.addEventListener('cancel', event => {event.preventDefault(); closeRest();});
    dialog.addEventListener('close', () => {
      restRunning = false; stopRestClock(); document.body.classList.remove('rest-open');
      restTrigger?.focus({preventScroll:true});
    });
    dialog.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      const focusable = [...dialog.querySelectorAll('button:not([disabled]),a[href]')].filter(element => !element.hidden);
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {event.preventDefault(); last.focus();}
      else if (!event.shiftKey && document.activeElement === last) {event.preventDefault(); first.focus();}
    });
  }
  function updateVisibility() {
    document.body.classList.toggle('page-hidden', document.hidden);
    if (document.hidden) {if (restRunning) tickRest(); stopRestClock(); clearGreetings();}
    else if (dialog?.open && restRunning) resumeRestClock();
  }
  document.addEventListener('visibilitychange', updateVisibility);
  window.addEventListener('pagehide', () => {if (restRunning) tickRest(); stopRestClock(); clearGreetings();});
  window.addEventListener('pageshow', updateVisibility);
  window.addEventListener('blur', () => {
    if (restRunning) tickRest();
    stopRestClock(); clearGreetings(); document.body.classList.add('page-unfocused');
  });
  window.addEventListener('focus', () => {
    document.body.classList.remove('page-unfocused'); updateVisibility();
  });
  updateVisibility();

  if ('IntersectionObserver' in window) {
    const scenes = new IntersectionObserver(entries => entries.forEach(entry => {
      entry.target.classList.toggle('scene-paused', !entry.isIntersecting);
      if (!entry.isIntersecting) {
        entry.target.querySelectorAll('[data-character]').forEach(character => {
          clearTimeout(greetings.get(character)); greetings.delete(character); character.classList.remove('greeting');
        });
      }
    }), {threshold:0});
    document.querySelectorAll('[data-scene]').forEach(scene => scenes.observe(scene));
    const reveals = new IntersectionObserver(entries => entries.forEach(entry => {if (entry.isIntersecting) {entry.target.classList.add('entered'); reveals.unobserve(entry.target);}}), {threshold:.08});
    document.querySelectorAll('.section-heading,.steps,.device-panel,.privacy-objects').forEach(section => reveals.observe(section));
    const navLinks = [...document.querySelectorAll('.site-header [data-section]')];
    const sections = [...document.querySelectorAll('[data-nav-section]')];
    const visibleSections = new Set();
    const navigation = new IntersectionObserver(entries => {
      entries.forEach(entry => {if (entry.isIntersecting) visibleSections.add(entry.target.id); else visibleSections.delete(entry.target.id);});
      const active = sections.find(section => visibleSections.has(section.id))?.id;
      navLinks.forEach(link => {if (link.dataset.section === active) link.setAttribute('aria-current','location'); else link.removeAttribute('aria-current');});
    }, {rootMargin:'-15% 0px -55% 0px',threshold:0});
    sections.forEach(section => navigation.observe(section));
    const guideLinks = [...document.querySelectorAll('.guide-nav a')];
    const guideNavigation = new IntersectionObserver(entries => {
      const entry = entries.find(item => item.isIntersecting);
      if (entry) guideLinks.forEach(link => {if (link.getAttribute('href') === `#${entry.target.id}`) link.setAttribute('aria-current','location'); else link.removeAttribute('aria-current');});
    }, {rootMargin:'-15% 0px -60% 0px',threshold:0});
    document.querySelectorAll('.guide-content section[id]').forEach(section => guideNavigation.observe(section));
  }
})();

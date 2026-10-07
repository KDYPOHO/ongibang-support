'use strict';
const examples = {
  rest: {symbol:'☁', place:'담요에 담아둔 기억', text:['햇볕이 들던 주말 오후.','아무것도 하지 않아도','마음이 편안했던 순간.'], note:'그때의 나처럼, 오늘도 쉬어도 괜찮아요.'},
  encouragement: {symbol:'☼', place:'스탠드에 담아둔 기억', text:['처음엔 어렵게만 느껴졌던 일.','내 속도로 한 걸음씩 걸어서','결국 해냈던 그날.'], note:'잘 버텨온 나를, 오늘도 기억해요.'},
  connection: {symbol:'♡', place:'머그잔에 담아둔 기억', text:['별일 없는 날의 짧은 안부.','내 이야기를 끝까지 들어준','그 따뜻한 마음.'], note:'함께했던 온기가, 오늘의 곁에도 있어요.'}
};
const tabs = [...document.querySelectorAll('[data-kind]')];
const panel = document.getElementById('comfort-panel');
function selectKind(tab) {
  const sample = examples[tab.dataset.kind];
  tabs.forEach(item => {item.setAttribute('aria-selected', String(item === tab)); item.tabIndex = item === tab ? 0 : -1;});
  panel.setAttribute('aria-labelledby', tab.id);
  panel.querySelector('.memory-symbol').textContent = sample.symbol;
  panel.querySelector('.memory-date').textContent = sample.place;
  const lines = document.getElementById('example-text');
  lines.replaceChildren();
  sample.text.forEach((line, i) => {if (i) lines.append(document.createElement('br')); lines.append(document.createTextNode(line));});
  document.getElementById('example-note').textContent = sample.note;
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectKind(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) {event.preventDefault(); selectKind(tabs[next]); tabs[next].focus();}
  });
});
const oni = document.querySelector('.oni-button');
const bubble = document.querySelector('.oni-bubble');
let reaction;
if (oni) oni.addEventListener('click', () => {
  clearTimeout(reaction);
  oni.classList.add('greeting'); bubble.classList.add('visible');
  reaction = setTimeout(() => {oni.classList.remove('greeting'); bubble.classList.remove('visible');}, 2300);
});
const animatedSections = document.querySelectorAll('.hero-art, .oni-portrait');
const observer = new IntersectionObserver(entries => entries.forEach(entry => entry.target.classList.toggle('offscreen', !entry.isIntersecting)), {threshold:0});
animatedSections.forEach(section => observer.observe(section));
document.addEventListener('visibilitychange', () => {
  document.body.classList.toggle('offscreen', document.hidden);
  if (document.hidden) {clearTimeout(reaction); oni?.classList.remove('greeting'); bubble?.classList.remove('visible');}
});

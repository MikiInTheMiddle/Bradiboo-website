'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/** Progressive enhancement: content stays visible if JS or IntersectionObserver is unavailable. */
export function HomeReveal({ children }: { children: ReactNode }) {
 const root = useRef<HTMLDivElement>(null);
 useEffect(() => {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const container=root.current?.parentElement;
  if (!container || motion.matches || !('IntersectionObserver' in window)) return;
  const animations = new Map<Element, Animation>();
  const targets: HTMLElement[] = [];
  container.querySelectorAll<HTMLElement>('.wf-block,.watch-rail').forEach(block => {
   if (block.dataset.reveal === 'off') return;
   if (block.querySelector('.wf-items')) {
    block.querySelectorAll<HTMLElement>('.wf-block-content > div:first-child, .wf-module-media, .wf-items > a, .wf-items > article').forEach(el => targets.push(el));
   } else targets.push(block);
  });
  const observer = new IntersectionObserver(entries => {
   entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const animation = animations.get(entry.target);
    animation?.play();
    observer.unobserve(entry.target);
   });
  }, { threshold: 0, rootMargin: '0px 0px -32px 0px' });
  targets.forEach((el, index) => {
   // Do not hide content the visitor has already scrolled past during hydration.
   const rect=el.getBoundingClientRect();
   if (rect.bottom < 0 || rect.top < innerHeight*.8) return;
   const card = el.parentElement?.classList.contains('wf-items');
   const stagger = card ? Array.from(el.parentElement!.children).indexOf(el) % 4 * 45 : 0;
   const animation = el.animate([
    { opacity: 0, translate: `0 ${card?16:22}px` },
    { opacity: 1, translate: '0 0' },
   ], { duration: 650, delay: stagger, easing: 'cubic-bezier(.22,.61,.36,1)', fill: 'both', id: `scroll-reveal-${index}` });
   animation.pause();
   animation.currentTime = 0;
   animation.onfinish = () => animation.cancel();
   animations.set(el, animation);
   observer.observe(el);
  });
  const revealFocus = (event: FocusEvent) => {
   animations.forEach((animation, el) => {
    if (event.target instanceof Node && el.contains(event.target)) { animation.cancel(); observer.unobserve(el); }
   });
  };
  const reduceMotion = () => { if (motion.matches) { observer.disconnect(); animations.forEach(a => a.cancel()); } };
  const current = container;
  current.addEventListener('focusin', revealFocus);
  motion.addEventListener('change', reduceMotion);
  return () => { observer.disconnect(); animations.forEach(a => a.cancel()); current.removeEventListener('focusin', revealFocus); motion.removeEventListener('change', reduceMotion); };
 }, []);
 return <>{children}<div hidden ref={root}/></>;
}

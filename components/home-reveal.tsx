'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/** Progressive enhancement: content stays visible if JS or IntersectionObserver is unavailable. */
export function HomeReveal({ children }: { children: ReactNode }) {
 const root = useRef<HTMLDivElement>(null);
 useEffect(() => {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!root.current || motion.matches || !('IntersectionObserver' in window)) return;
  const animations = new Map<Element, Animation>();
  const targets: HTMLElement[] = [];
  root.current.querySelectorAll<HTMLElement>('.wf-block').forEach(block => {
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
  }, { threshold: 0, rootMargin: '0px 0px -96px 0px' });
  targets.forEach((el, index) => {
   // Do not hide content the visitor has already scrolled past during hydration.
   if (el.getBoundingClientRect().bottom < 0) return;
   const rotation = Math.random() * 4 - 2;
   const card = el.parentElement?.classList.contains('wf-items');
   const stagger = card ? Array.from(el.parentElement!.children).indexOf(el) % 4 * 55 : 0;
   const animation = el.animate([
    { opacity: 0, transform: `translateY(${card ? 24 : 32}px) rotate(${rotation}deg)`, offset: 0 },
    { opacity: 1, transform: `translateY(-4px) rotate(${-rotation * .14}deg)`, offset: .72 },
    { opacity: 1, transform: 'translateY(1px) rotate(0deg)', offset: .9 },
    { opacity: 1, transform: 'translateY(0) rotate(0deg)', offset: 1 },
   ], { duration: 620, delay: 200 + stagger, easing: 'cubic-bezier(.2,.65,.3,1)', fill: 'both', id: `home-reveal-${index}` });
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
  const current = root.current;
  current.addEventListener('focusin', revealFocus);
  motion.addEventListener('change', reduceMotion);
  return () => { observer.disconnect(); animations.forEach(a => a.cancel()); current.removeEventListener('focusin', revealFocus); motion.removeEventListener('change', reduceMotion); };
 }, []);
 return <div ref={root} className="home-reveal">{children}</div>;
}

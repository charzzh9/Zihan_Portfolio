import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

const queries = {
  desktop: '(min-width: 901px)',
  compact: '(max-width: 900px)',
  reduce: '(prefers-reduced-motion: reduce)',
};
const clean = 'transform,opacity,visibility,clipPath,willChange';

export function getMotionDiagnostics() {
  return {
    version: gsap.version,
    triggers: ScrollTrigger.getAll().length,
    activeTweens: gsap.globalTimeline.getChildren(true, true, false).filter(tween => tween.isActive()).length,
  };
}

function addTitle(timeline, title, at = 0, compact = false) {
  const words = title.querySelectorAll('.motion-word');
  timeline.fromTo(words, {
    yPercent: 135, x: compact ? -24 : -58, scaleX: 0.66, rotation: 3,
    transformOrigin: '0% 100%',
  }, {
    yPercent: 0, x: 0, scaleX: 1, rotation: 0,
    duration: 1.65, stagger: 0.085, ease: 'expo.out',
  }, at);
  return words;
}

// Each effect owns its timelines and triggers, including React Strict Mode cleanup.
export default function usePortfolioMotion(rootRef, language, filter) {
  const openingComplete = useRef(false);
  const registry = useRef(new Map());
  const headings = useRef(new Map());

  useLayoutEffect(() => {
    const root = rootRef.current;
    const mm = gsap.matchMedia();
    let cancelled = false;
    const q = selector => root.querySelector(selector);
    const qa = selector => [...root.querySelectorAll(selector)];
    registry.current.clear();
    headings.current.clear();

    mm.add(queries, context => {
      const { compact, reduce } = context.conditions;
      let active = true;
      registry.current.clear();
      headings.current.clear();
      root.dataset.motion = reduce ? 'reduced' : 'enhanced';
      if (reduce) {
        root.dataset.opening = 'complete';
        root.dataset.motionReady = 'true';
        openingComplete.current = true;
        return;
      }

      function sequence(element, build, start = 'top 85%') {
        element.dataset.motionState = 'pending';
        const timeline = gsap.timeline({
          paused: true,
          onStart: () => { element.dataset.motionState = 'entering'; },
          onComplete: () => { timeline.pause(); element.dataset.motionState = 'complete'; },
        });
        build(timeline);
        registry.current.set(element, timeline);
        ScrollTrigger.create({
          trigger: element, start, end: 'bottom top', once: true,
          onEnter: () => { if (element.dataset.motionState !== 'complete') timeline.play(); },
          onLeave: () => timeline.progress(1).pause(),
        });
        if (element.getBoundingClientRect().bottom <= 0) timeline.progress(1).pause();
        return timeline;
      }

      const hero = q('.hero');
      const atTop = window.scrollY < 32 && (!window.location.hash || window.location.hash === '#top');
      let opening;
      const interruptOpening = () => {
        if (window.scrollY > 80 && opening && !openingComplete.current) opening.progress(1);
      };
      if (!openingComplete.current && atTop) {
        root.dataset.opening = 'playing';
        const panels = qa('.opening-panel');
        const header = qa('.wordmark,.desktop-nav,.header-actions');
        const title = qa('.hero-title .motion-word');
        const statement = qa('.hero-statement .motion-word');
        const support = qa('.hero-intro>p,.hero-intro>.button,.hero-coordinate,.hero-bottom');
        opening = gsap.timeline({
          paused: true,
          onComplete: () => {
            openingComplete.current = true;
            root.dataset.opening = 'complete';
            window.removeEventListener('scroll', interruptOpening);
          },
        });
        opening.set(q('.hero-curtain'), { autoAlpha: 1 }, 0)
          .fromTo(panels, { scaleY: 1 }, { scaleY: 0, duration: 1.6, stagger: 0.15, ease: 'expo.inOut' }, 0.05)
          .fromTo(q('.hero-film video'), { scale: 1.22, clipPath: 'inset(15% 24% 15% 24%)' }, { scale: 1, clipPath: 'inset(0% 0% 0% 0%)', duration: 2.65, ease: 'power4.out' }, 0.28)
          .fromTo(header, { y: -25, opacity: 0 }, { y: 0, opacity: 1, duration: 1.15, stagger: 0.09, ease: 'power3.out' }, 0.48)
          .fromTo(q('.hero-kicker'), { x: -24, opacity: 0 }, { x: 0, opacity: 1, duration: 1.25, ease: 'power3.out' }, 0.6)
          .fromTo(title, { yPercent: 140, x: 58, scaleX: 0.54, scaleY: 1.15, rotation: 4, transformOrigin: '0% 100%' }, { yPercent: 0, x: 0, scaleX: 1, scaleY: 1, rotation: 0, duration: 1.95, stagger: 0.18, ease: 'expo.out' }, 0.64)
          .fromTo(statement, { yPercent: 125, x: 20, scaleX: 0.82, rotation: 2 }, { yPercent: 0, x: 0, scaleX: 1, rotation: 0, duration: 1.65, stagger: 0.055, ease: 'expo.out' }, 1.08)
          .fromTo(q('.hero-intro>p'), { y: 35, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out' }, 1.52)
          .fromTo(q('.hero-intro>.button'), { y: 28, clipPath: 'inset(100% 0% 0% 0%)' }, { y: 0, clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.out' }, 1.7)
          .fromTo(q('.hero-coordinate'), { x: 35, opacity: 0 }, { x: 0, opacity: 1, duration: 1.25, ease: 'power3.out' }, 1.85)
          .fromTo(q('.hero-bottom'), { y: 22, clipPath: 'inset(0% 100% 0% 0%)' }, { y: 0, clipPath: 'inset(0% 0% 0% 0%)', duration: 1.45, ease: 'expo.inOut' }, 1.93)
          .set([...header, ...title, ...statement, ...support, q('.hero-kicker'), q('.hero-film video')], { clearProps: clean })
          .set(q('.hero-curtain'), { autoAlpha: 0 });
        registry.current.set(hero, opening);
        document.fonts.ready.then(() => {
          if (!cancelled && active && !openingComplete.current) opening.play();
        });
      } else {
        openingComplete.current = true;
        root.dataset.opening = 'complete';
      }

      const about = q('.about-layout');
      sequence(about, timeline => {
        const words = addTitle(timeline, q('.about-copy [data-motion-title]'), 0, compact);
        const art = q('.profile-art');
        const details = qa('.about-copy>p,.about-social');
        timeline.fromTo(art, { y: compact ? 65 : 100, scale: 0.89, rotation: -2.5, opacity: 0 }, { y: 0, scale: 1, rotation: 0, opacity: 1, duration: 1.8, ease: 'expo.out' }, 0.65)
          .fromTo(q('.profile-initials'), { x: -38, scaleX: 0.75 }, { x: 0, scaleX: 1, duration: 1.7, ease: 'expo.out' }, 0.87)
          .fromTo(q('.profile-art-bottom img'), { scale: 0.55, clipPath: 'circle(0% at 50% 50%)' }, { scale: 1, clipPath: 'circle(50% at 50% 50%)', duration: 1.4, ease: 'expo.out' }, 1.02)
          .fromTo(details, { y: 38, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, stagger: 0.13, ease: 'power3.out' }, 0.86)
          .set([...words, art, q('.profile-initials'), q('.profile-art-bottom img'), ...details], { clearProps: clean });
      });

      sequence(q('.stats'), timeline => {
        const items = qa('.stats>div');
        timeline.fromTo(items, { yPercent: 105 }, { yPercent: 0, duration: 1.35, stagger: 0.14, ease: 'expo.out' })
          .set(items, { clearProps: clean });
      });
      sequence(q('.experience-layout'), timeline => {
        const tabs = qa('.experience-tabs button');
        const items = qa('.timeline-item');
        timeline.fromTo(tabs, { x: -35, opacity: 0 }, { x: 0, opacity: 1, duration: 1.1, stagger: 0.1, ease: 'power3.out' })
          .fromTo(items, { x: 50, y: 25, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 1.35, stagger: 0.18, ease: 'power4.out' }, 0.2)
          .set([...tabs, ...items], { clearProps: clean });
      });

      for (const id of ['work', 'approach']) {
        const section = q(`#${id}`);
        const header = section.querySelector('.section-heading');
        const timeline = sequence(header, motion => {
          const words = addTitle(motion, header.querySelector('[data-motion-title]'), 0.05, compact);
          const label = section.querySelector('.section-label');
          const description = header.querySelector('p');
          motion.fromTo(label, { x: -28, opacity: 0 }, { x: 0, opacity: 1, duration: 1.15, ease: 'power3.out' }, 0)
            .fromTo(description, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.3, ease: 'power3.out' }, 0.7)
            .set([...words, label, description], { clearProps: clean });
        });
        headings.current.set(id, timeline);
      }

      const skillCards = qa('.skill-card');
      const skillTimelines = new Map();
      for (const card of skillCards) {
        card.dataset.motionState = 'pending';
        const slot = card.parentElement;
        slot.dataset.motionState = 'pending';
        const timeline = gsap.timeline({
          paused: true,
          onStart: () => { card.dataset.motionState = slot.dataset.motionState = 'entering'; },
          onComplete: () => { timeline.pause(); card.dataset.motionState = slot.dataset.motionState = 'complete'; },
        });
        timeline.fromTo(card, { y: compact ? 65 : 110, scale: 0.9, rotation: 1.5, opacity: 0 }, { y: 0, scale: 1, rotation: 0, opacity: 1, duration: 1.65, ease: 'expo.out' })
          .set(card, { clearProps: clean });
        registry.current.set(card, timeline);
        skillTimelines.set(card, timeline);
      }
      ScrollTrigger.batch(skillCards.map(card => card.parentElement), {
        start: 'top 88%', end: 'bottom top', once: true, interval: 0.12,
        batchMax: compact ? 2 : 4,
        onEnter: batch => {
          const lead = Math.max(0, 1.3 - (headings.current.get('approach')?.time() ?? 1.3));
          batch.map(slot => slot.querySelector('.skill-card')).filter(card => card.dataset.motionState !== 'complete').forEach((card, i) => skillTimelines.get(card).delay(lead + i * 0.18).restart(true));
        },
        onLeave: batch => batch.forEach(slot => skillTimelines.get(slot.querySelector('.skill-card')).progress(1).pause()),
      });

      sequence(q('.tools-row'), timeline => {
        const items = qa('.tools-row>span,.tools-row>div>span');
        timeline.fromTo(items, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.055, ease: 'power3.out' })
          .set(items, { clearProps: clean });
      });
      sequence(q('.contact-inner'), timeline => {
        const words = addTitle(timeline, q('.contact-title'), 0.15, compact);
        const details = qa('.contact-topline>span:first-child,.contact-main,.contact-address,.site-footer');
        timeline.fromTo(q('.contact-star'), { rotation: -30, scale: 0.5, x: 35 }, { rotation: 0, scale: 1, x: 0, duration: 1.9, ease: 'expo.out' }, 0.45)
          .fromTo(details, { y: 45, opacity: 0 }, { y: 0, opacity: 1, duration: 1.45, stagger: 0.16, ease: 'power3.out' }, 0.95)
          .set([...words, q('.contact-star'), ...details], { clearProps: clean });
      }, 'top 88%');

      if (!compact) {
        gsap.fromTo(q('.hero-film'), { yPercent: 0 }, {
          yPercent: 8, ease: 'none',
          scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.8 },
        });
      }
      root.dataset.motionReady = 'true';
      const refresh = () => { if (!cancelled && active) ScrollTrigger.refresh(); };
      document.fonts.ready.then(refresh);
      if (opening && !openingComplete.current) window.addEventListener('scroll', interruptOpening, { passive: true });
      return () => { active = false; window.removeEventListener('scroll', interruptOpening); };
    }, rootRef);

    const showFocusedContent = event => {
      registry.current.forEach((timeline, element) => {
        if (element.contains(event.target)) timeline.progress(1).pause();
      });
    };
    root.addEventListener('focusin', showFocusedContent);
    return () => {
      cancelled = true;
      root.removeEventListener('focusin', showFocusedContent);
      mm.revert();
      registry.current.clear();
      headings.current.clear();
    };
  }, [language, rootRef]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const cards = [...root.querySelectorAll('.project-card')];
    const mm = gsap.matchMedia();
    const owned = new Map();
    mm.add(queries, context => {
      const { compact, reduce } = context.conditions;
      if (reduce) return;
      const timelines = new Map();
      for (const card of cards) {
        card.dataset.motionState = 'pending';
        const surface = card.querySelector('.project-card-button');
        const curtain = card.querySelector('.image-curtain');
        const image = card.querySelector('.cover-image-reveal');
        const info = card.querySelector('.project-info');
        const timeline = gsap.timeline({
          paused: true,
          onStart: () => { card.dataset.motionState = 'entering'; },
          onComplete: () => { timeline.pause(); card.dataset.motionState = 'complete'; },
        });
        timeline.fromTo(surface, { y: compact ? 65 : 110, scale: 0.92, rotation: 1.8, opacity: 0 }, { y: 0, scale: 1, rotation: 0, opacity: 1, duration: 1.65, ease: 'expo.out' }, 0)
          .fromTo(curtain, { scaleX: 1 }, { scaleX: 0, duration: 1.45, ease: 'expo.inOut' }, 0.18)
          .fromTo(image, { scale: 1.16, y: 28 }, { scale: 1, y: 0, duration: 1.8, ease: 'power4.out' }, 0.16)
          .fromTo(info, { y: 32, opacity: 0 }, { y: 0, opacity: 1, duration: 1.25, ease: 'power3.out' }, 0.45)
          .set([surface, curtain, image, info], { clearProps: clean });
        timelines.set(card, timeline);
        registry.current.set(card, timeline);
        owned.set(card, timeline);
        if (!compact) {
          gsap.fromTo(card.querySelector('.image-parallax'), { yPercent: 3 }, {
            yPercent: -3, ease: 'none',
            scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: 0.85 },
          });
        }
        if (card.getBoundingClientRect().bottom <= 0) timeline.progress(1).pause();
      }
      ScrollTrigger.batch(cards, {
        start: 'top 88%', end: 'bottom top', once: true, interval: 0.14,
        batchMax: compact ? 1 : 2,
        onEnter: batch => {
          const lead = Math.max(0, 1.3 - (headings.current.get('work')?.time() ?? 1.3));
          batch.filter(card => card.dataset.motionState !== 'complete').forEach((card, i) => timelines.get(card).delay(lead + i * 0.23).restart(true));
        },
        onLeave: batch => batch.forEach(card => timelines.get(card).progress(1).pause()),
      });
      ScrollTrigger.refresh();
    }, rootRef);
    return () => {
      mm.revert();
      owned.forEach((timeline, card) => {
        if (registry.current.get(card) === timeline) registry.current.delete(card);
      });
    };
  }, [filter, language, rootRef]);
}

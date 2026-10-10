import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ArrowDown, ArrowUp, Github, Linkedin, Mail, Copy, Check, Menu, X, Pause, Play, Workflow, ScanLine, FlaskConical, Lightbulb, Plus, Minus } from 'lucide-react';
import { copy, profile, projects } from './data';
import MotionTitle from './MotionTitle';
import usePortfolioMotion from './usePortfolioMotion';
import ProjectEvidence from './ProjectEvidence';
import ResponsiveImage from './ResponsiveImage';

const ids = ['about', 'work', 'approach'];
const categories = ['all', 'ai', 'vision', 'quant', 'innovation'];
const skillIcons = [Workflow, FlaskConical, ScanLine, Lightbulb];
const tools = ['Python', 'PyTorch', 'SQL', 'Hugging Face', 'Milvus', 'scikit-learn', 'Gradio', 'Docker', 'Git'];

function initialLanguage() {
  try { return localStorage.getItem('zihan-language') === 'zh' ? 'zh' : 'en'; }
  catch { return 'en'; }
}

function automaticVideoAllowed() {
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches && !navigator.connection?.saveData && !/^(slow-)?2g$/.test(navigator.connection?.effectiveType || '');
}

function ExternalLink({ href, children, className = '', label }) {
  return <a href={href} target="_blank" rel="noreferrer" className={className} aria-label={label}>{children}</a>;
}

function SectionLabel({ children }) {
  return <div className="section-label"><span className="tiny-cross" aria-hidden="true">+</span>{children}</div>;
}

function ProjectCover({ project, language }) {
  const detail = project[language];
  return <div className={`project-cover cover-${project.accent}`}>
    <div className="cover-meta"><span>{detail.type.split(' · ')[0]}</span><span>{project.year}</span></div>
    <div className={`cover-visual visual-${project.id}`}>
      <div className="cover-image-window">
        <div className="cover-image-reveal"><div className="image-parallax"><ResponsiveImage src={project.image} sizes="(max-width: 700px) calc(100vw - 78px), (max-width: 900px) calc((100vw - 122px) / 2), (max-width: 1200px) calc((100vw - 146px) / 2), (max-width: 1812px) calc((100vw - 178px) / 2), 800px" alt={detail.imageAlt || `${project.title} — ${detail.tagline}`} loading="lazy" /></div></div>
        <span className="image-curtain" aria-hidden="true" />
      </div>
    </div>
    <div className="cover-caption">
      <span>{detail.coverCaption || (project.id === 'dreamnest' ? (language === 'en' ? 'COMPETITION CONCEPT' : '比赛概念') : project.title)}</span>
      <span className="project-open"><ArrowUpRight size={24} aria-hidden="true" /></span>
    </div>
  </div>;
}

function ProjectModal({ project, language, onClose, c }) {
  const dialog = useRef(null);
  const detail = project[language];
  const [showFigure, setShowFigure] = useState(false);
  useEffect(() => {
    const node = dialog.current;
    node.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleCancel = event => { event.preventDefault(); onClose(); };
    node.addEventListener('cancel', handleCancel);
    return () => {
      node.removeEventListener('cancel', handleCancel);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return <dialog ref={dialog} className="project-dialog" aria-labelledby="project-title" onClick={event => {
    if (event.target === dialog.current) {
      const r = dialog.current.getBoundingClientRect();
      if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) onClose();
    }
  }}>
    <button className="icon-button dialog-close" title={c.closeProject} aria-label={c.closeProject} onClick={onClose}><X size={22} /></button>
    <div className="dialog-header">
      <p className="eyebrow">{project.number} / {detail.type}</p>
      <h2 id="project-title">{project.title}</h2>
      <p className="dialog-tagline">{detail.tagline}</p>
      <p className="publication-status"><span />{detail.status}</p>
    </div>
    <ResponsiveImage className={`dialog-main-image dialog-image-${project.id}`} src={project.image} sizes="(max-width: 700px) calc(100vw - 54px), (max-width: 1000px) calc(100vw - 116px), 884px" alt={detail.imageAlt || `${project.title} — ${detail.tagline}`} />
    <div className="dialog-content">
      <div className="dialog-role"><div><span>{c.role}</span><p>{detail.role}</p></div><div><span>{c.period}</span><p>{detail.period}</p></div></div>
      <p className="dialog-summary">{detail.summary}</p>
      <div className="dialog-metrics">{project.metrics.map(metric => <div key={metric.value}><strong>{metric.value}</strong><span>{metric[language]}</span></div>)}</div>
      <div className="case-section"><span>01</span><div><h3>{detail.problemTitle || c.problem}</h3><p>{detail.problem}</p></div></div>
      <div className="case-section"><span>02</span><div><h3>{c.contribution}</h3><ul>{detail.contribution.map(item => <li key={item}>{item}</li>)}</ul></div></div>
      <div className="case-section"><span>03</span><div><h3>{detail.methodTitle || c.method}</h3><ul>{detail.method.map(item => <li key={item}>{item}</li>)}</ul></div></div>
      <div className="case-section"><span>04</span><div><h3>{c.context}</h3><p>{detail.context}</p></div></div>
      <div className="case-section"><span>05</span><div><h3>{c.next}</h3><p>{detail.next}</p></div></div>
      {project.figure && <div className="figure-disclosure"><button onClick={() => setShowFigure(value => !value)} aria-expanded={showFigure} aria-controls="project-figure"><span>{c.figure}</span>{showFigure ? <Minus size={20} /> : <Plus size={20} />}</button>{showFigure && <ResponsiveImage id="project-figure" src={project.figure} sizes="(max-width: 700px) calc(100vw - 70px), 852px" alt={`${project.title} · ${c.figure}`} />}</div>}
      {project.video && <>{detail.videoNote && <p className="evidence-note">{detail.videoNote}</p>}<video className="concept-video" src={project.video} width={project.videoDimensions.width} height={project.videoDimensions.height} style={{ aspectRatio: `${project.videoDimensions.width} / ${project.videoDimensions.height}` }} controls preload="none" poster={project.videoPoster || project.image} aria-label={detail.videoLabel || 'Meng Xiang Jia competition concept animation'} /></>}
      <ProjectEvidence project={project} language={language} c={c} />
      <div className="dialog-links">{project.github && <ExternalLink href={project.github} className="button primary">{c.code}<Github size={18} /></ExternalLink>}{project.resource && <ExternalLink href={project.resource} className="button secondary">{c.resource}<ArrowUpRight size={18} /></ExternalLink>}</div>
    </div>
  </dialog>;
}

export default function App() {
  const [language, setLanguage] = useState(initialLanguage);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [filter, setFilter] = useState('all');
  const [tab, setTab] = useState(0);
  const [activeProject, setActiveProject] = useState(null);
  const [playing, setPlaying] = useState(automaticVideoAllowed);
  const [copyStatus, setCopyStatus] = useState('');
  const [activeNav, setActiveNav] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const video = useRef(null);
  const projectTrigger = useRef(null);
  const menuTrigger = useRef(null);
  const copyTimer = useRef(null);
  const root = useRef(null);
  const c = copy[language];
  const filtered = projects.filter(project => filter === 'all' || project.category === filter);
  const stats = [projects.filter(project => ['ai', 'vision', 'quant'].includes(project.category)).length, 2, projects.filter(project => project.category === 'innovation').length, c.timeline.experience.length];
  usePortfolioMotion(root, language, filter);

  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    try { localStorage.setItem('zihan-language', language); }
    catch { /* Language switching remains usable when browser storage is blocked. */ }
  }, [language]);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || hash === '#top') return;
    let cancelled = false;
    let frame;
    document.fonts.ready.then(() => {
      if (cancelled || window.location.hash !== hash) return;
      frame = requestAnimationFrame(() => {
        document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start', behavior: 'instant' });
      });
    });
    return () => { cancelled = true; cancelAnimationFrame(frame); };
  }, []);

  useEffect(() => {
    let previousScrolled = false;
    const handleScroll = () => {
      const next = window.scrollY > 30;
      if (next !== previousScrolled) { previousScrolled = next; setScrolled(next); }
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) setActiveNav(entry.target.id);
    }), { rootMargin: '-20% 0px -65% 0px' });
    [...ids, 'contact'].forEach(id => observer.observe(document.getElementById(id)));
    return () => { window.removeEventListener('scroll', handleScroll); observer.disconnect(); clearTimeout(copyTimer.current); };
  }, []);

  useEffect(() => {
    const film = video.current;
    if (!film) return;
    const hero = document.getElementById('top');
    let ready = false;
    let disposed = false;
    let pending = null;
    let frame;
    const idle = typeof window.requestIdleCallback === 'function';
    const cancelPending = () => {
      if (pending !== null) {
        if (idle) window.cancelIdleCallback(pending);
        else clearTimeout(pending);
        pending = null;
      }
    };
    const canPlay = () => {
      const rect = hero.getBoundingClientRect();
      return ready && playing && rect.bottom > 0 && rect.top < innerHeight && !document.hidden;
    };
    const start = () => {
      pending = null;
      if (disposed || !canPlay()) return;
      if (!film.getAttribute('src')) {
        film.src = window.matchMedia('(max-width: 900px)').matches ? '/assets/hero-motion-mobile.mp4' : '/assets/hero-motion.mp4';
        film.load();
      }
      film.play().catch(error => { if (!disposed && error.name !== 'AbortError') setPlaying(false); });
    };
    const update = () => {
      if (!canPlay()) { cancelPending(); film.pause(); }
      else if (film.getAttribute('src')) start();
      else if (pending === null) pending = idle ? window.requestIdleCallback(start, { timeout: 1200 }) : setTimeout(start, 100);
    };
    const observer = new IntersectionObserver(update);
    observer.observe(hero);
    document.addEventListener('visibilitychange', update);
    // Wait for the text and any deep-link navigation before fetching decorative video.
    document.fonts.ready.then(() => {
      if (!disposed) frame = requestAnimationFrame(() => { ready = true; update(); });
    });
    return () => { disposed = true; cancelPending(); cancelAnimationFrame(frame); film.pause(); observer.disconnect(); document.removeEventListener('visibilitychange', update); };
  }, [playing]);

  useEffect(() => {
    if (!mobileMenu) return;
    const onEscape = event => {
      if (event.key === 'Escape') { setMobileMenu(false); menuTrigger.current?.focus(); }
    };
    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, [mobileMenu]);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection = navigator.connection;
    const update = () => setPlaying(automaticVideoAllowed());
    preference.addEventListener('change', update);
    connection?.addEventListener('change', update);
    return () => { preference.removeEventListener('change', update); connection?.removeEventListener('change', update); };
  }, []);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('failed');
    }
    clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopyStatus(''), 2800);
  }

  function openProject(project, event) {
    projectTrigger.current = event.currentTarget;
    setActiveProject(project);
  }

  const closeProject = useCallback(() => {
    setActiveProject(null);
    requestAnimationFrame(() => projectTrigger.current?.focus());
  }, []);

  function navigateBackground(event, index) {
    const steps = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    let next;
    if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = c.tabs.length - 1;
    else if (steps[event.key]) next = (index + steps[event.key] + c.tabs.length) % c.tabs.length;
    else return;
    event.preventDefault();
    setTab(next);
    document.getElementById(`tab-${next}`)?.focus();
  }

  return <div className="portfolio" ref={root}>
    <a className="skip-link" href="#work">{c.workTitle}</a>
    <header className={`site-header ${scrolled ? 'header-scrolled' : ''}`}>
      <div className="header-inner container">
        <a className="wordmark" href="#top" aria-label="Zihan Zhu, home"><span className="brand-symbol">Z.</span><span>zihan zhu<span className="brand-sub">AI & DATA SCIENCE</span></span></a>
        <nav className="desktop-nav" aria-label="Main navigation">{c.nav.map((label, index) => <a className={activeNav === ids[index] ? 'active' : ''} href={`#${ids[index]}`} key={ids[index]}>{label}</a>)}</nav>
        <div className="header-actions">
          <div className="language-switch" role="group" aria-label="Language"><button className={language === 'en' ? 'selected' : ''} onClick={() => setLanguage('en')} aria-pressed={language === 'en'}>EN</button><span>/</span><button className={language === 'zh' ? 'selected' : ''} onClick={() => setLanguage('zh')} aria-pressed={language === 'zh'}>中</button></div>
          <a className="header-contact" href="#contact">{c.contact}<ArrowUpRight size={17} /></a>
          <button ref={menuTrigger} className="icon-button mobile-menu-toggle" title={mobileMenu ? c.close : c.menu} aria-label={mobileMenu ? c.close : c.menu} aria-expanded={mobileMenu} aria-controls="mobile-navigation" onClick={() => setMobileMenu(value => !value)}>{mobileMenu ? <X size={22} /> : <Menu size={22} />}</button>
        </div>
      </div>
      {mobileMenu && <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation">{[...c.nav, c.contact].map((label, index) => <a href={`#${[...ids, 'contact'][index]}`} onClick={() => setMobileMenu(false)} key={label}>{label}<ArrowUpRight size={21} /></a>)}</nav>}
    </header>

    <main>
      <section className="hero" id="top">
        <div className="hero-film" aria-hidden="true"><video ref={video} muted playsInline loop preload="none" width="1600" height="900" poster="/assets/hero-poster.webp" onError={() => setPlaying(false)} /></div>
        <div className="hero-curtain" aria-hidden="true"><span className="opening-panel" /><span className="opening-panel" /></div>
        <div className="hero-inner container">
          <div className="hero-kicker"><span><span className="status-dot" />{c.heroLabel}</span><span>SELECTED PORTFOLIO / 2026</span></div>
          <MotionTitle as="h1" className="hero-title" text="Zihan Zhu." hero />
          <div className="hero-intro"><MotionTitle className="hero-statement" text={`${c.heroLine}\n${c.heroLine2}`} /><p>{c.heroDescription}</p><a className="button primary" href="#work">{c.heroCta}<ArrowUpRight size={21} /></a></div>
          <div className="hero-coordinate" aria-hidden="true"><span className="crosshair">+</span><span>RESEARCH<br />TO REAL-WORLD<br />POSSIBILITIES</span></div>
          <div className="hero-bottom"><div className="hero-person"><span className="hero-index">01 — {String(projects.length).padStart(2, '0')}</span><span>{c.heroMeta}<small>{c.heroLocation}</small></span></div><a className="scroll-link" href="#about"><span>{c.heroScroll}</span><span className="circle-arrow"><ArrowDown size={22} /></span></a><button className="motion-toggle" title={playing ? c.pause : c.play} aria-label={playing ? c.pause : c.play} aria-pressed={playing} onClick={() => setPlaying(value => !value)}>{playing ? <Pause size={16} /> : <Play size={16} />}<span>{c.motion}</span></button></div>
        </div>
      </section>

      <section className="about section-pad" id="about">
        <div className="container">
          <SectionLabel>{c.aboutLabel}</SectionLabel>
          <div className="about-layout">
            <div className="profile-art">
              <div className="profile-art-top"><span>{c.profileLabel}</span><ArrowUpRight size={21} /></div>
              <span className="profile-initials" aria-hidden="true">Z<br /><span>Z.</span></span>
              <div className="profile-art-bottom"><ResponsiveImage src="/assets/profile.jpg" sizes="(max-width: 700px) 52px, (max-width: 900px) 56px, 64px" alt={c.avatarCaption} loading="lazy" /><div><strong>{profile.name}</strong><span>{profile.chineseName} / charzzh9</span></div></div>
            </div>
            <div className="about-copy"><MotionTitle className="section-title" text={c.aboutTitle} /><p>{c.aboutDescription}</p><p>{c.aboutDescription2}</p><div className="about-social"><a href={`mailto:${profile.email}`} className="text-link"><Mail size={17} />Email<ArrowUpRight size={15} /></a><ExternalLink href={profile.github} className="text-link"><Github size={17} />GitHub<ArrowUpRight size={15} /></ExternalLink><ExternalLink href={profile.linkedin} className="text-link"><Linkedin size={17} />LinkedIn<ArrowUpRight size={15} /></ExternalLink></div></div>
          </div>
          <div className="stats">{stats.map((value, index) => <div key={index}><span className="stat-index">0{index + 1}</span><strong>{String(value).padStart(2, '0')}</strong><span>{c.statLabels[index]}</span></div>)}</div>
          <div className="experience-layout"><div className="experience-tabs" role="tablist" aria-label="Background">{c.tabs.map((label, index) => <button key={index} role="tab" id={`tab-${index}`} aria-controls="background-panel" aria-selected={tab === index} tabIndex={tab === index ? 0 : -1} onKeyDown={event => navigateBackground(event, index)} onClick={() => setTab(index)} className={tab === index ? 'selected' : ''}>{label}<ArrowUpRight size={18} /></button>)}</div><div className="timeline" id="background-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} tabIndex={0}>{c.timeline[['experience', 'education', 'recognition'][tab]].map(item => <div className="timeline-item" key={item.company + item.date}><span className="timeline-date">{item.date}</span><div><h3>{item.company}</h3><h4>{item.title}</h4><p>{item.text}</p></div></div>)}</div></div>
        </div>
      </section>

      <section className="work section-pad" id="work">
        <div className="container"><SectionLabel>{c.workLabel}</SectionLabel><div className="section-heading"><MotionTitle className="section-title" text={c.workTitle} /><p>{c.workDescription}</p></div><div className="work-toolbar"><div className="project-filters" role="group" aria-label="Project categories">{categories.map((category, index) => <button key={category} className={filter === category ? 'selected' : ''} aria-pressed={filter === category} onClick={() => setFilter(category)}>{c.filters[index]}{category === 'all' && <span>{projects.length.toString().padStart(2, '0')}</span>}</button>)}</div><span className="work-count" aria-live="polite">{String(filtered.length).padStart(2, '0')} {c.projectCount}</span></div><div className="project-grid">{filtered.map(project => <article className="project-card" key={project.id}><button className="project-card-button" onClick={event => openProject(project, event)} aria-label={`${c.viewProject}: ${project.title}`} aria-describedby={`project-summary-${project.id}`}><ProjectCover project={project} language={language} /><div className="project-info"><div className="project-title-row"><h3>{project.title}</h3><span>{project.number}</span></div><p id={`project-summary-${project.id}`}>{project[language].cardSummary}</p><div className="project-credential">{project[language].cardOutcome}</div><div className="project-tags">{project.tags.slice(0, 3).map(tag => <span key={tag}>{tag}</span>)}</div></div></button></article>)}</div></div>
      </section>

      <section className="approach section-pad" id="approach">
        <div className="container"><SectionLabel>{c.approachLabel}</SectionLabel><div className="section-heading"><MotionTitle className="section-title" text={c.approachTitle} /><p>{c.approachDescription}</p></div><div className="skill-grid">{c.approachCards.map((skill, index) => { const Icon = skillIcons[index]; return <div className="skill-slot" key={index}><article className="skill-card"><div className="skill-card-top"><Icon size={28} strokeWidth={1.4} /><span>0{index + 1}</span></div><h3>{skill.title}</h3><p>{skill.text}</p><div className="skill-evidence">{skill.evidence}</div></article></div>; })}</div><div className="tools-row"><span>{c.toolLabel}</span><div>{tools.map(tool => <span key={tool}>{tool}</span>)}</div></div></div>
      </section>

      <section className="contact" id="contact"><div className="contact-inner container"><SectionLabel>{c.contactLabel}</SectionLabel><div className="contact-topline"><span>OPEN TO CONVERSATION</span><span className="contact-star" aria-hidden="true"><ArrowUpRight width="1em" height="1em" strokeWidth={.8} /></span></div><MotionTitle className="contact-title" text={c.contactTitle} /><div className="contact-main"><p>{c.contactDescription}</p><a className="contact-cta" href={`mailto:${profile.email}`}>{c.email}<ArrowUpRight size={34} /></a></div><div className="contact-address"><a href={`mailto:${profile.email}`}>{profile.email}</a><button className="icon-button" title={copyStatus === 'copied' ? c.copied : c.copyEmail} aria-label={c.copyEmail} onClick={copyEmail}>{copyStatus === 'copied' ? <Check size={21} /> : <Copy size={21} />}</button><span className="copy-feedback" aria-live="polite">{copyStatus ? c[copyStatus === 'copied' ? 'copied' : 'copyFailed'] : ''}</span></div><footer className="site-footer"><a className="footer-name" href="#top">ZIHAN ZHU<span>© 2026</span></a><div><ExternalLink href={profile.github}>GitHub<ArrowUpRight size={15} /></ExternalLink><ExternalLink href={profile.linkedin}>LinkedIn<ArrowUpRight size={15} /></ExternalLink></div><a className="back-top" href="#top">{c.backTop}<ArrowUp size={18} /></a></footer></div></section>
    </main>
    {activeProject && <ProjectModal key={activeProject.id} project={activeProject} language={language} onClose={closeProject} c={c} />}
  </div>;
}

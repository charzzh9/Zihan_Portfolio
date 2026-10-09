import { useState } from 'react';
import { ArrowUpRight, ChevronDown, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import ResponsiveImage from './ResponsiveImage';

function OriginalLink({ href, children }) {
  return <a className="evidence-original" href={href} target="_blank" rel="noreferrer">{children}<ArrowUpRight size={16} aria-hidden="true" /></a>;
}

function DocumentReader({ document, language, c }) {
  const [open, setOpen] = useState(document.expanded);
  const [pageIndex, setPageIndex] = useState(0);
  const page = document.pages[pageIndex];
  const title = document.title[language];

  return <details className="document-reader" open={open} onToggle={event => setOpen(event.currentTarget.open)}>
    <summary><FileText size={19} aria-hidden="true" /><span>{title}</span><ChevronDown className="document-chevron" size={19} aria-hidden="true" /></summary>
    {open && <div className="document-body">
      <div className="document-toolbar">
        <OriginalLink href={document.file}>{c.openPdf}</OriginalLink>
        <div className="document-pagination" role="group" aria-label={title}>
          <button className="document-page-button" disabled={pageIndex === 0} title={c.previousPage} aria-label={c.previousPage} onClick={() => setPageIndex(index => Math.max(0, index - 1))}><ChevronLeft size={19} /></button>
          <span className="document-page-count" aria-live="polite">{c.page} {pageIndex + 1} / {document.pages.length}</span>
          <button className="document-page-button" disabled={pageIndex === document.pages.length - 1} title={c.nextPage} aria-label={c.nextPage} onClick={() => setPageIndex(index => Math.min(document.pages.length - 1, index + 1))}><ChevronRight size={19} /></button>
        </div>
      </div>
      <a className="document-page" href={document.file} target="_blank" rel="noreferrer" aria-label={`${title} · ${c.openPdf}`} style={{ aspectRatio: `${page.width} / ${page.height}` }}>
        <img key={page.src} src={page.src} width={page.width} height={page.height} alt={`${title} · ${c.page} ${pageIndex + 1}`} loading="lazy" decoding="async" />
      </a>
    </div>}
  </details>;
}

export default function ProjectEvidence({ project, language, c }) {
  if (!project.posters?.length && !project.documents?.length && !project.gallery?.length) return null;

  return <section className="project-evidence" aria-label={c.materials}>
    <h3 className="evidence-heading">{c.materials}</h3>
    {project.gallery && <div className="evidence-gallery">{project.gallery.map(photo => <figure key={photo.src}>
      <a href={photo.src} target="_blank" rel="noreferrer" aria-label={`${photo.caption[language]} · ${c.openImage}`}><ResponsiveImage src={photo.src} sizes="(max-width: 700px) calc(100vw - 70px), (max-width: 1000px) calc((100vw - 180px) / 3), 274px" alt={photo.caption[language]} loading="lazy" /></a>
      <figcaption>{photo.caption[language]}<ArrowUpRight size={14} aria-hidden="true" /></figcaption>
    </figure>)}</div>}
    {project.posters?.map(poster => <figure className="evidence-poster" key={poster.src}>
      <figcaption><span>{poster.title[language]}</span><OriginalLink href={poster.file}>{c.openOriginal}</OriginalLink></figcaption>
      {poster.note && <p className="evidence-note">{poster.note[language]}</p>}
      <a className="poster-image" href={poster.file} target="_blank" rel="noreferrer" aria-label={`${poster.title[language]} · ${c.openOriginal}`}><img src={poster.src} width={poster.width} height={poster.height} alt={poster.title[language]} loading="lazy" decoding="async" /></a>
    </figure>)}
    {project.documents?.map(document => <DocumentReader key={document.file} document={document} language={language} c={c} />)}
  </section>;
}

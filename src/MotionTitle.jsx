export default function MotionTitle({ as: Tag = 'h2', text, className = '', hero = false }) {
  return <Tag className={className} aria-label={text.replaceAll('\n', ' ')} data-motion-title>
    {text.split('\n').map((line, lineIndex) => <span className="motion-line" aria-hidden="true" key={lineIndex}>
      {line.split(' ').map((word, wordIndex) => <span key={wordIndex}>
        {wordIndex > 0 && ' '}
        <span className="motion-word-mask"><span className="motion-word">
          {hero && word.endsWith('.') ? <>{word.slice(0, -1)}<span className="hero-dot">.</span></> : word}
        </span></span>
      </span>)}
    </span>)}
  </Tag>;
}

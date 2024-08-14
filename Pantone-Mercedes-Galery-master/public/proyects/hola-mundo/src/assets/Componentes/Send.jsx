// https://feathericons.dev/?search=send&iconset=feather&format=strict-jsx
export function Send({className, onClick, props}) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" onClick={onClick} className={`main-grid-item-icon ${className}`} width="24" height="24"  fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" {...props}>
        <line x1="22" x2="11" y1="2" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
      </svg>
    );
  }
  
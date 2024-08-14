// https://feathericons.dev/?search=plus&iconset=feather&format=strict-jsx
export function Plus({ onClick,className,props, id}) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" onClick={onClick} id={id} viewBox="0 0 24 24" width="24" height="24" className={`main-grid-item-icon ${className}`} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" {...props}>
        <line x1="12" x2="12" y1="5" y2="19" />
        <line x1="5" x2="19" y1="12" y2="12" />
      </svg>
    );
  }
  
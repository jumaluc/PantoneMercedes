// https://feathericons.dev/?search=check&iconset=feather&format=strict-jsx
// Check.js
export function Check({ className, onClick }) {
  return (
      <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          width="24" 
          height="24" 
          className={`main-grid-item-icon ${className}`} 
          fill="none" 
          stroke="currentColor" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="2"
          onClick={onClick}
      >
          <polyline points="20 6 9 17 4 12" />
      </svg>
  );
}

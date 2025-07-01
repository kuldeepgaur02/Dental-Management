import React from 'react';

const Rupeeicons = ({ size = 24, className = 'text-gray-800' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    width={size}
    height={size}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path d="M6 3h12M6 8h12M9 13h6a3 3 0 1 1-3 3H9m0 0v5" />
  </svg>
);

export default Rupeeicons;

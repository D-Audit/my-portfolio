import React from 'react';

const IconLoader = () => (
  <svg id="logo" xmlns="http://www.w3.org/2000/svg" role="img" viewBox="0 0 100 100">
    <title>KDJ loader</title>
    <g>
      <text
        id="KDJ"
        x="50"
        y="58"
        fill="currentColor"
        fontFamily="SFMono-Regular, Consolas, Liberation Mono, monospace"
        fontSize="27"
        fontWeight="700"
        letterSpacing="-4"
        textAnchor="middle">
        KDJ
      </text>
      <path
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M 50, 5
                  L 11, 27
                  L 11, 72
                  L 50, 95
                  L 89, 73
                  L 89, 28 z"
      />
    </g>
  </svg>
);

export default IconLoader;

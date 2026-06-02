
// Elegant Green Ribbon Bow (Hand-drawn style)
export const GreenRibbon = ({ className = '', width = 120, height = 90 }) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 120 90" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ transition: 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
  >
    {/* Left Loop */}
    <path 
      d="M58 40C45 25 20 20 15 32C10 42 25 50 58 44" 
      fill="#4C5E45" 
      fillOpacity="0.85" 
      stroke="#3A4A34" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M58 40C38 32 25 28 18 36" 
      stroke="#3A4A34" 
      strokeWidth="1.5" 
      strokeLinecap="round"
    />
    
    {/* Right Loop */}
    <path 
      d="M62 40C75 25 100 20 105 32C110 42 95 50 62 44" 
      fill="#4C5E45" 
      fillOpacity="0.85" 
      stroke="#3A4A34" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M62 40C82 32 95 28 102 36" 
      stroke="#3A4A34" 
      strokeWidth="1.5" 
      strokeLinecap="round"
    />
    
    {/* Center Knot */}
    <rect 
      x="54" 
      y="37" 
      width="12" 
      height="14" 
      rx="4" 
      fill="#3A4A34" 
      stroke="#2D3A28" 
      strokeWidth="1.5"
    />
    <path 
      d="M56 44C58 45 62 45 64 44" 
      stroke="#4C5E45" 
      strokeWidth="1.5" 
      strokeLinecap="round"
    />

    {/* Left Tail */}
    <path 
      d="M56 49C45 60 25 78 30 82C34 85 46 72 58 50" 
      fill="#4C5E45" 
      fillOpacity="0.85" 
      stroke="#3A4A34" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M48 58C38 67 32 72 31 77" 
      stroke="#3A4A34" 
      strokeWidth="1" 
      strokeLinecap="round"
    />

    {/* Right Tail */}
    <path 
      d="M64 49C75 60 95 78 90 82C86 85 74 72 62 50" 
      fill="#4C5E45" 
      fillOpacity="0.85" 
      stroke="#3A4A34" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M72 58C82 67 88 72 89 77" 
      stroke="#3A4A34" 
      strokeWidth="1" 
      strokeLinecap="round"
    />
  </svg>
);

// Textured Terracotta Heart (Hand-painted watercolor look)
export const TerracottaHeart = ({ className = '', width = 90, height = 90 }) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ transition: 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
  >
    {/* Base Heart Layer */}
    <path 
      d="M50 88C50 88 15 65 15 38C15 22 27 12 42 16C46 17 48 20 50 24C52 20 54 17 58 16C73 12 85 22 85 38C85 65 50 88 50 88Z" 
      fill="#8C3B20" 
      fillOpacity="0.9"
    />
    
    {/* Texturing brush marks using translucent paths */}
    <path 
      d="M30 30C25 45 35 60 50 78" 
      stroke="#A55034" 
      strokeWidth="4" 
      strokeLinecap="round" 
      strokeDasharray="4 8" 
      opacity="0.6"
    />
    <path 
      d="M70 30C75 45 65 60 50 78" 
      stroke="#6E2B15" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeDasharray="5 5" 
      opacity="0.4"
    />
    <path 
      d="M48 22C42 22 36 26 36 34C36 44 48 55 48 55" 
      stroke="#FAF5F0" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      opacity="0.3"
    />
  </svg>
);

// Botanical Olive Branches (Elegant line sketch)
export const OliveBranch = ({ className = '', width = 160, height = 180 }) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 160 180" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Main Stem */}
    <path 
      d="M30 160C45 130 70 80 90 20" 
      stroke="#8C7A6B" 
      strokeWidth="2" 
      strokeLinecap="round"
    />
    
    {/* Leaves (Left Side) */}
    {/* Leaf 1 */}
    <path 
      d="M45 125C30 120 18 105 20 95C25 90 40 100 50 112Z" 
      fill="#9EAB97" 
      stroke="#5C6657" 
      strokeWidth="1"
    />
    <path d="M20 95C28 102 38 108 45 125" stroke="#5C6657" strokeWidth="0.5" />
    
    {/* Leaf 2 */}
    <path 
      d="M62 90C45 82 35 68 38 58C43 53 58 65 66 78Z" 
      fill="#8B9B84" 
      stroke="#5C6657" 
      strokeWidth="1"
    />
    <path d="M38 58C48 65 57 71 62 90" stroke="#5C6657" strokeWidth="0.5" />

    {/* Leaf 3 */}
    <path 
      d="M78 52C62 42 55 28 60 20C65 15 76 28 82 40Z" 
      fill="#A4B39F" 
      stroke="#5C6657" 
      strokeWidth="1"
    />

    {/* Leaves (Right Side) */}
    {/* Leaf 4 */}
    <path 
      d="M58 118C70 110 85 108 92 118C98 125 80 135 68 132Z" 
      fill="#9EAB97" 
      stroke="#5C6657" 
      strokeWidth="1"
    />
    <path d="M92 118C82 120 72 122 58 118" stroke="#5C6657" strokeWidth="0.5" />

    {/* Leaf 5 */}
    <path 
      d="M74 80C90 75 102 78 106 88C110 98 92 102 82 96Z" 
      fill="#8B9B84" 
      stroke="#5C6657" 
      strokeWidth="1"
    />
    
    {/* Leaf 6 */}
    <path 
      d="M87 42C105 38 118 42 120 52C122 62 104 62 94 54Z" 
      fill="#A4B39F" 
      stroke="#5C6657" 
      strokeWidth="1"
    />

    {/* Olives */}
    <circle cx="50" cy="100" r="6" fill="#423E28" stroke="#252317" strokeWidth="1" />
    <circle cx="82" cy="74" r="5" fill="#3D452B" stroke="#222817" strokeWidth="1" />
    <circle cx="72" cy="116" r="6.5" fill="#423E28" stroke="#252317" strokeWidth="1" />
  </svg>
);

/* --- PASTA SHAPES ILLUSTRATIONS (For floating kitchen section) --- */

// Farfalle (Bowtie Pasta)
export const FarfallePasta = ({ width = 50, height = 40, className = '' }) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 50 40" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Body */}
    <path 
      d="M5 10 L15 15 L25 18 L35 15 L45 10 
         L48 20 L45 30 L35 25 L25 22 L15 25 L5 30 
         L2 20 Z" 
      fill="#E5C185" 
      stroke="#B6904F" 
      strokeWidth="1.5" 
      strokeLinejoin="round"
    />
    {/* Folds & Ridges */}
    <path d="M25 18 L25 22" stroke="#B6904F" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M18 16 L22 17.5" stroke="#B6904F" strokeWidth="1" />
    <path d="M18 24 L22 22.5" stroke="#B6904F" strokeWidth="1" />
    <path d="M32 16 L28 17.5" stroke="#B6904F" strokeWidth="1" />
    <path d="M32 24 L28 22.5" stroke="#B6904F" strokeWidth="1" />
    {/* Serrated Edges */}
    <path d="M5 10 L3 13 L5 16 L3 19 L5 22 L3 25 L5 28 L3 30" stroke="#B6904F" strokeWidth="1.2" />
    <path d="M45 10 L47 13 L45 16 L47 19 L45 22 L47 25 L45 28 L47 30" stroke="#B6904F" strokeWidth="1.2" />
  </svg>
);

// Ravioli
export const RavioliPasta = ({ width = 45, height = 45, className = '' }) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 45 45" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Pillow body */}
    <rect 
      x="4" 
      y="4" 
      width="37" 
      height="37" 
      rx="3" 
      fill="#EAD0A2" 
      stroke="#B6904F" 
      strokeWidth="1.5"
    />
    
    {/* Center filling bulge */}
    <rect 
      x="10" 
      y="10" 
      width="25" 
      height="25" 
      rx="6" 
      fill="#E5C185" 
      stroke="#CBA262" 
      strokeWidth="1.2" 
      strokeDasharray="2 2"
    />

    {/* Crimp marks / ridges */}
    <path d="M8 4 L8 2 M14 4 L14 2 M20 4 L20 2 M26 4 L26 2 M32 4 L32 2 M38 4 L38 2" stroke="#B6904F" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M8 41 L8 43 M14 41 L14 43 M20 41 L20 43 M26 41 L26 43 M32 41 L32 43 M38 41 L38 43" stroke="#B6904F" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M4 8 L2 8 M4 14 L2 14 M4 20 L2 20 M4 26 L2 26 M4 32 L2 32 M4 38 L2 38" stroke="#B6904F" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M41 8 L43 8 M41 14 L43 14 M41 20 L43 20 M41 26 L43 26 M41 32 L43 32 M41 38 L43 38" stroke="#B6904F" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// Penne Pasta
export const PennePasta = ({ width = 55, height = 24, className = '' }) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 55 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Main Cylinder */}
    <path 
      d="M10 3 L45 3 L52 21 L17 21 Z" 
      fill="#E5C185" 
      stroke="#B6904F" 
      strokeWidth="1.5" 
      strokeLinejoin="round"
    />
    
    {/* Left Hollow Opening */}
    <ellipse 
      cx="13.5" 
      cy="12" 
      rx="3.5" 
      ry="9" 
      transform="rotate(-20 13.5 12)" 
      fill="#7E602F" 
      stroke="#B6904F" 
      strokeWidth="1.5"
    />
    
    {/* Ribbed ridges */}
    <path d="M18 5 L43 5" stroke="#DAB475" strokeWidth="1.2" />
    <path d="M20 8 L45 8" stroke="#B6904F" strokeWidth="1.2" />
    <path d="M22 11 L47 11" stroke="#DAB475" strokeWidth="1.2" />
    <path d="M24 14 L49 14" stroke="#B6904F" strokeWidth="1.2" />
    <path d="M26 17 L51 17" stroke="#DAB475" strokeWidth="1.2" />
  </svg>
);

// Rotelle (Pasta Wheel)
export const RotellePasta = ({ width = 45, height = 45, className = '' }) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 45 45" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Outer Ring */}
    <circle cx="22.5" cy="22.5" r="18" fill="#E5C185" stroke="#B6904F" strokeWidth="2.5" />
    
    {/* Inner Hub */}
    <circle cx="22.5" cy="22.5" r="5" fill="#E5C185" stroke="#B6904F" strokeWidth="1.5" />
    <circle cx="22.5" cy="22.5" r="2" fill="#7E602F" />

    {/* Spokes */}
    <line x1="22.5" y1="4.5" x2="22.5" y2="17.5" stroke="#B6904F" strokeWidth="2" />
    <line x1="22.5" y1="27.5" x2="22.5" y2="40.5" stroke="#B6904F" strokeWidth="2" />
    <line x1="4.5" y1="22.5" x2="17.5" y2="22.5" stroke="#B6904F" strokeWidth="2" />
    <line x1="27.5" y1="22.5" x2="40.5" y2="22.5" stroke="#B6904F" strokeWidth="2" />
    
    {/* Diagonal Spokes */}
    <line x1="9.8" y1="9.8" x2="19" y2="19" stroke="#B6904F" strokeWidth="1.5" />
    <line x1="26" y1="26" x2="35.2" y2="35.2" stroke="#B6904F" strokeWidth="1.5" />
    <line x1="35.2" y1="9.8" x2="26" y2="19" stroke="#B6904F" strokeWidth="1.5" />
    <line x1="19" y1="26" x2="9.8" y2="35.2" stroke="#B6904F" strokeWidth="1.5" />

    {/* Outer Ridges (Grip) */}
    <circle cx="22.5" cy="22.5" r="19" stroke="#B6904F" strokeWidth="1" strokeDasharray="3 3" />
  </svg>
);

import React from 'react'
import { KeypadSvg, KeypadWrapper } from './DriveKeypad.styles'

export interface DriveKeypadProps {
  width?: string
  height?: string
  maxWidth?: string
  maxHeight?: string
}

export const DriveKeypad: React.FC<DriveKeypadProps> = ({
  width,
  height,
  maxWidth,
  maxHeight
}) => {
  return (
    <KeypadWrapper
      aria-hidden="true"
      $width={width}
      $height={height}
      $maxWidth={maxWidth}
      $maxHeight={maxHeight}
    >
      <KeypadSvg viewBox="0 0 420 740" preserveAspectRatio="xMidYMid meet" role="img">
        <defs>
          <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4d4d4d" stopOpacity="1" />
            <stop offset="40%" stopColor="#333333" stopOpacity="1" />
            <stop offset="100%" stopColor="#1a1a1a" stopOpacity="1" />
          </linearGradient>

          <linearGradient id="bezelGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#333" stopOpacity="1" />
            <stop offset="10%" stopColor="#000" stopOpacity="1" />
            <stop offset="90%" stopColor="#111" stopOpacity="1" />
            <stop offset="100%" stopColor="#333" stopOpacity="1" />
          </linearGradient>

          <linearGradient id="yellowBtnGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffe066" stopOpacity="1" />
            <stop offset="20%" stopColor="#ffcc00" stopOpacity="1" />
            <stop offset="100%" stopColor="#cca300" stopOpacity="1" />
          </linearGradient>

          <linearGradient id="redBtnGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ff6666" stopOpacity="1" />
            <stop offset="100%" stopColor="#990000" stopOpacity="1" />
          </linearGradient>

          <linearGradient id="greenBtnGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00cc66" stopOpacity="1" />
            <stop offset="100%" stopColor="#004d26" stopOpacity="1" />
          </linearGradient>

          <pattern id="lcdGrid" x="0" y="0" width="3" height="3" patternUnits="userSpaceOnUse">
            <rect width="2.5" height="2.5" fill="#000" fillOpacity="0.08" />
          </pattern>

          <linearGradient id="glassGlare" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.3" />
            <stop offset="45%" stopColor="#fff" stopOpacity="0" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>

          <filter id="insetShadow">
            <feOffset dx="0" dy="1" />
            <feGaussianBlur stdDeviation="1" result="offset-blur" />
            <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
            <feFlood floodColor="black" floodOpacity="0.7" result="color" />
            <feComposite operator="in" in="color" in2="inverse" result="shadow" />
            <feComposite operator="over" in="shadow" in2="SourceGraphic" />
          </filter>

          <filter id="btnShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="1" dy="2" stdDeviation="1" floodOpacity="0.5" />
          </filter>

          <filter id="ledGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path
          d="M 60 40
                 C 60 40, 100 20, 210 20
                 C 320 20, 360 40, 360 40
                 C 400 60, 410 120, 410 220
                 C 410 280, 390 320, 350 360
                 L 350 620
                 C 350 700, 300 730, 210 730
                 C 120 730, 70 700, 70 620
                 L 70 360
                 C 30 320, 10 280, 10 220
                 C 10 120, 20 60, 60 40 Z"
          fill="url(#bodyGradient)"
          stroke="#111"
          strokeWidth="2"
        />

        <path
          d="M 70 390 Q 210 405 350 390"
          fill="none"
          stroke="#000"
          strokeOpacity="0.3"
          strokeWidth="2"
        />
        <path
          d="M 70 650 Q 210 665 350 650"
          fill="none"
          stroke="#000"
          strokeOpacity="0.3"
          strokeWidth="2"
        />

        <path
          d="M 60 120
                 Q 210 70, 360 120
                 Q 390 220, 360 320
                 Q 210 370, 60 320
                 Q 30 220, 60 120 Z"
          fill="url(#bezelGradient)"
          stroke="#555"
          strokeWidth="1"
        />

        <text
          x="210"
          y="100"
          textAnchor="middle"
          fill="#ccc"
          fontFamily="Arial, sans-serif"
          fontSize="18"
          fontWeight="normal"
          letterSpacing="1"
        >
          GE Energy
        </text>

        <g transform="translate(80, 125)">
          <rect width="260" height="90" rx="4" fill="#8cc63f" />
          <rect width="260" height="90" rx="4" fill="url(#lcdGrid)" />
          <rect width="260" height="90" rx="4" fill="none" stroke="#5da32f" strokeWidth="3" />

          <g
            fontFamily="'Courier New', monospace"
            fontSize="13"
            fill="#223300"
            fontWeight="900"
            letterSpacing="-0.5"
          >
            <rect x="5" y="5" width="20" height="15" fill="#223300" opacity="0.8" />
            <text x="8" y="17" fill="#8cc63f">
              1.
            </text>

            <text x="35" y="17">
              PARAMETER HELP
            </text>

            <text x="8" y="37">
              2. DISPLAY TRIPS
            </text>
            <text x="8" y="57">
              3. ATTEMPT RESET
            </text>
            <text x="8" y="77">
              4. BACK TO PARAMETER
            </text>

            <rect x="35" y="7" width="10" height="12" fill="#223300" opacity="0.2" />
          </g>

          <path
            d="M 0 0 L 260 0 L 260 50 C 130 70, 130 70, 0 50 Z"
            fill="url(#glassGlare)"
            opacity="0.4"
            pointerEvents="none"
          />
        </g>

        <g transform="translate(0, 30)">
          <g transform="translate(110, 240)">
            <text x="0" y="-15" fill="#999" fontSize="10" textAnchor="middle" fontFamily="Arial">
              ⏻
            </text>
            <circle r="6" fill="#111" stroke="#333" />
            <circle r="3" fill="#00ff00" opacity="0.2" />
          </g>
          <g transform="translate(176, 250)">
            <text x="0" y="-15" fill="#999" fontSize="14" textAnchor="middle" fontFamily="Arial">
              ↻
            </text>
            <circle r="6" fill="#111" stroke="#333" />
          </g>
          <g transform="translate(242, 250)">
            <text x="0" y="-15" fill="#999" fontSize="12" textAnchor="middle" fontFamily="Arial">
              ⚠
            </text>
            <circle r="6" fill="#111" stroke="#333" />
          </g>
          <g transform="translate(310, 240)">
            <text x="0" y="-15" fill="#999" fontSize="12" textAnchor="middle" fontFamily="Arial">
              ⦸
            </text>
            <circle r="6" fill="#111" stroke="#333" />
            <circle r="3" fill="#ff0000" filter="url(#ledGlow)" />
          </g>
        </g>

        <g transform="translate(0, 40)" filter="url(#btnShadow)">
          <g transform="translate(130, 310)">
            <path
              d="M -20 -15 C -25 -15, -30 15, 0 15 C 30 15, 25 -15, 20 -15 Z"
              fill="url(#yellowBtnGrad)"
            />
            <path d="M 0 -8 L 5 2 L -5 2 Z" fill="#222" />
          </g>
          <g transform="translate(185, 310)">
            <path
              d="M -20 -15 C -25 -15, -30 15, 0 15 C 30 15, 25 -15, 20 -15 Z"
              fill="url(#yellowBtnGrad)"
            />
            <path d="M 0 5 L 5 -5 L -5 -5 Z" fill="#222" />
          </g>
          <g transform="translate(240, 310)">
            <path
              d="M -20 -15 C -25 -15, -30 15, 0 15 C 30 15, 25 -15, 20 -15 Z"
              fill="url(#greenBtnGrad)"
            />
            <rect
              x="-5"
              y="-5"
              width="10"
              height="10"
              transform="rotate(45)"
              stroke="#111"
              strokeWidth="1.5"
              fill="none"
            />
          </g>
          <g transform="translate(295, 310)">
            <path
              d="M -20 -15 C -25 -15, -30 15, 0 15 C 30 15, 25 -15, 20 -15 Z"
              fill="url(#redBtnGrad)"
            />
            <circle r="6" stroke="#111" strokeWidth="1.5" fill="none" />
            <path d="M 0 -6 L 0 6" stroke="#111" strokeWidth="1.5" transform="rotate(45)" />
          </g>
        </g>

        <g transform="translate(210, 415)" filter="url(#btnShadow)">
          <ellipse cx="0" cy="0" rx="80" ry="35" fill="url(#yellowBtnGrad)" />
          <path d="M -45 -30 Q -35 0, -45 30" stroke="#222" strokeWidth="2" fill="none" />
          <path d="M 45 -30 Q 35 0, 45 30" stroke="#222" strokeWidth="2" fill="none" />

          <text
            x="-60"
            y="5"
            fontFamily="Arial"
            fontWeight="bold"
            fontSize="12"
            fill="#222"
            textAnchor="middle"
          >
            ESC
          </text>

          <g transform="translate(60, 0)">
            <path
              d="M -8 2 L 2 2 L 2 -4 L 8 0 L 2 4 L 2 2"
              stroke="#222"
              strokeWidth="2"
              fill="none"
            />
          </g>

          <ellipse
            cx="0"
            cy="0"
            rx="30"
            ry="25"
            fill="url(#yellowBtnGrad)"
            stroke="#cc9900"
            strokeWidth="1"
          />

          <path d="M 0 -18 L 4 -10 L -4 -10 Z" fill="#222" />
          <path d="M 0 18 L 4 10 L -4 10 Z" fill="#222" />
          <path d="M -22 0 L -14 -4 L -14 4 Z" fill="#222" />
          <path d="M 22 0 L 14 -4 L 14 4 Z" fill="#222" />
        </g>

        <g transform="translate(210, 490)" fontFamily="Arial, sans-serif" textAnchor="middle">
          <defs>
            <g id="nBtn">
              <path
                d="M -20 -10 Q -25 0, -20 10 L 20 10 Q 25 0, 20 -10 Z"
                fill="url(#yellowBtnGrad)"
                filter="url(#btnShadow)"
              />
            </g>
            <g id="nBtnVert">
              <path
                d="M -10 -15 Q 0 -20, 10 -15 L 10 15 Q 0 20, -10 15 Z"
                fill="url(#yellowBtnGrad)"
                filter="url(#btnShadow)"
              />
            </g>
          </defs>

          <g transform="translate(-70, 0)">
            <use xlinkHref="#nBtn" />
            <text y="8" fontWeight="bold" fontSize="14" fill="#111">
              1
            </text>
            <text y="-3" fontSize="7" fill="#111">
              ABC
            </text>
          </g>
          <g transform="translate(0, 0)">
            <use xlinkHref="#nBtn" />
            <text y="8" fontWeight="bold" fontSize="14" fill="#111">
              2
            </text>
            <text y="-3" fontSize="7" fill="#111">
              DEF
            </text>
          </g>
          <g transform="translate(70, 0)">
            <use xlinkHref="#nBtn" />
            <text y="8" fontWeight="bold" fontSize="14" fill="#111">
              3
            </text>
            <text y="-3" fontSize="7" fill="#111">
              GHI
            </text>
          </g>
          <g transform="translate(125, 25)">
            <use xlinkHref="#nBtnVert" />
            <text y="5" fontWeight="bold" fontSize="16" fill="#111">
              ?
            </text>
          </g>

          <g transform="translate(-70, 40)">
            <use xlinkHref="#nBtn" />
            <text y="8" fontWeight="bold" fontSize="14" fill="#111">
              4
            </text>
            <text y="-3" fontSize="7" fill="#111">
              JKL
            </text>
          </g>
          <g transform="translate(0, 40)">
            <use xlinkHref="#nBtn" />
            <text y="8" fontWeight="bold" fontSize="14" fill="#111">
              5
            </text>
            <text y="-3" fontSize="7" fill="#111">
              MNO
            </text>
          </g>
          <g transform="translate(70, 40)">
            <use xlinkHref="#nBtn" />
            <text y="8" fontWeight="bold" fontSize="14" fill="#111">
              6
            </text>
            <text y="-3" fontSize="7" fill="#111">
              PQR
            </text>
          </g>

          <g transform="translate(-70, 80)">
            <use xlinkHref="#nBtn" />
            <text y="8" fontWeight="bold" fontSize="14" fill="#111">
              7
            </text>
            <text y="-3" fontSize="7" fill="#111">
              STU
            </text>
          </g>
          <g transform="translate(0, 80)">
            <use xlinkHref="#nBtn" />
            <text y="8" fontWeight="bold" fontSize="14" fill="#111">
              8
            </text>
            <text y="-3" fontSize="7" fill="#111">
              VWX
            </text>
          </g>
          <g transform="translate(70, 80)">
            <use xlinkHref="#nBtn" />
            <text y="8" fontWeight="bold" fontSize="14" fill="#111">
              9
            </text>
            <text y="-4" fontSize="7" fill="#111">
              YZ_
            </text>
          </g>
          <g transform="translate(125, 80)">
            <use xlinkHref="#nBtnVert" />
            <text y="5" fontWeight="bold" fontSize="16" fill="#111">
              +
            </text>
          </g>

          <g transform="translate(-70, 120)">
            <use xlinkHref="#nBtn" />
          </g>
          <g transform="translate(0, 120)">
            <use xlinkHref="#nBtn" />
            <text y="6" fontWeight="bold" fontSize="14" fill="#111">
              0
            </text>
          </g>
          <g transform="translate(70, 120)">
            <use xlinkHref="#nBtn" />
            <text y="2" fontWeight="bold" fontSize="18" fill="#111">
              .
            </text>
          </g>
          <g transform="translate(125, 130)">
            <use xlinkHref="#nBtnVert" />
            <text y="5" fontWeight="bold" fontSize="16" fill="#111">
              -
            </text>
          </g>
        </g>
      </KeypadSvg>
    </KeypadWrapper>
  )
}

export default DriveKeypad

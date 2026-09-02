import React from 'react';
import { AvatarConfig } from '../types';

interface PlayerAvatarProps {
  avatar: AvatarConfig;
  size?: number;
  className?: string;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({ avatar, size = 120, className = '' }) => {
  const { skinTone, hairStyle, hairColor, facialHair, kitPrimaryColor, kitSecondaryColor, likenessName } = avatar;

  return (
    <div
      className={`relative select-none flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 160 180"
        className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id={`glow-${likenessName || 'p'}`} cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`skinGrad-${likenessName || 'p'}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={skinTone} />
            <stop offset="100%" stopColor={skinTone} stopOpacity="0.88" />
          </linearGradient>
          <linearGradient id={`hairGrad-${likenessName || 'p'}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={hairColor} />
            <stop offset="100%" stopColor="#0a0a0a" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id={`kitGrad-${likenessName || 'p'}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={kitPrimaryColor} />
            <stop offset="100%" stopColor={kitPrimaryColor} stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Ambient aura */}
        <circle cx="80" cy="80" r="70" fill={`url(#glow-${likenessName || 'p'})`} />

        {/* Torso & Kit */}
        <g id="torso">
          {/* Shoulders / Jersey */}
          <path
            d="M 24 180 C 26 142 42 134 62 130 L 98 130 C 118 134 134 142 136 180 Z"
            fill={`url(#kitGrad-${likenessName || 'p'})`}
          />
          {/* Jersey V-Collar / Stripes */}
          <path
            d="M 62 130 L 80 152 L 98 130 L 88 130 L 80 142 L 72 130 Z"
            fill={kitSecondaryColor}
          />
          {/* Side shoulder accents */}
          <path d="M 30 152 C 34 142 44 136 55 133" stroke={kitSecondaryColor} strokeWidth="3" fill="none" opacity="0.6" />
          <path d="M 130 152 C 126 142 116 136 105 133" stroke={kitSecondaryColor} strokeWidth="3" fill="none" opacity="0.6" />
        </g>

        {/* Neck */}
        <path
          d="M 68 108 L 68 134 L 92 134 L 92 108 Z"
          fill={`url(#skinGrad-${likenessName || 'p'})`}
        />
        {/* Neck shadow */}
        <path d="M 68 114 C 76 122 84 122 92 114 L 92 120 C 84 128 76 128 68 120 Z" fill="#000000" opacity="0.2" />

        {/* Ears */}
        <ellipse cx="49" cy="85" rx="6" ry="11" fill={skinTone} />
        <ellipse cx="49" cy="85" rx="3" ry="6" fill="#000000" opacity="0.15" />
        <ellipse cx="111" cy="85" rx="6" ry="11" fill={skinTone} />
        <ellipse cx="111" cy="85" rx="3" ry="6" fill="#000000" opacity="0.15" />

        {/* Head/Face shape */}
        <path
          d="M 52 74 C 52 50 64 38 80 38 C 96 38 108 50 108 74 C 108 98 96 114 80 114 C 64 114 52 98 52 74 Z"
          fill={`url(#skinGrad-${likenessName || 'p'})`}
        />

        {/* Hair Styles */}
        {hairStyle === 'buzz' && (
          <path
            d="M 52 68 C 50 44 62 30 80 30 C 98 30 110 44 108 68 C 104 46 95 36 80 36 C 65 36 56 46 52 68 Z"
            fill={`url(#hairGrad-${likenessName || 'p'})`}
          />
        )}

        {hairStyle === 'short-fade' && (
          <g>
            {/* Taper fade sides */}
            <path
              d="M 50 78 C 50 56 52 46 60 40 L 100 40 C 108 46 110 56 110 78 L 107 78 C 107 54 104 44 80 43 C 56 44 53 54 53 78 Z"
              fill={hairColor}
              opacity="0.8"
            />
            {/* Top pompadour / textured top */}
            <path
              d="M 54 44 C 58 24 74 20 84 20 C 98 20 106 28 106 44 C 98 34 88 32 80 32 C 68 32 60 36 54 44 Z"
              fill={`url(#hairGrad-${likenessName || 'p'})`}
            />
          </g>
        )}

        {hairStyle === 'parted' && (
          <g>
            {/* Elegant classic side sweep (Messi / De Bruyne) */}
            <path
              d="M 51 65 C 50 42 62 26 80 26 C 96 26 109 38 109 65 C 106 42 96 34 78 34 C 66 34 56 42 51 65 Z"
              fill={`url(#hairGrad-${likenessName || 'p'})`}
            />
            <path
              d="M 56 36 C 68 28 82 28 98 34 C 90 31 76 31 66 38 Z"
              fill="#ffffff"
              opacity="0.25"
            />
          </g>
        )}

        {hairStyle === 'ponytail' && (
          <g>
            {/* Haaland iconic sleek blonde flow & bun */}
            <path
              d="M 52 62 C 52 40 64 28 80 28 C 96 28 108 40 108 62 C 104 42 94 34 80 34 C 66 34 56 42 52 62 Z"
              fill={`url(#hairGrad-${likenessName || 'p'})`}
            />
            {/* Top bun / ponytail bundle */}
            <ellipse cx="80" cy="22" rx="12" ry="9" fill={hairColor} />
            <path d="M 76 22 Q 80 12 86 16 Q 82 24 76 22" fill={hairColor} />
          </g>
        )}

        {hairStyle === 'topknot' && (
          <g>
            {/* Van Dijk topknot */}
            <path
              d="M 52 68 C 50 48 62 34 80 34 C 98 34 110 48 108 68 C 104 46 95 38 80 38 C 65 38 56 46 52 68 Z"
              fill={`url(#hairGrad-${likenessName || 'p'})`}
            />
            <circle cx="80" cy="24" r="8" fill={hairColor} />
            <ellipse cx="80" cy="24" rx="4" ry="7" fill="#000000" opacity="0.4" />
          </g>
        )}

        {hairStyle === 'afro' && (
          <g>
            {/* Salah voluminous curly afro */}
            <path
              d="M 44 70 C 40 36 60 18 80 18 C 100 18 120 36 116 70 C 112 40 98 30 80 30 C 62 30 48 40 44 70 Z"
              fill={`url(#hairGrad-${likenessName || 'p'})`}
            />
            <circle cx="48" cy="50" r="10" fill={hairColor} opacity="0.8" />
            <circle cx="112" cy="50" r="10" fill={hairColor} opacity="0.8" />
            <circle cx="80" cy="22" r="12" fill={hairColor} opacity="0.9" />
          </g>
        )}

        {hairStyle === 'wavy-headband' && (
          <g>
            {/* Modric flowing long hair with headband */}
            <path
              d="M 46 80 C 44 45 60 26 80 26 C 100 26 116 45 114 80 C 110 52 100 36 80 36 C 60 36 50 52 46 80 Z"
              fill={`url(#hairGrad-${likenessName || 'p'})`}
            />
            {/* Modric side hair strands */}
            <path d="M 46 70 Q 42 90 48 100 Q 52 86 48 70 Z" fill={hairColor} />
            <path d="M 114 70 Q 118 90 112 100 Q 108 86 112 70 Z" fill={hairColor} />
            {/* Headband */}
            <path d="M 48 56 Q 80 50 112 56 L 111 60 Q 80 54 49 60 Z" fill="#111827" />
          </g>
        )}

        {hairStyle === 'curls' && (
          <g>
            <path
              d="M 48 64 C 48 38 62 26 80 26 C 98 26 112 38 112 64 C 108 42 96 34 80 34 C 64 34 52 42 48 64 Z"
              fill={`url(#hairGrad-${likenessName || 'p'})`}
            />
            <circle cx="56" cy="38" r="6" fill={hairColor} />
            <circle cx="70" cy="32" r="7" fill={hairColor} />
            <circle cx="84" cy="31" r="7" fill={hairColor} />
            <circle cx="98" cy="36" r="6" fill={hairColor} />
          </g>
        )}

        {/* Eyebrows */}
        <path d="M 60 67 C 65 64 72 65 74 68" stroke={hairColor} strokeWidth="2.8" strokeLinecap="round" fill="none" />
        <path d="M 86 68 C 88 65 95 64 100 67" stroke={hairColor} strokeWidth="2.8" strokeLinecap="round" fill="none" />

        {/* Eyes */}
        <ellipse cx="67" cy="74" rx="3.5" ry="3.8" fill="#ffffff" />
        <circle cx="67.5" cy="74" r="2.2" fill="#1e1e1e" />
        <circle cx="68.2" cy="73.2" r="0.8" fill="#ffffff" />

        <ellipse cx="93" cy="74" rx="3.5" ry="3.8" fill="#ffffff" />
        <circle cx="92.5" cy="74" r="2.2" fill="#1e1e1e" />
        <circle cx="93.2" cy="73.2" r="0.8" fill="#ffffff" />

        {/* Nose */}
        <path d="M 80 73 L 80 88 L 84 88" stroke="#000000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.35" />

        {/* Mouth */}
        <path d="M 72 98 Q 80 103 88 98" stroke="#8b4513" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.75" />

        {/* Facial Hair */}
        {facialHair === 'stubble' && (
          <path
            d="M 64 94 C 64 108 72 113 80 113 C 88 113 96 108 96 94 C 92 100 86 105 80 105 C 74 105 68 100 64 94 Z"
            fill={hairColor}
            opacity="0.32"
          />
        )}

        {facialHair === 'full-beard' && (
          <path
            d="M 58 84 C 58 115 68 119 80 119 C 92 119 102 115 102 84 C 98 100 90 107 80 107 C 70 107 62 100 58 84 Z"
            fill={`url(#hairGrad-${likenessName || 'p'})`}
            opacity="0.9"
          />
        )}

        {facialHair === 'goatee' && (
          <g>
            <path d="M 72 95 Q 80 94 88 95 Q 80 97 72 95" fill={hairColor} />
            <ellipse cx="80" cy="107" rx="6" ry="6" fill={hairColor} opacity="0.8" />
          </g>
        )}
      </svg>
    </div>
  );
};

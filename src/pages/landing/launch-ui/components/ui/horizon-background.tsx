import { useId } from 'react';

export default function HorizonBackground() {
  const id = useId().replace(/:/g, '');
  return <svg className="horizon-background" viewBox="0 0 1440 900" preserveAspectRatio="none" aria-hidden="true" focusable="false">
    <defs>
      <radialGradient id={`${id}-sky`} cx="56%" cy="60%" r="50%"><stop stopColor="#4E49FF" stopOpacity=".13"/><stop offset=".65" stopColor="#252052" stopOpacity=".06"/><stop offset="1" stopColor="#101116" stopOpacity="0"/></radialGradient>
      <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse"><stop stopColor="#847aff" stopOpacity=".55"/><stop offset=".35" stopColor="#bdb6ff" stopOpacity=".9"/><stop offset=".57" stopColor="#e3e0ff"/><stop offset=".8" stopColor="#afa7ff" stopOpacity=".85"/><stop offset="1" stopColor="#847aff" stopOpacity=".55"/></linearGradient>
      <radialGradient id={`${id}-sun`}><stop stopColor="#ddd8ff" stopOpacity=".42"/><stop offset=".2" stopColor="#aaa0ff" stopOpacity=".22"/><stop offset=".65" stopColor="#4E49FF" stopOpacity=".05"/><stop offset="1" stopColor="#4E49FF" stopOpacity="0"/></radialGradient>
      <filter id={`${id}-soft`} x="-30%" y="-80%" width="160%" height="260%"><feGaussianBlur stdDeviation="30"/></filter>
      <filter id={`${id}-near`} x="-10%" y="-40%" width="120%" height="180%"><feGaussianBlur stdDeviation="5"/></filter>
      <filter id={`${id}-aurora`} x="-20%" y="-30%" width="140%" height="160%"><feTurbulence type="fractalNoise" baseFrequency=".008 .035" numOctaves="2" seed="7" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="28" xChannelSelector="R" yChannelSelector="G"/><feGaussianBlur stdDeviation="12"/></filter>
      <linearGradient id={`${id}-planet`} x1="0" y1="500" x2="0" y2="900" gradientUnits="userSpaceOnUse"><stop stopColor="#101116"/><stop offset=".6" stopColor="#101116"/></linearGradient>
    </defs>
    <rect width="1440" height="900" fill={`url(#${id}-sky)`}/>
    <g className="horizon-atmosphere" fill="none">
      <ellipse cx="720" cy="1500" rx="1530" ry="1000" stroke="#6556e8" strokeWidth="95" opacity=".45" filter={`url(#${id}-soft)`}/>
      <ellipse cx="720" cy="1500" rx="1530" ry="1000" stroke="#a397ff" strokeWidth="10" opacity=".65" filter={`url(#${id}-near)`}/>
    </g>
    <g className="horizon-aurora" fill="none" filter={`url(#${id}-aurora)`}>
      <ellipse className="horizon-aurora-wave" cx="720" cy="1500" rx="1530" ry="1000" stroke="#9987ff" strokeWidth="45"/>
      <ellipse className="horizon-aurora-wave horizon-aurora-wave-secondary" cx="720" cy="1500" rx="1530" ry="1000" stroke="#4E49FF" strokeWidth="60"/>
    </g>
    <ellipse cx="720" cy="1500" rx="1530" ry="1000" fill={`url(#${id}-planet)`}/>
    <ellipse cx="720" cy="1500" rx="1530" ry="1000" fill="none" stroke={`url(#${id}-rim)`} strokeWidth="1.15"/>
    <ellipse className="horizon-light" cx="820" cy="498" rx="160" ry="80" fill={`url(#${id}-sun)`}/>
  </svg>;
}

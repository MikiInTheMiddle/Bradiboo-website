import type {CSSProperties,ReactNode} from 'react';
import {resolveColor} from '@/lib/background';
export function CookieLabel({children,backgroundColor,textColor,className=''}:{children:ReactNode;backgroundColor?:string|null;textColor?:string|null;className?:string}) {
 const background=backgroundColor?resolveColor(backgroundColor):'#ffffff';
 const rgb=background.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i)?.slice(1).map(c=>parseInt(c,16));
 const foreground=rgb&&(rgb[0]*.299+rgb[1]*.587+rgb[2]*.114)<145?'#ffffff':'#7235e6';
 return <span className={`bradi-cookie ${className}`} style={{'--cookie-background':background,'--cookie-color':textColor&&textColor!=='transparent'?resolveColor(textColor):foreground} as CSSProperties}><span className="bradi-cookie-face">{children}</span></span>;
}

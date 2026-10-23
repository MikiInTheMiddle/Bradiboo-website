import type { CSSProperties } from 'react';

export const palette = { transparent: 'transparent', white: '#ffffff', ink: '#243162', purple: '#7235e8', yellow: '#f9b400', coral: '#f37c72', mint: '#b4dfce' };
export function resolveColor(value?: string | null): string {
 return (value && Object.hasOwn(palette, value) ? palette[value as keyof typeof palette] : undefined) || (value && /^#[0-9a-f]{6}$/i.test(value) ? value : 'transparent');
}
export function gradientColors(value?: string | null): string[] | undefined {
 const match = value?.match(/^linear-gradient\(to bottom, (#[0-9a-f]{6}) 0%, (#[0-9a-f]{6}) 100%\)$/i);
 return match ? [match[1], match[2]] : undefined;
}
export function validBackground(value?: string | null, gradient = false): boolean {
 return !value || Object.hasOwn(palette, value) || /^#[0-9a-f]{6}$/i.test(value) || (gradient && !!gradientColors(value));
}
export function pageBackgroundStyle(page: { backgroundColor?: string; backgroundImage?: string; backgroundMobileColor?:string }): CSSProperties {
 const gradient = gradientColors(page.backgroundColor);
 const mobileGradient=gradientColors(page.backgroundMobileColor);
 const image = page.backgroundImage ? `url(${JSON.stringify(page.backgroundImage)})` : undefined;
 return {
  '--page-mobile-color':mobileGradient?.[0]||resolveColor(page.backgroundMobileColor),
  '--page-mobile-image':mobileGradient?page.backgroundMobileColor:'none',
  backgroundColor: gradient ? gradient[0] : resolveColor(page.backgroundColor),
  backgroundImage: [image, gradient ? page.backgroundColor : undefined].filter(Boolean).join(', ') || undefined,
  backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundAttachment: 'scroll',
 } as CSSProperties;
}

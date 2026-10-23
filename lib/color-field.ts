import type { TextField } from 'payload';
import { validBackground } from './background';
export function colorField(name: string, label: string, gradient = false): TextField {
 return { name, label, type: 'text', defaultValue: 'transparent',
  validate: (value: string | null | undefined) => validBackground(value, gradient) || 'Inserisci un colore HEX di sei cifre, per esempio #7235E8.',
  admin: { components: { Field: { path: '/components/admin/ColorField#ColorField', clientProps: { label, gradient,...(/badgeTextColor$/i.test(name)?{transparentLabel:'Automatico / contrasto'}:{}) } } } },
 };
}

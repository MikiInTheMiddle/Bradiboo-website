'use client';
import { useRowLabel } from '@payloadcms/ui';
export function BlockTitle({ blockLabel }: { blockLabel?: string }) {
  const { data, rowNumber } = useRowLabel<{ title?: string; label?: string; blockType?: string }>();
  const title = data?.title?.trim() || data?.label?.trim() || 'Nuovo blocco';
  return <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <span style={{ opacity: .6 }}>{String((rowNumber ?? 0) + 1).padStart(2, '0')}</span>
    <span style={{ border: '1px solid currentColor', borderRadius: 4, padding: '2px 7px', fontSize: 12 }}>{blockLabel || data?.blockType || 'Modulo'}</span>
    <strong>{title}</strong>
  </span>;
}

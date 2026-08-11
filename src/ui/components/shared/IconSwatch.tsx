import { colorForId } from '@/utils/rng';

interface IconSwatchProps {
  name: string;
  textureKey: string;
  shape?: 'circle' | 'square';
  size?: number;
}

/**
 * A placeholder icon/portrait: initials on a color deterministically
 * derived from the content textureKey. No art files needed for the MVP —
 * swapping in real art later means rendering an <img src> keyed off the
 * same textureKey string instead, with no change needed at call sites.
 */
export function IconSwatch({ name, textureKey, shape = 'circle', size = 48 }: IconSwatchProps) {
  const initials =
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join('') || '?';

  return (
    <div
      className={`icon-swatch icon-swatch--${shape}`}
      style={{ width: size, height: size, background: colorForId(textureKey), fontSize: size * 0.4 }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

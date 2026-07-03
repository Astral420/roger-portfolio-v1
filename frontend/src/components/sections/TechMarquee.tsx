import {
  Atom,
  Braces,
  Cloud,
  Code2,
  Container,
  Database,
  FileCode2,
  Flame,
  GitBranch,
  Layers,
  Palette,
  Rocket,
  Server,
  Smartphone,
  Terminal,
  Wind,
  type LucideIcon,
} from 'lucide-react';
import { GithubMark } from '../ui/BrandIcons';
import { techRowOne, techRowTwo } from '../../data/techStack';
import type { TechItem } from '../../types';
import { useReducedMotionPreference } from '../../hooks/useReducedMotion';

const ICONS: Record<string, LucideIcon> = {
  Atom,
  Smartphone,
  FileCode2,
  Braces,
  Layers,
  Code2,
  Database,
  Container,
  GitBranch,
  Terminal,
  Wind,
  Flame,
  Rocket,
  Cloud,
  Server,
  Palette,
};

function Tile({ item }: { item: TechItem }) {
  const isGithub = item.icon === 'Github';
  const Icon = ICONS[item.icon] ?? Code2;

  return (
    <li
      className="group flex shrink-0 items-center gap-2.5 rounded-2xl border border-border/8 bg-primary/[0.025] px-5 py-3.5 backdrop-blur-md transition-all duration-300 ease-premium hover:scale-[1.08] hover:border-border/20 hover:bg-primary/[0.05]"
      style={{ boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.03)' }}
    >
      {isGithub ? (
        <GithubMark size={17} className="text-secondary transition-colors group-hover:text-accent-from" />
      ) : (
        <Icon size={17} strokeWidth={1.6} className="text-secondary transition-colors group-hover:text-accent-from" />
      )}
      <span className="whitespace-nowrap text-sm text-secondary transition-colors group-hover:text-primary">
        {item.name}
      </span>
    </li>
  );
}

function MarqueeRow({ items, direction }: { items: TechItem[]; direction: 'left' | 'right' }) {
  const reducedMotion = useReducedMotionPreference();
  // Duplicate the list so the 50%-translate loop is seamless.
  const doubled = [...items, ...items];
  const animationClass = direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right';

  return (
    <div className="mask-edge-x overflow-hidden">
      <ul
        className={`flex w-max gap-3 py-1 ${reducedMotion ? '' : animationClass}`}
        style={reducedMotion ? { transform: 'translateX(0)' } : undefined}
      >
        {doubled.map((item, i) => (
          <Tile key={`${item.name}-${i}`} item={item} />
        ))}
      </ul>
    </div>
  );
}

export function TechMarquee() {
  return (
    <div className="flex flex-col gap-3" role="list" aria-label="Technologies I work with">
      <MarqueeRow items={techRowOne} direction="left" />
      <MarqueeRow items={techRowTwo} direction="right" />
    </div>
  );
}

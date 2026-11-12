import { normalizeTechstackName, type TechstackGroup, type TechstackItem } from '@apis/techstacks';
import type { PositionKey } from '@constants/position-tech-stack';

export const TAB_LABEL: Record<PositionKey, string> = {
  frontend: '프론트엔드',
  backend: '백엔드',
  infra: '인프라',
};

export const TAB_GROUP_NAME: Record<PositionKey, string> = {
  frontend: 'FRONTEND',
  backend: 'BACKEND',
  infra: 'INFRA',
};

const GENRE_LABEL_BY_TAB: Record<PositionKey, Record<string, string>> = {
  frontend: {
    LANGUAGE: '언어/프레임워크',
    FRAMEWORK: '언어/프레임워크',
    LANGUAGE_FRAMEWORK: '언어/프레임워크',
    MOBILE: '모바일',
  },
  backend: {
    LANGUAGE: '언어',
    FRAMEWORK: '프레임워크',
    DATABASE: '데이터베이스',
  },
  infra: {
    CLOUD: '클라우드',
    CONTAINER: '컨테이너',
  },
};

const GENRE_ORDER_BY_TAB: Record<PositionKey, string[]> = {
  frontend: ['LANGUAGE_FRAMEWORK', 'MOBILE'],
  backend: ['LANGUAGE', 'FRAMEWORK', 'DATABASE'],
  infra: ['CLOUD', 'CONTAINER'],
};

export const buildGenreGroups = (tab: PositionKey, group: TechstackGroup | undefined) => {
  if (!group) return [] as Array<{ key: string; label: string; items: TechstackItem[] }>;

  const genreMap = new Map<string, TechstackItem[]>();

  group.list.forEach((item) => {
    const rawGenre = normalizeTechstackName(item.genre);
    const mergedGenre =
      tab === 'frontend' && (rawGenre === 'LANGUAGE' || rawGenre === 'FRAMEWORK')
        ? 'LANGUAGE_FRAMEWORK'
        : rawGenre;

    const current = genreMap.get(mergedGenre) ?? [];
    current.push(item);
    genreMap.set(mergedGenre, current);
  });

  const order = GENRE_ORDER_BY_TAB[tab];
  const labelByGenre = GENRE_LABEL_BY_TAB[tab];

  const knownGroups = order
    .filter((genre) => (genreMap.get(genre)?.length ?? 0) > 0)
    .map((genre) => ({
      key: genre,
      label: labelByGenre[genre] ?? genre,
      items: genreMap.get(genre) ?? [],
    }));

  const customGroups = Array.from(genreMap.entries())
    .filter(([genre]) => !order.includes(genre))
    .map(([genre, items]) => ({
      key: genre,
      label: labelByGenre[genre] ?? genre,
      items,
    }));

  return [...knownGroups, ...customGroups];
};

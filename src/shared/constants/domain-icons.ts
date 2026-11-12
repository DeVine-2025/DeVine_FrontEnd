import {
  CreditCard,
  Gamepad2,
  GraduationCap,
  HeartPulse,
  Layers,
  LayoutGrid,
  ShoppingCart,
  UsersRound,
} from 'lucide-react';
import type { Domain } from './domain';

export const DOMAIN_ICONS = {
  교육: GraduationCap,
  '소셜/커뮤니티': UsersRound,
  엔터테인먼트: Gamepad2,
  'AI/데이터': Layers,
  헬스케어: HeartPulse,
  핀테크: CreditCard,
  이커머스: ShoppingCart,
  기타: LayoutGrid,
} satisfies Record<Domain, typeof Layers>;

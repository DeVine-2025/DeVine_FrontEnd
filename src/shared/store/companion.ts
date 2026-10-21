import { create } from 'zustand';

export { companionModeLabels } from '../components/companion/companion-mode';
export type { CompanionMode } from '../components/companion/companion-mode';

export const useCompanionStore = create<{
  successVersion: number;
  interaction: { kind: 'card' | 'bookmark'; version: number; at: number };
  reactTo: (kind: 'card' | 'bookmark') => void;
  celebrate: () => void;
}>((set) => ({
  successVersion: 0,
  interaction: { kind: 'card', version: 0, at: 0 },
  reactTo: (kind) => set(state => Date.now() - state.interaction.at < 750 ? state : ({ interaction: { kind, version: state.interaction.version + 1, at: Date.now() } })),
  celebrate: () => set(state => ({ successVersion: state.successVersion + 1 })),
}));

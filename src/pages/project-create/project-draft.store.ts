import { createStore, type StateCreator } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type RecruitmentItem = {
  id: string;
  positionLabel: string;
  countLabel: string;
  techStackKeys: string[];
};

export type SlotImage = { imageId: number; imageUrl: string } | null;

export interface ProjectDraftState {
  locationText: string;
  deadlineText: string;
  projectTitle: string;
  projectContent: string;
  projectFeatures: string;
  projectType: string | null;
  domain: string | null;
  progressType: string | null;
  progressPeriod: string | null;
  recruitPosition: string | null;
  recruitCount: string | null;
  techStack: string[];
  recruitments: RecruitmentItem[];
  slotImages: [SlotImage, SlotImage, SlotImage];

  setLocationText: (v: string) => void;
  setDeadlineText: (v: string) => void;
  setProjectTitle: (v: string) => void;
  setProjectContent: (v: string) => void;
  setProjectFeatures: (v: string) => void;
  setProjectType: (v: string | null) => void;
  setDomain: (v: string | null) => void;
  setProgressType: (v: string | null) => void;
  setProgressPeriod: (v: string | null) => void;
  setRecruitPosition: (v: string | null) => void;
  setRecruitCount: (v: string | null) => void;
  setTechStack: (v: string[] | ((prev: string[]) => string[])) => void;
  setRecruitments: (v: RecruitmentItem[] | ((prev: RecruitmentItem[]) => RecruitmentItem[])) => void;
  setSlotImages: (v: [SlotImage, SlotImage, SlotImage] | ((prev: [SlotImage, SlotImage, SlotImage]) => [SlotImage, SlotImage, SlotImage])) => void;

  clearDraft: () => void;
}

const defaultSlotImages: [SlotImage, SlotImage, SlotImage] = [null, null, null];

const defaultState = {
  locationText: '',
  deadlineText: '',
  projectTitle: '',
  projectContent: '',
  projectFeatures: '',
  projectType: null as string | null,
  domain: null as string | null,
  progressType: null as string | null,
  progressPeriod: null as string | null,
  recruitPosition: null as string | null,
  recruitCount: null as string | null,
  techStack: [] as string[],
  recruitments: [] as RecruitmentItem[],
  slotImages: defaultSlotImages,
};

const initializeDraft: StateCreator<ProjectDraftState> = (set) => ({
  ...defaultState,

  setLocationText: (v) => set({ locationText: v }),
  setDeadlineText: (v) => set({ deadlineText: v }),
  setProjectTitle: (v) => set({ projectTitle: v }),
  setProjectContent: (v) => set({ projectContent: v }),
  setProjectFeatures: (v) => set({ projectFeatures: v }),
  setProjectType: (v) => set({ projectType: v }),
  setDomain: (v) => set({ domain: v }),
  setProgressType: (v) => set({ progressType: v }),
  setProgressPeriod: (v) => set({ progressPeriod: v }),
  setRecruitPosition: (v) => set({ recruitPosition: v }),
  setRecruitCount: (v) => set({ recruitCount: v }),
  setTechStack: (v) =>
    set((s) => ({
      techStack: typeof v === 'function' ? v(s.techStack) : v,
    })),
  setRecruitments: (v) =>
    set((s) => ({
      recruitments: typeof v === 'function' ? v(s.recruitments) : v,
    })),
  setSlotImages: (v) =>
    set((s) => ({
      slotImages: typeof v === 'function' ? v(s.slotImages) : v,
    })),

  clearDraft: () => set(defaultState),
});

export function createProjectDraftStore(ownerId?: string) {
  if (!ownerId) return createStore<ProjectDraftState>()(initializeDraft);

  return createStore<ProjectDraftState>()(
    persist(initializeDraft, {
      name: `project-create-draft:${ownerId}`,
      storage: createJSONStorage(() => localStorage),
    }),
  );
}

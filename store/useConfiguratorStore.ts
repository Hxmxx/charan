import { create } from 'zustand';
import { DEFAULT_COLOR_ID } from '@/lib/constants/colors';

interface ConfiguratorState {
    // Paint
    colorId: string;
    setColorId: (id: string) => void;
}

export const useConfiguratorStore = create<ConfiguratorState>((set) => ({
    colorId: DEFAULT_COLOR_ID,
    setColorId: (id) => set({ colorId: id })
}))
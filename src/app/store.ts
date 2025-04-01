# Podcast Generator MVP - Redux Store

import { createSlice, configureStore, PayloadAction } from '@reduxjs/toolkit';
import { PodcastPackage } from '../../libs/src/lib/models/delivery.model';

// Define the state interface
interface PodcastState {
  isGenerating: boolean;
  currentStep: string;
  progress: number;
  result: PodcastPackage | null;
  error: string | null;
}

// Initial state
const initialState: PodcastState = {
  isGenerating: false,
  currentStep: '',
  progress: 0,
  result: null,
  error: null
};

// Create the slice
const podcastSlice = createSlice({
  name: 'podcast',
  initialState,
  reducers: {
    startGeneration: (state) => {
      state.isGenerating = true;
      state.currentStep = 'Initializing pipeline...';
      state.progress = 0;
      state.result = null;
      state.error = null;
    },
    updateProgress: (state, action: PayloadAction<{ step: string; progress: number }>) => {
      state.currentStep = action.payload.step;
      state.progress = action.payload.progress;
    },
    generationSuccess: (state, action: PayloadAction<PodcastPackage>) => {
      state.isGenerating = false;
      state.currentStep = 'Podcast generation complete!';
      state.progress = 100;
      state.result = action.payload;
    },
    generationFailure: (state, action: PayloadAction<string>) => {
      state.isGenerating = false;
      state.currentStep = 'Error';
      state.error = action.payload;
    },
    resetState: (state) => {
      state.isGenerating = false;
      state.currentStep = '';
      state.progress = 0;
      state.result = null;
      state.error = null;
    }
  }
});

// Export actions
export const { 
  startGeneration, 
  updateProgress, 
  generationSuccess, 
  generationFailure,
  resetState
} = podcastSlice.actions;

// Configure the store
export const store = configureStore({
  reducer: {
    podcast: podcastSlice.reducer
  }
});

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

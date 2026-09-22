import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from './uiStore';

describe('uiStore (UI state management)', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useUIStore.setState({
      showSidePanel: true,
      showPropertiesPanel: true,
      timelineZoom: 1,
      playbackRate: 1,
      isPlaying: false,
      isRecording: false,
    });
  });

  describe('initial state', () => {
    it('should have correct default values', () => {
      const state = useUIStore.getState();

      expect(state.showSidePanel).toBe(true);
      expect(state.showPropertiesPanel).toBe(true);
      expect(state.timelineZoom).toBe(1);
      expect(state.playbackRate).toBe(1);
      expect(state.isPlaying).toBe(false);
      expect(state.isRecording).toBe(false);
    });
  });

  describe('toggleSidePanel', () => {
    it('should toggle showSidePanel from true to false', () => {
      const store = useUIStore.getState();

      expect(store.showSidePanel).toBe(true);

      store.toggleSidePanel();

      expect(useUIStore.getState().showSidePanel).toBe(false);
    });

    it('should toggle showSidePanel from false to true', () => {
      useUIStore.setState({ showSidePanel: false });

      const store = useUIStore.getState();
      store.toggleSidePanel();

      expect(useUIStore.getState().showSidePanel).toBe(true);
    });

    it('should toggle multiple times', () => {
      const store = useUIStore.getState();

      store.toggleSidePanel();
      expect(useUIStore.getState().showSidePanel).toBe(false);

      store.toggleSidePanel();
      expect(useUIStore.getState().showSidePanel).toBe(true);

      store.toggleSidePanel();
      expect(useUIStore.getState().showSidePanel).toBe(false);
    });
  });

  describe('togglePropertiesPanel', () => {
    it('should toggle showPropertiesPanel from true to false', () => {
      const store = useUIStore.getState();

      expect(store.showPropertiesPanel).toBe(true);

      store.togglePropertiesPanel();

      expect(useUIStore.getState().showPropertiesPanel).toBe(false);
    });

    it('should toggle showPropertiesPanel from false to true', () => {
      useUIStore.setState({ showPropertiesPanel: false });

      const store = useUIStore.getState();
      store.togglePropertiesPanel();

      expect(useUIStore.getState().showPropertiesPanel).toBe(true);
    });
  });

  describe('setTimelineZoom', () => {
    it('should set timeline zoom to valid value', () => {
      const store = useUIStore.getState();

      store.setTimelineZoom(2);

      expect(useUIStore.getState().timelineZoom).toBe(2);
    });

    it('should clamp zoom to minimum 0.1', () => {
      const store = useUIStore.getState();

      store.setTimelineZoom(0.05);

      expect(useUIStore.getState().timelineZoom).toBe(0.1);
    });

    it('should clamp zoom to maximum 10', () => {
      const store = useUIStore.getState();

      store.setTimelineZoom(15);

      expect(useUIStore.getState().timelineZoom).toBe(10);
    });

    it('should accept boundary values', () => {
      const store = useUIStore.getState();

      store.setTimelineZoom(0.1);
      expect(useUIStore.getState().timelineZoom).toBe(0.1);

      store.setTimelineZoom(10);
      expect(useUIStore.getState().timelineZoom).toBe(10);
    });

    it('should handle negative values', () => {
      const store = useUIStore.getState();

      store.setTimelineZoom(-5);

      expect(useUIStore.getState().timelineZoom).toBe(0.1);
    });
  });

  describe('setPlaybackRate', () => {
    it('should set playback rate to valid value', () => {
      const store = useUIStore.getState();

      store.setPlaybackRate(1.5);

      expect(useUIStore.getState().playbackRate).toBe(1.5);
    });

    it('should set playback rate to 0.5x', () => {
      const store = useUIStore.getState();

      store.setPlaybackRate(0.5);

      expect(useUIStore.getState().playbackRate).toBe(0.5);
    });

    it('should set playback rate to 2x', () => {
      const store = useUIStore.getState();

      store.setPlaybackRate(2);

      expect(useUIStore.getState().playbackRate).toBe(2);
    });
  });

  describe('togglePlayback', () => {
    it('should toggle isPlaying from false to true', () => {
      const store = useUIStore.getState();

      expect(store.isPlaying).toBe(false);

      store.togglePlayback();

      expect(useUIStore.getState().isPlaying).toBe(true);
    });

    it('should toggle isPlaying from true to false', () => {
      useUIStore.setState({ isPlaying: true });

      const store = useUIStore.getState();
      store.togglePlayback();

      expect(useUIStore.getState().isPlaying).toBe(false);
    });

    it('should toggle multiple times', () => {
      const store = useUIStore.getState();

      store.togglePlayback();
      expect(useUIStore.getState().isPlaying).toBe(true);

      store.togglePlayback();
      expect(useUIStore.getState().isPlaying).toBe(false);

      store.togglePlayback();
      expect(useUIStore.getState().isPlaying).toBe(true);
    });
  });

  describe('startRecording', () => {
    it('should set isRecording to true', () => {
      const store = useUIStore.getState();

      expect(store.isRecording).toBe(false);

      store.startRecording();

      expect(useUIStore.getState().isRecording).toBe(true);
    });

    it('should stop playback when recording starts', () => {
      useUIStore.setState({ isPlaying: true });

      const store = useUIStore.getState();
      store.startRecording();

      expect(useUIStore.getState().isRecording).toBe(true);
      expect(useUIStore.getState().isPlaying).toBe(false);
    });

    it('should be idempotent when called multiple times', () => {
      const store = useUIStore.getState();

      store.startRecording();
      expect(useUIStore.getState().isRecording).toBe(true);

      store.startRecording();
      expect(useUIStore.getState().isRecording).toBe(true);
    });
  });

  describe('stopRecording', () => {
    it('should set isRecording to false', () => {
      useUIStore.setState({ isRecording: true });

      const store = useUIStore.getState();
      store.stopRecording();

      expect(useUIStore.getState().isRecording).toBe(false);
    });

    it('should be idempotent when called multiple times', () => {
      useUIStore.setState({ isRecording: true });

      const store = useUIStore.getState();

      store.stopRecording();
      expect(useUIStore.getState().isRecording).toBe(false);

      store.stopRecording();
      expect(useUIStore.getState().isRecording).toBe(false);
    });
  });

  describe('recording and playback interaction', () => {
    it('should not allow recording and playing simultaneously', () => {
      const store = useUIStore.getState();

      store.togglePlayback();
      expect(useUIStore.getState().isPlaying).toBe(true);

      store.startRecording();
      expect(useUIStore.getState().isRecording).toBe(true);
      expect(useUIStore.getState().isPlaying).toBe(false);
    });

    it('should allow playback after stopping recording', () => {
      const store = useUIStore.getState();

      store.startRecording();
      store.stopRecording();
      store.togglePlayback();

      expect(useUIStore.getState().isRecording).toBe(false);
      expect(useUIStore.getState().isPlaying).toBe(true);
    });
  });

  describe('state independence', () => {
    it('should update zoom without affecting other state', () => {
      const store = useUIStore.getState();

      store.setTimelineZoom(5);

      expect(useUIStore.getState().timelineZoom).toBe(5);
      expect(useUIStore.getState().showSidePanel).toBe(true);
      expect(useUIStore.getState().isPlaying).toBe(false);
    });

    it('should toggle panels independently', () => {
      const store = useUIStore.getState();

      store.toggleSidePanel();
      expect(useUIStore.getState().showSidePanel).toBe(false);
      expect(useUIStore.getState().showPropertiesPanel).toBe(true);

      store.togglePropertiesPanel();
      expect(useUIStore.getState().showSidePanel).toBe(false);
      expect(useUIStore.getState().showPropertiesPanel).toBe(false);
    });
  });
});

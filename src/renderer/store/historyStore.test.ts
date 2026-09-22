import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useHistoryStore } from './historyStore';
import { useProjectStore } from './projectStore';

describe('historyStore (undo/redo)', () => {
  beforeEach(() => {
    // Reset stores before each test
    useHistoryStore.setState({
      past: [],
      future: [],
      canUndo: false,
      canRedo: false,
    });

    useProjectStore.setState({
      projectName: 'Test Project',
      projectPath: null,
      isDirty: false,
      mediaFiles: [],
      tracks: [],
      currentTime: 0,
      duration: 0,
      selectedClipId: null,
    });
  });

  describe('saveState', () => {
    it('should save current project state to history', () => {
      const store = useHistoryStore.getState();
      const projectStore = useProjectStore.getState();

      projectStore.projectName = 'Modified Project';
      useProjectStore.setState(projectStore);

      store.saveState();

      const { past, canUndo, canRedo } = useHistoryStore.getState();
      expect(past.length).toBe(1);
      expect(canUndo).toBe(true);
      expect(canRedo).toBe(false);
      expect(past[0].projectName).toBe('Modified Project');
    });

    it('should clear future when saving a new state', () => {
      const store = useHistoryStore.getState();

      store.saveState();
      store.saveState();
      store.undo();

      expect(useHistoryStore.getState().future.length).toBe(1);

      store.saveState();

      const { future, canRedo } = useHistoryStore.getState();
      expect(future.length).toBe(0);
      expect(canRedo).toBe(false);
    });

    it('should limit history to MAX_HISTORY (50) entries', () => {
      const store = useHistoryStore.getState();

      for (let i = 0; i < 60; i++) {
        useProjectStore.setState({ projectName: `Project ${i}` });
        store.saveState();
      }

      const { past } = useHistoryStore.getState();
      expect(past.length).toBe(50);
      expect(past[0].projectName).toBe('Project 10');
      expect(past[49].projectName).toBe('Project 59');
    });

    it('should deep clone state to avoid mutations', () => {
      const mediaFile = { id: '1', path: '/test.mp4', name: 'test.mp4', type: 'video' as const, duration: 10 };
      useProjectStore.setState({
        mediaFiles: [mediaFile],
      });

      const store = useHistoryStore.getState();
      store.saveState();

      const savedState = useHistoryStore.getState().past[0];
      
      // Modify the current state
      useProjectStore.setState({
        mediaFiles: [{ ...mediaFile, name: 'modified.mp4' }],
      });

      // The saved state should still have the original name
      expect(savedState.mediaFiles[0].name).toBe('test.mp4');
    });
  });

  describe('undo', () => {
    it('should restore previous state', () => {
      const projectStore = useProjectStore.getState();
      const store = useHistoryStore.getState();

      projectStore.projectName = 'State 1';
      useProjectStore.setState(projectStore);
      store.saveState();

      projectStore.projectName = 'State 2';
      useProjectStore.setState(projectStore);

      store.undo();

      expect(useProjectStore.getState().projectName).toBe('State 1');
    });

    it('should move current state to future', () => {
      const store = useHistoryStore.getState();

      store.saveState();
      useProjectStore.setState({ projectName: 'Modified' });
      store.undo();

      const { future, canRedo } = useHistoryStore.getState();
      expect(future.length).toBe(1);
      expect(future[0].projectName).toBe('Modified');
      expect(canRedo).toBe(true);
    });

    it('should do nothing if past is empty', () => {
      const store = useHistoryStore.getState();
      const projectState = useProjectStore.getState();

      expect(store.past.length).toBe(0);

      store.undo();

      expect(useProjectStore.getState()).toEqual(projectState);
    });

    it('should update canUndo and canRedo flags correctly', () => {
      const store = useHistoryStore.getState();

      store.saveState();
      store.saveState();

      store.undo();
      expect(useHistoryStore.getState().canUndo).toBe(true);
      expect(useHistoryStore.getState().canRedo).toBe(true);

      store.undo();
      expect(useHistoryStore.getState().canUndo).toBe(false);
      expect(useHistoryStore.getState().canRedo).toBe(true);
    });

    it('should mark project as dirty after undo', () => {
      const store = useHistoryStore.getState();

      store.saveState();
      useProjectStore.setState({ isDirty: false });

      store.undo();

      expect(useProjectStore.getState().isDirty).toBe(true);
    });
  });

  describe('redo', () => {
    it('should restore next state from future', () => {
      const store = useHistoryStore.getState();

      useProjectStore.setState({ projectName: 'State 1' });
      store.saveState();
      useProjectStore.setState({ projectName: 'State 2' });

      store.undo();
      expect(useProjectStore.getState().projectName).toBe('State 1');

      store.redo();
      expect(useProjectStore.getState().projectName).toBe('State 2');
    });

    it('should move current state to past', () => {
      const store = useHistoryStore.getState();

      store.saveState();
      store.saveState();
      store.undo();

      const pastLengthBefore = useHistoryStore.getState().past.length;
      store.redo();

      expect(useHistoryStore.getState().past.length).toBe(pastLengthBefore + 1);
    });

    it('should do nothing if future is empty', () => {
      const store = useHistoryStore.getState();
      const projectState = useProjectStore.getState();

      expect(store.future.length).toBe(0);

      store.redo();

      expect(useProjectStore.getState()).toEqual(projectState);
    });

    it('should update canUndo and canRedo flags correctly', () => {
      const store = useHistoryStore.getState();

      store.saveState();
      store.saveState();
      store.undo();
      store.undo();

      expect(useHistoryStore.getState().canUndo).toBe(false);
      expect(useHistoryStore.getState().canRedo).toBe(true);

      store.redo();
      expect(useHistoryStore.getState().canUndo).toBe(true);
      expect(useHistoryStore.getState().canRedo).toBe(true);

      store.redo();
      expect(useHistoryStore.getState().canUndo).toBe(true);
      expect(useHistoryStore.getState().canRedo).toBe(false);
    });

    it('should mark project as dirty after redo', () => {
      const store = useHistoryStore.getState();

      store.saveState();
      store.saveState();
      store.undo();
      useProjectStore.setState({ isDirty: false });

      store.redo();

      expect(useProjectStore.getState().isDirty).toBe(true);
    });
  });

  describe('clearHistory', () => {
    it('should reset history state', () => {
      const store = useHistoryStore.getState();

      store.saveState();
      store.saveState();
      store.undo();

      expect(useHistoryStore.getState().past.length).toBeGreaterThan(0);

      store.clearHistory();

      const { past, future, canUndo, canRedo } = useHistoryStore.getState();
      expect(past.length).toBe(0);
      expect(future.length).toBe(0);
      expect(canUndo).toBe(false);
      expect(canRedo).toBe(false);
    });
  });

  describe('undo/redo integration', () => {
    it('should handle multiple undo/redo cycles', () => {
      const store = useHistoryStore.getState();

      useProjectStore.setState({ projectName: 'State 1' });
      store.saveState();
      useProjectStore.setState({ projectName: 'State 2' });
      store.saveState();
      useProjectStore.setState({ projectName: 'State 3' });

      store.undo();
      expect(useProjectStore.getState().projectName).toBe('State 2');

      store.undo();
      expect(useProjectStore.getState().projectName).toBe('State 1');

      store.redo();
      expect(useProjectStore.getState().projectName).toBe('State 2');

      store.redo();
      expect(useProjectStore.getState().projectName).toBe('State 3');
    });

    it('should handle complex state changes', () => {
      const store = useHistoryStore.getState();
      const mediaFile = {
        id: '1',
        path: '/test.mp4',
        name: 'test.mp4',
        type: 'video' as const,
        duration: 10,
      };

      // Save initial empty state
      store.saveState();

      // Add media file through store action which triggers saveState internally
      useProjectStore.getState().addMediaFile(mediaFile);

      expect(useProjectStore.getState().mediaFiles.length).toBe(1);

      // Undo should restore to empty state
      store.undo();
      expect(useProjectStore.getState().mediaFiles.length).toBe(0);

      // Redo should restore the media file
      store.redo();
      expect(useProjectStore.getState().mediaFiles.length).toBe(1);
      expect(useProjectStore.getState().mediaFiles[0].name).toBe('test.mp4');
    });
  });
});

import { describe, it, expect } from 'vitest';
import documentsReducer, {
  addDocument,
  updateDocument,
  deleteDocument,
  duplicateDocument,
  setActiveDocId,
} from './documentsSlice';

describe('documentsSlice', () => {
  const initialState = {
    list: [
      { id: 'doc1', name: 'Test Doc', date: '01.01.2026', created: '01.01.2026', rows: 100, cols: 26 }
    ],
    activeDocId: null,
    loading: false,
    error: null,
  };

  it('addDocument adds new document', () => {
    const newDoc = {
      id: 'doc2',
      name: 'New Doc',
      date: '02.01.2026',
      created: '02.01.2026',
      rows: 50,
      cols: 10
    };
    const state = documentsReducer(initialState, addDocument(newDoc));
    expect(state.list.length).toBe(2);
    expect(state.list[1]).toEqual(newDoc);
  });

  it('updateDocument updates document name', () => {
    const state = documentsReducer(initialState, updateDocument({ id: 'doc1', name: 'Updated Name' }));
    expect(state.list[0].name).toBe('Updated Name');
  });

  it('deleteDocument removes document', () => {
    const state = documentsReducer(initialState, deleteDocument('doc1'));
    expect(state.list.length).toBe(0);
  });

  it('duplicateDocument creates copy', () => {
    const state = documentsReducer(initialState, duplicateDocument({
      oldId: 'doc1',
      newId: 'doc2',
      newName: 'Test Doc (копия)'
    }));
    expect(state.list.length).toBe(2);
    expect(state.list[1].name).toBe('Test Doc (копия)');
  });

  it('setActiveDocId sets active document', () => {
    const state = documentsReducer(initialState, setActiveDocId('doc1'));
    expect(state.activeDocId).toBe('doc1');
  });
});

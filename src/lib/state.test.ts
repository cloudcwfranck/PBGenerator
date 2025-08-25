import { describe, expect, it } from 'vitest';
import { encodeState, decodeState, type AppState } from './state';

describe('state url round-trip', () => {
  it('encodes and decodes', () => {
    const state: AppState = {
      provider: 'aws',
      workload: 'application',
      practice: 'commercial',
      runner: 'actions',
      addons: ['sast', 'sbom'],
    };
    const qs = encodeState(state);
    const decoded = decodeState(qs);
    expect(encodeState(decoded as AppState)).toBe(qs);
  });
});

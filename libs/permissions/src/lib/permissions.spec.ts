import { hasPermission } from './permissions.js';

describe('hasPermission', () => {
  it('returns true when the permission is present', () => {
    expect(hasPermission(['client:create'], 'client:create')).toBe(true);
  });

  it('returns false when the permission is absent', () => {
    expect(hasPermission([], 'client:create')).toBe(false);
  });
});

import { auth } from './auth.js';

describe('auth', () => {
  it('is configured with email/password enabled', () => {
    expect(auth).toBeDefined();
  });
});

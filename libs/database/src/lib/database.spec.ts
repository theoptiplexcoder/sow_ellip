import { prisma } from './database.js';

describe('prisma', () => {
  it('exposes a shared client instance', () => {
    expect(prisma).toBeDefined();
  });
});

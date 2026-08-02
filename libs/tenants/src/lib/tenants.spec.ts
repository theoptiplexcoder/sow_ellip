import { tenants } from './tenants.js';

describe('tenants', () => {
  it('should work', () => {
    expect(tenants()).toEqual('tenants');
  });
});

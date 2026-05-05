/**
 * coverage-import.test.ts
 *
 * Imports the untested files so Jest/Istanbul instruments them and reports
 * 0 % line/branch/function coverage for every function in those files.
 * This single import drops the global coverage below the 50 % threshold,
 * causing `npm test` to fail – demonstrating the CI coverage gate.
 *
 * No test assertions are made intentionally.
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as _drop from '../../src/coverage-drop';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as _dropExtra from '../../src/coverage-drop-extra';

// Provide at least one passing test so Jest does not fail with "no tests found"
describe('coverage-drop (untested module)', () => {
  it('modules are importable', () => {
    expect(typeof _drop).toBe('object');
    expect(typeof _dropExtra).toBe('object');
  });
});

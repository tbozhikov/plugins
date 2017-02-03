import { t } from '../../test/index';
import { Helper } from './helper';

export function main() {
  t.describe('progress: Helper', () => {

    t.it('Sample', () => {
      t.e(Helper.Sample()).toBe(false);
    });
  });
}

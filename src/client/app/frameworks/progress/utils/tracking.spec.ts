import { t } from '../../test/index';
import { Tracking } from './tracking';

export function main() {
  t.describe('progress: Tracking', () => {

    t.it('Categories', () => {
      t.e(Object.keys(Tracking.Categories).length).toBe(1);
    });

    t.it('Actions', () => {
      t.e(Object.keys(Tracking.Actions).length).toBe(5);
    });
  });
}

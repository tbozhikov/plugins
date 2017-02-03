import { t } from '../../test/index';
import { Text } from './text';

export function main() {
  t.describe('progress: Text', () => {

    t.it('ERRORS', () => {
      t.e(Object.keys(Text.ERRORS).length).toBe(2);
    });
  });
}

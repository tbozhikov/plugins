
import { TestBed } from '@angular/core/testing';
import { t } from '../../test/index';
import { FileSizePipe } from './file-size.pipe';

export function main() {
  t.describe('FileSizePipe', () => {
    let pipe: FileSizePipe;

    //setup
    t.be(() => {
      TestBed.configureTestingModule({});
      pipe = new FileSizePipe();
    });

    //specs
    t.it('file size', () => {
      t.e(pipe.transform(123456)).toBe(`121 KB`);

      t.e(pipe.transform(124)).toBe(`124 Bytes`);

      t.e(pipe.transform(556646464646)).toBe(`518.42 GB`);
    });
  });
}

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'urlShorten' })
export class urlShortenPipe implements PipeTransform {
  transform(value: string): string {
    let res = value.substring(0, 45);
    return res + '...';
  }
}

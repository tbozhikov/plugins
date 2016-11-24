import { Injectable } from '@angular/core';

@Injectable()
export class PluginService {
    plugins: Array<plugin>;
    constructor() { }

    getAll() {
        this.plugins = plugins;
        return this.plugins;
    }

}

export declare class plugin {
  title: string;
  author: string;
  stars: number;
  description: string;
  ios: boolean;
  android: boolean;
  repo: string;
}

var plugins: Array<plugin> = [
  {
    title: 'SQLLite',
    author: 'nathanael',
    stars: 5,
    description: 'A sqlite Nativescript module for ios and android',
    ios: true,
    android: true,
    repo: 'https://github.com/nathanael/sqlite'
  },
  {
    title: 'Shimer',
    author: 'walkerrunpdx',
    stars: 5,
    description: 'Facebook shimer effect plugin',
    ios: true,
    android: true,
    repo: 'https://github.com/walkerrunpdx/shimer'
  },
  {
    title: 'Orientation',
    author: 'nathanael',
    stars: 5,
    description: 'A sqlite Nativescript module for ios and android',
    ios: true,
    android: true,
    repo: 'https://github.com/nathanael/sqlite'
  },
  {
    title: 'CardView',
    author: 'walkerrunpdx',
    stars: 5,
    description: 'Facebook shimer effect plugin',
    ios: true,
    android: true,
    repo: 'https://github.com/walkerrunpdx/shimer'
  },
  {
    title: 'SQLLite',
    author: 'nathanael',
    stars: 5,
    description: 'A sqlite Nativescript module for ios and android',
    ios: true,
    android: true,
    repo: 'https://github.com/nathanael/sqlite'
  },
  {
    title: 'Shimer',
    author: 'walkerrunpdx',
    stars: 5,
    description: 'Facebook shimer effect plugin',
    ios: true,
    android: true,
    repo: 'https://github.com/walkerrunpdx/shimer'
  }
]
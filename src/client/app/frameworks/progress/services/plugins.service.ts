import { Injectable } from '@angular/core';
import { Jsonp, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class PluginService {
    plugins: Array<plugin>;
    constructor(private _jsonp: Jsonp) { }
    /**
     * TODO: Sorting, Filtering, Pageination + HTTP w/ backend API
     * - either with different functions or params to the current getAll() func
     */
    getAll() {
        this.plugins = plugins;
        return this.plugins;
    }

    findPlugin(title: string) {
        for (let plugin of plugins) {
            if (plugin.title == title) {
                return plugin;
            }
        }
        return null;
    }

    search(term: string) {
        if (term === '') {
            return Observable.of([]);
        }

        let wikiUrl = 'https://en.wikipedia.org/w/api.php';
        let params = new URLSearchParams();
        params.set('search', term);
        params.set('action', 'opensearch');
        params.set('format', 'json');
        params.set('callback', 'JSONP_CALLBACK');

        return this._jsonp
            .get(wikiUrl, { search: params })
            .map(response => <string[]>response.json()[1]);
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
    readme: string;
}

var plugins: Array<plugin> = [
    {
        title: 'SQLLite',
        author: 'nathanael',
        stars: 5,
        description: 'A sqlite Nativescript module for ios and android',
        ios: true,
        android: true,
        repo: 'https://github.com/nathanael/sqlite',
        readme: 'This is a `.md` [demo](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet) string.'
    },
    {
        title: 'Shimer',
        author: 'walkerrunpdx',
        stars: 5,
        description: 'Facebook shimer effect plugin',
        ios: true,
        android: true,
        repo: 'https://github.com/walkerrunpdx/shimer',
        readme: 'This is a `.md` [demo](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet) string.'
    },
    {
        title: 'Orientation',
        author: 'nathanael',
        stars: 5,
        description: 'A sqlite Nativescript module for ios and android',
        ios: true,
        android: true,
        repo: 'https://github.com/nathanael/sqlite',
        readme: 'This is a `.md` [demo](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet) string.'
    },
    {
        title: 'CardView',
        author: 'walkerrunpdx',
        stars: 5,
        description: 'Facebook shimer effect plugin',
        ios: true,
        android: true,
        repo: 'https://github.com/walkerrunpdx/shimer',
        readme: 'This is a `.md` [demo](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet) string.'
    },
    {
        title: 'SQLLite',
        author: 'nathanael',
        stars: 5,
        description: 'A sqlite Nativescript module for ios and android',
        ios: true,
        android: true,
        repo: 'https://github.com/nathanael/sqlite',
        readme: 'This is a `.md` [demo](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet) string.'
    },
    {
        title: 'Shimer',
        author: 'walkerrunpdx',
        stars: 5,
        description: 'Facebook shimer effect plugin',
        ios: true,
        android: true,
        repo: 'https://github.com/walkerrunpdx/shimer',
        readme: 'This is a `.md` [demo](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet) string.'
    }
]
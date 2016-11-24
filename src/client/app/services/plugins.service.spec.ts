import { TestBed, async, inject } from '@angular/core/testing';
import { PluginService } from './plugins.service';

describe('Plugins Service', () => {
    let service;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [PluginService],
            providers: [
                PluginService
            ]
        });
    });

    it('should return hardcoded values',
        inject([PluginService], (s: PluginService) => {
            expect(s.getAll()).toBe(s.plugins);
        })
    );
});

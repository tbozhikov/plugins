import { Component, Input, Renderer, HostListener } from '@angular/core';
import {ElementRef, ViewChild} from '@angular/core';

// libs
import { Store } from '@ngrx/store';

// app
import { BasePlugin } from './inherited/base';
import { RouterExtensions } from '../../../core/services/router-extensions.service';

@Component({
  moduleId: module.id,
  selector: 'plugin-box',
  templateUrl: 'plugin-box.component.html'
})
export class PluginBoxComponent extends BasePlugin {
  @Input() plugin;
  @ViewChild('pluginBox') el:ElementRef;

  constructor(public store: Store<any>, public router: RouterExtensions, public renderer: Renderer) {
    super(store, router);
  }

  @HostListener('mouseenter')
  public over() {
    this.renderer.setElementClass(this.el.nativeElement, 'isHovered', true);
  }

  @HostListener('mouseleave')
  public off() {
    this.renderer.setElementClass(this.el.nativeElement, 'isHovered', false);
  }
}

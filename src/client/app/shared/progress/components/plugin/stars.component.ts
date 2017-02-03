import { Component, Input } from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'stars',
  templateUrl: 'stars.component.html'
})
export class StarsComponent {
  @Input() containerClass;
  @Input() plugin;
}

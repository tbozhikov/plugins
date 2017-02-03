import { Component, Input } from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'os-support',
  templateUrl: 'os-support.component.html'
})
export class OSSupportComponent {
  @Input() plugin;
}

import { Component, Input } from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'repo-link',
  templateUrl: 'repo-link.component.html',
  styles: [':host { position: absolute; width: calc(100% - 55px); }']

})
export class RepoLinkComponent {
  @Input() plugin;
}

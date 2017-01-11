import { Component, Input } from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'repo-link',
  templateUrl: 'repo-link.component.html'
})
export class RepoLinkComponent {
  @Input() plugin;
}

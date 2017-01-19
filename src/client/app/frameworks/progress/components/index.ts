import { NavbarComponent } from './site/navbar.component';
import { OSSupportComponent } from './plugin/os-support.component';
import { PluginBoxComponent } from './plugin/plugin-box.component';
import { PluginRowComponent } from './plugin/plugin-row.component';
import { RepoLinkComponent } from './plugin/repo-link.component';
import { StarsComponent } from './plugin/stars.component';
import { ToolbarComponent } from './site/toolbar.component';

export const PROGRESS_COMPONENTS: any[] = [
  NavbarComponent,
  OSSupportComponent,
  PluginBoxComponent,
  PluginRowComponent,
  RepoLinkComponent,
  StarsComponent,
  ToolbarComponent
];

export * from './site/navbar.component';
export * from './plugin/os-support.component';
export * from './plugin/plugin-box.component';
export * from './plugin/plugin-row.component';
export * from './plugin/repo-link.component';
export * from './plugin/stars.component';
export * from './site/toolbar.component';

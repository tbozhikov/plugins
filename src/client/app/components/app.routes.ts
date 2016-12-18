// app
import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { PluginComponent } from './plugin/plugin.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'plugin/:id', component: PluginComponent },
];

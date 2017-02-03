import { AuthService, AUTH_LOCK } from './auth.service';
import { HttpService } from './http.service';
import { ModalService } from './modal.service';
import { PluginService } from './plugins.service';
import { StorageService } from './storage.service';

declare var Auth0Lock: any;
export function authLockFactory() {
  return Auth0Lock;
};

export const PROGRESS_PROVIDERS: any[] = [
  AuthService,
  HttpService,
  ModalService,
  PluginService,
  StorageService,
  { provide: AUTH_LOCK, useFactory: (authLockFactory) }
];

// services
export * from './auth.service';
export * from './http.service';
export * from './modal.service';
export * from './plugins.service';
export * from './storage.service';

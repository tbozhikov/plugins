import { AuthService, AUTH_LOCK } from './auth.service';
import { ModalService } from './modal.service';
import { StorageService } from './storage.service';

declare var Auth0Lock: any;

export const PROGRESS_PROVIDERS: any[] = [
  AuthService,
  ModalService,
  StorageService,
  { provide: AUTH_LOCK, useValue: Auth0Lock }
];

// services
export * from './auth.service';
export * from './modal.service';
export * from './storage.service';

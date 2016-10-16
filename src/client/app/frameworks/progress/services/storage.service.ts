import { Injectable } from '@angular/core';

import { WindowService } from '../../core/index';

declare var localStorage: any;

const PREFIX: string = 'tns-plugins';

interface ISTORAGE_KEYS {
  USER: string;
  RECENT_USERNAME: string;
}

@Injectable()
export class StorageService {
  public static KEYS: ISTORAGE_KEYS = {
    USER: `${PREFIX}-user`,
    RECENT_USERNAME: `${PREFIX}-recent-username`
  };
  private _storageType: any;

  constructor(private win: WindowService) {
    this._storageType = this.win['localStorage'] !== null ? this.win['localStorage'] : null;
  }

  public setItem(key: string, value: any): void {
    try {
      if (this._storageType) {
        this._storageType.setItem(key, JSON.stringify(value));
      }
    } catch(err) {
      console.log(err);
    }
  }

  public getItem(key: string): any {
    try {
      if (this._storageType) {
        let item = this._storageType.getItem(key);
        if (item) {
          return JSON.parse(item);
        }
      }
      return undefined;
    } catch(err) {
      console.log(err);
      return undefined;
    }
  }

  public removeItem(key: string): void {
    try {
      if (this._storageType) {
        this._storageType.removeItem(key);
      }
    } catch(err) {
      console.log(err);
    }
  }
}

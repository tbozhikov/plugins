// angular
import { Injectable, Inject, forwardRef } from '@angular/core';

// module
import { ConsoleService } from './console.service';
import { Config } from '../utils/config';

@Injectable()
export class LogService {

  constructor(@Inject(forwardRef(() => ConsoleService)) public log: ConsoleService) {}

  // debug (standard output)
  public debug(msg: any) {
    if (Config.DEBUG.LEVEL_4) {
      // console.debug does not work on {N} apps... use `log`
      this.log.log(msg);
    }
  }

  // error
  public error(err: any) {
    if (Config.DEBUG.LEVEL_4 || Config.DEBUG.LEVEL_3) {
      this.log.error(err);
    }
  }

  // warn
  public warn(err: any) {
    if (Config.DEBUG.LEVEL_4 || Config.DEBUG.LEVEL_2) {
      this.log.warn(err);
    }
  }

  // info
  public info(err: any) {
    if (Config.DEBUG.LEVEL_4 || Config.DEBUG.LEVEL_1) {
      this.log.info(err);
    }
  }

}

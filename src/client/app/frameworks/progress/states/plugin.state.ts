import { IPlugin } from '../models/plugin.model';

export interface IPluginState {
  list: Array<IPlugin>;
}

export const initialPlugins: IPluginState = {
  list: []
};



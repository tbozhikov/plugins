import { IPlugin } from '../models/plugin.model';

export interface IPluginState {
  list: Array<IPlugin>;
  limit?: number;
  offset?: number;
  orderBy?: string;
  order?: string;
  selected?: IPlugin;
}

export const initialPlugins: IPluginState = {
  list: [],
  limit: 100,
  offset: 0,
  orderBy: 'marketplace_score',
  order: 'desc'
};



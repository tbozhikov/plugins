export interface IPlugin {
  title: string;
  author: string;
  description: string;
  ios: boolean;
  android: boolean;
  stars?: number;
  repo?: string;
  readme?: string;
}

export class PluginModel implements IPlugin {
  public title: string;
  public author: string;
  public description: string;
  public ios: boolean;
  public android: boolean;

  constructor(model?: any) {
    if (model) {
      for (let key in model) {
        this[key] = model[key];
      }
    }
  }
}

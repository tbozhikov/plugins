export interface IPlugin {
  author?: any;
  catalog_date?: string;
  category?: any;
  created_date?: string;
  demo_url?: string;
  description?: string;
  git_stars?: number;
  has_typings?: boolean;
  id?: string;
  internal_notes?: any;
  issues_url?: string;
  keywords?: string;
  language?: string;
  last_updated?: string;
  license?: string;
  marketplace_issues?: string;
  marketplace_score?: number;
  modified_date?: string;
  name?: string;
  npm_downloads?: number;
  os_support?: any;
  other_plugin_info?: number;
  overrides?: any;
  plugin_size?: number;
  processing_count?: number;
  processing_id?: number;
  processing_log?: string;
  processing_status?: number;
  readme?: string;
  repo_site?: string;
  repo_url?: string;
  status?: number;
  user_score?: number;
  version?: string;
}

export class PluginModel implements IPlugin {

  constructor(model?: any) {
    if (model) {
      for (let key in model) {
        this[key] = model[key];
      }
    }
  }
}

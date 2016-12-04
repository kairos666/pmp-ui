import { UUID } from 'angular2-uuid';

/* CONFIG CLASSES */
export class PimpConfig {
  public name:string;
  public id:string;
  public bsOptions:any;
  public pimpCmds:any;
  public plugins:string[];

  constructor (
    name: string,
    targetURL: string,
    keepCookies: boolean,
    port: number,
    cors: boolean,
    rules: PimpRule | PimpRule[],
    plugins?: string[],
    manuallySetId?:string
  ) {
    this.name       = name;
    this.id         = (!manuallySetId) ? UUID.UUID() : manuallySetId;
    this.bsOptions  = new BrowserSyncOptions(targetURL, keepCookies, port, cors);
    this.pimpCmds   = (Array.isArray(rules)) ? rules : [rules];
    this.plugins    = (!plugins) ? [] : plugins;
  }
};

class BrowserSyncOptions {
  constructor (
    targetURL: string,
    keepCookies: boolean,
    port: number,
    cors: boolean
  ) {
    return {
      proxy: {
        target: targetURL,
        cookies: {
          stripeDomain: ((keepCookies) ? false : true)
        }
      },
      port: port,
      cors: cors,
      serveStatic: ['./dist'],
      middleware: [],
      rewriteRules: []
    };
  }
}

export class PimpRule {
  constructor (
    urlPattern: string,
    modifs: string[]
  ) {
    return {
      url: urlPattern,
      modifs: modifs
    };
  }
}

export function deconstructPimpConfig(original:PimpConfig):any[] {
  let bsOptions            = original.bsOptions;
  let pimpCmds             = original.pimpCmds;
  let plugins              = original.plugins;
  let name                 = original.name;
  let targetURL            = bsOptions.proxy.target;
  let keepCookies          = !(bsOptions.proxy.cookies.stripeDomain);
  let port                 = bsOptions.port;
  let PimpRules            = pimpCmds;
  let id                   = original.id;
  let cors                 = bsOptions.cors;

  return [name, targetURL, keepCookies, port, cors, PimpRules, plugins, id];
}

export class ConfigActions {
  public startAllowed:boolean;
  public stopAllowed:boolean;
  public saveAllowed:boolean;
  public restoreAllowed:boolean;
  public restoreFromEngineAllowed:boolean;
  public restartAllowed:boolean;

  constructor(
    startAllowed:boolean,
    stopAllowed:boolean,
    saveOrRestoreAllowed:boolean,
    restoreFromEngineAllowed:boolean
  ) {
    this.startAllowed = startAllowed;
    this.stopAllowed = this.restartAllowed = stopAllowed;
    this.saveAllowed = this.restoreAllowed = saveOrRestoreAllowed;
    this.restoreFromEngineAllowed = restoreFromEngineAllowed;
  }
}

export function defaultConfigGenerator():PimpConfig {
    let defaultName                 = 'default';
    let defaultTargetURL            = 'http://www.gouvernement.fr/';
    let defaultKeepCookies          = true;
    let defaultCors                 = true;
    let defaultPort                 = 3000;
    let defaultPimpRuleA: PimpRule  = new PimpRule(
        '*',
        [`
            $('head').append('<link rel="stylesheet" type="text/css" href="/css/main.min.css">');
            $('body').append('<script type="text/javascript" src="/js/main.min.js"></script>');
        `]
    );
    let defaultPimpRuleB: PimpRule  = new PimpRule(
        '*/sample-url2*',
        [`
            $('body').addClass('sample-modifier-rules2');
            $('.container').html('<p>replaced text</p>');
        `]
    );
    let pluginsList= [
      'pmp-plugin-staples'
    ];

    return new PimpConfig(defaultName, defaultTargetURL, defaultKeepCookies, defaultPort, defaultCors, [defaultPimpRuleA, defaultPimpRuleB], pluginsList);
}

export class Notif {
  public type:string;
  public subType:string;
  public payload:string|boolean;

  constructor (type:string, subType:string, payload:string|boolean) {
    this.type = type;
    this.subType = subType;
    this.payload = payload;
  }
}

export interface PmpPluginDescriptor {
  packageName:string;
  packageDescription:string;
  packageReadme:string;
}

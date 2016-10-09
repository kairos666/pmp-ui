import { Injectable } from '@angular/core';
import { PimpConfig, ConfigActions } from '../schema/config';
import { Observable, BehaviorSubject } from 'rxjs';
import { ConfigStorageService } from '../services/config-storage.service';
import { PmpEngineConnectorService } from '../services/pmp-engine-connector.service';
import * as _ from 'lodash';

@Injectable()
export class ConfigModelService {
  private isInitiated = false;
  private pmpEngineSmartState: Observable<any>  = undefined;
  private currentConfig: BehaviorSubject<PimpConfig> = new BehaviorSubject(undefined);
  private currentAllowedConfigActions: BehaviorSubject<ConfigActions> = new BehaviorSubject(new ConfigActions(false, false, false));

  constructor(private configStorage: ConfigStorageService, private pmpEngineConnector: PmpEngineConnectorService) {
    /* at instanciation check engine connection and status
    *  if not connected, wait for connection
    *  if engine is started retrieve applied config (TODO)
    *  if engine not started retrieve local storage config (eventually default config)
    */ 

    // handle actions allowed logic
    this.allowedActionsLogicSetting();
    
    // handle init (connection state, engine state, config)
    this.generateConfigSub();
    this.pmpEngineSmartState = this.pmpEngineConnector.isPmpEngineConnected.combineLatest(
      this.pmpEngineConnector.pmpEngineDataStatusStream,
      (isConnected, engineStatus) => { return { socketConnection: isConnected, engineStatus: engineStatus }; }
    );
    this.initHandler();
  }

  private initHandler (): void {
    // act only when connection is established and engineStatus known (not pending)
    let initsubscription = this.pmpEngineSmartState
      .first(smartState => { return (smartState.socketConnection && smartState.engineStatus !== 'pending'); })
      .subscribe(smartState => {
        switch (smartState.engineStatus) {
          case 'started':
            this.pmpEngineConnector.getPmpEngineConfig();
          break;

          case 'stopped':
            // get init config from local storage
            this.currentConfig.next(this.configStorage.restorePimpConfig());
            this.isInitiated = true;
          break;
        }

        // unsubscribe init behavior
        initsubscription.unsubscribe();
      });
  }

  private configActionsUpdater(newConf:PimpConfig):void {
    let currentAActions = this.currentAllowedConfigActions.value;
    let oldConf = this.configStorage.restorePimpConfig(); 
    let nextAllowedActions:ConfigActions;
    if (_.isEqual(oldConf, newConf)) {
      nextAllowedActions = new ConfigActions(
        currentAActions.startAllowed,
        currentAActions.stopAllowed,
        false
      );
    } else {
      nextAllowedActions = new ConfigActions(
        currentAActions.startAllowed,
        currentAActions.stopAllowed,
        true
      );
    }
    this.currentAllowedConfigActions.next(nextAllowedActions);
  }

  private allowedActionsLogicSetting():void {
    // react to config change (first is init)
    this.configStream.subscribe(appConfig => {
      this.configActionsUpdater(appConfig);
    });

    // react to engine status changes
    this.pmpEngineConnector.pmpEngineDataStatusStream.subscribe(status => {
      let previouslyAllowedActions = this.currentAllowedConfigActions.value;
      let nextAllowedActions:ConfigActions;
      switch (status) {
        case 'started':
          nextAllowedActions = new ConfigActions(
            false,
            true,
            previouslyAllowedActions.restoreAllowed
          );
        break;
        case 'pending':
          nextAllowedActions = new ConfigActions(
            false,
            false,
            previouslyAllowedActions.restoreAllowed
          );
        break;
        case 'stopped':
          nextAllowedActions = new ConfigActions(
            true,
            false,
            previouslyAllowedActions.restoreAllowed
          );
        break;
      }
      this.currentAllowedConfigActions.next(nextAllowedActions);
    });
  }

  private generateConfigSub():void {
    this.pmpEngineConnector.pmpEngineDataConfigStream.subscribe(config => {
        this.currentConfig.next(config);
        this.isInitiated = true; 
    });
  }

  /* CONFIG GETTERS */
  public get config ():any {
    return this.currentConfig.value;
  }

  public get configStream ():Observable<PimpConfig> {
    // remove initial undefined item and all identical configs
    return this.currentConfig.asObservable()
      .pairwise()
      .filter(pair => { return !(_.isEqual(pair[0], pair[1])); })
      .map(pair => { return pair[1]; });
  }

  /* CONFIG SETTER */
  public updateConfig(config:PimpConfig):boolean {
    // can only update config after first init config has been retrieved
    if (this.isInitiated) {
      this.currentConfig.next(config);
      return true;
    }
    return false;
  }

  /* AVAILABLE ACTIONS GETTERS */
  public get availableConfigActions ():ConfigActions {
    return this.currentAllowedConfigActions.value;
  }

  public get availableConfigActionsStream ():Observable<ConfigActions> {
    return this.currentAllowedConfigActions.asObservable();
  }

  /* ACTIONS */
  public start():boolean {
    if (this.availableConfigActions.startAllowed) {
      // if possible start regularly
      this.pmpEngineConnector.startPmpEngine(this.config);
      return true;
    } else if (this.availableConfigActions.restartAllowed) {
      // if already started then restart
      this.pmpEngineConnector.restartPmpEngine(this.config);
      return true;
    }
    return false;
  }

  public stop():boolean {
    if (this.availableConfigActions.stopAllowed) {
      this.pmpEngineConnector.stopPmpEngine();
      return true;
    }
    return false;
  }

  public save():boolean {
    if (this.availableConfigActions.saveAllowed) {
      this.configStorage.savePimpConfig(this.config);
      this.configActionsUpdater(this.config);
      return true;
    }
    return false
  }

  public restore():boolean {
    if (this.availableConfigActions.restartAllowed) {
      let restoredConfig = this.configStorage.restorePimpConfig();
      this.updateConfig(restoredConfig);
      return true;
    }
    return false;
  }
}

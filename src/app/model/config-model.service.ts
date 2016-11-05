import { Injectable } from '@angular/core';
import { PimpConfig, ConfigActions, Notif } from '../schema/config';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { ConfigStorageService } from '../services/config-storage.service';
import { PmpEngineConnectorService } from '../services/pmp-engine-connector.service';
import * as _ from 'lodash';

@Injectable()
export class ConfigModelService {
  private isInitiated = false;
  private pmpEngineSmartState: Observable<any>  = undefined;
  private currentConfig: BehaviorSubject<PimpConfig> = new BehaviorSubject(undefined);
  private currentEngineConfig: BehaviorSubject<PimpConfig> = new BehaviorSubject(undefined);
  private currentAllowedConfigActions: BehaviorSubject<ConfigActions> = new BehaviorSubject(new ConfigActions(false, false, false));
  private notifierStream: Subject<any> = new Subject();

  constructor(private configStorage: ConfigStorageService, private pmpEngineConnector: PmpEngineConnectorService) {
    /* at instanciation check engine connection and status
    *  if not connected, wait for connection
    *  if engine is started retrieve applied config
    *  if engine not started retrieve local storage config (eventually default config)
    */ 

    // handle actions allowed logic
    this.allowedActionsLogicSetting();

    // handle notificationsStream
    this.notificationsSetting();
    
    // handle init (connection state, engine state, config)
    this.handleConfigSub();
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
            console.log('detected started instance --> fetch applied config');
            this.pmpEngineConnector.getPmpEngineConfig();
          break;

          case 'stopped':
            // get init config from local storage
            console.log('detected stopped instance --> fetch stored config');
            this.currentConfig.next(this.configStorage.restorePimpConfig());
            this.isInitiated = true;
          break;
        }

        // unsubscribe init behavior
        initsubscription.unsubscribe();
      });
  }

  private notificationsSetting():void {
    /* NOTIFICATIONS 
    * engine connection: connected / disconnected --> disallow all ACTIONS
    * engine status: started / pending / stopped --> indicate state
    * config actions feedback: saved / restored --> indicate success (from corresponding methods)
    */
    this.pmpEngineConnector.isPmpEngineConnected.subscribe(isConnected => {
      let notifEvt = new Notif('engine', 'connection', isConnected);
      this.notifierStream.next(notifEvt);
    });
    this.pmpEngineConnector.pmpEngineDataStatusStream.subscribe(status => {
      let notifEvt = new Notif('engine', 'status', status);
      this.notifierStream.next(notifEvt);
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
    this.distinctConfigStream.subscribe(appConfig => {
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

  private handleConfigSub():void {
    // only used for init (work once at most and only when not initiated)
    this.pmpEngineConnector.pmpEngineDataConfigStream.subscribe(config => {
        if (!this.isInitiated) {
          this.currentConfig.next(config);
          this.currentEngineConfig.next(config);
          this.isInitiated = true;
          console.log('get started engine config and init');
        } else {
          this.currentEngineConfig.next(config);
          console.log('TODO apply config diff checking');
          console.log('TODO eventually modify available actions');
        } 
    });

    // update engine config on status change (after init only)
    this.pmpEngineConnector.pmpEngineDataStatusStream.filter(() => this.isInitiated).subscribe(status => {
      switch (status) {
        case 'started':
          // fetch config from engine itself (no inferences, that's better :)
          this.pmpEngineConnector.getPmpEngineConfig();
        break;
        default:
          // reset engine config
          if(this.currentEngineConfig.value) this.currentEngineConfig.next(undefined);
      }
    });
  }

  /* CONFIG GETTERS */
  public get config ():any {
    return this.currentConfig.value;
  }

  public get distinctConfigStream ():Observable<PimpConfig> {
    // remove initial undefined item and all identical configs
    return this.currentConfig.asObservable()
      .pairwise()
      .filter(pair => { return !(_.isEqual(pair[0], pair[1])); })
      .map(pair => { return pair[1]; });
  }

  public get fullConfigStream ():Observable<PimpConfig> {
    // remove initial undefined item and all identical configs
    return this.currentConfig.asObservable()
      .filter(config => { return (config !== undefined); });
  }

  public get engineAppliedConfig():PimpConfig {
    return this.currentEngineConfig.value;
  }

  public get engineAppliedConfigStream():Observable<PimpConfig> {
    // provide the currently applied config for started engine instances (can be different from the UI config!!)
    // when engine is not started it is undefined
    return this.currentEngineConfig.asObservable();
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

  /* USEFUL LINKS GETTER */
  public get links ():Observable<any> {
    return this.pmpEngineConnector.pmpEngineLinksStream;
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

      // notify
      let notifEvt = new Notif('config', 'action', 'saved');
      this.notifierStream.next(notifEvt);
      return true;
    }
    return false;
  }

  public restore():boolean {
    if (this.availableConfigActions.restoreAllowed) {
      let restoredConfig = this.configStorage.restorePimpConfig();
      this.updateConfig(restoredConfig);

      // notify
      let notifEvt = new Notif('config', 'action', 'restored');
      this.notifierStream.next(notifEvt);
      return true;
    }
    return false;
  }

  public get notificationsStream():Observable<Notif> {
    return this.notifierStream.asObservable();
  }
}

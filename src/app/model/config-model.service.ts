import { Injectable } from '@angular/core';
import { PimpConfig } from '../schema/config';
import { Observable, BehaviorSubject } from 'rxjs';
import { ConfigStorageService } from '../services/config-storage.service';
import { PmpEngineConnectorService } from '../services/pmp-engine-connector.service';

@Injectable()
export class ConfigModelService {
  private pmpEngineSmartState: Observable<any>  = undefined;
  private currentConfig: BehaviorSubject<PimpConfig> = new BehaviorSubject(undefined);

  constructor(private configStorage: ConfigStorageService, private pmpEngineConnector: PmpEngineConnectorService) {
    /* at instanciation check engine connection and status
    *  if not connected, wait for connection
    *  if engine is started retrieve applied config (TODO)
    *  if engine not started retrieve local storage config (eventually default config)
    */ 
    
    this.pmpEngineSmartState = this.pmpEngineConnector.isPmpEngineConnected.combineLatest(
      this.pmpEngineConnector.pmpEngineDataStatusStream,
      (isConnected, engineStatus) => { return { socketConnection: isConnected, engineStatus: engineStatus }; }
    );

    this.initHandler();
    this.pmpEngineConnector.pmpEngineDataConfigStream.subscribe(config => {
      this.currentConfig.next(config);
    });
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
          break;
        }

        // unsubscribe init behavior
        initsubscription.unsubscribe();
      });
  }

  public get config ():any {
    return this.currentConfig.value;
  }

  public get configStream ():Observable<PimpConfig> {
    return this.currentConfig.asObservable().filter(x => { return (x !== undefined); });
  }
}

import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { PimpConfig } from '../schema/config';
import { SocketConnectorService } from './socket-connector.service';

interface PmpSocketOutputEvt {
  type: string;
  subType: string;
  payload?: any;
}

const pmpEngineSocketEvts = {
    inputs: {
        startCmd: function (config) { return { type: 'input', subType: 'start-command', payload: config }; },
        stopCmd: function () { return { type: 'input', subType: 'stop-command' }; },
        restartCmd: function (config) { return { type: 'input', subType: 'restart-command', payload: config }; },
        getConfigCmd: function () { return { type: 'input', subType: 'config-command' }; },
        getUsefulLinks: function () { return { type: 'input', subType: 'links-command' }; },
        getAvailablePlugins: function() { return { type: 'input', subType: 'available-plugins-command' }; }
    },
    outputsSubTypes: {
        engineStatusLog: 'status',
        log: 'log',
        error: 'error',
        config: 'config',
        usefulLinks: 'links',
        availablePlugins: 'plugins'
    }
};

@Injectable()
export class PmpEngineConnectorService {
  private engineStatusStream = new BehaviorSubject(undefined);
  private engineLinksStream = new BehaviorSubject({});

  constructor(private socketConnector: SocketConnectorService) {
    // handle engine links changes
    this.socketConnector.socketOutputStream
      .filter(data => { return (data.subType === pmpEngineSocketEvts.outputsSubTypes.usefulLinks); })
      .map(data => data.payload)
      .subscribe(links => { this.engineLinksStream.next(links); });

    // handle engine state (always get a value)
    this.socketConnector.socketOutputStream
      .filter(data => { return (data.subType === pmpEngineSocketEvts.outputsSubTypes.engineStatusLog); })
      .map(data => data.payload)
      .subscribe(status => { 
        this.engineStatusStream.next(status); 

        // update pmp engine links when changing state
        this.getPmpEngineLinks();
      });
  }

  public startPmpEngine (config: PimpConfig): void {
    let pimpCmd = pmpEngineSocketEvts.inputs.startCmd(config);
    this.socketConnector.emit(pimpCmd);
  }

  public restartPmpEngine (config?: PimpConfig): void {
    let pimpCmd = pmpEngineSocketEvts.inputs.restartCmd(config);
    this.socketConnector.emit(pimpCmd);
  }

  public stopPmpEngine (): void {
    let pimpCmd = pmpEngineSocketEvts.inputs.stopCmd();
    this.socketConnector.emit(pimpCmd);
  }

  public getPmpEngineConfig (): void {
    let pimpCmd = pmpEngineSocketEvts.inputs.getConfigCmd();
    this.socketConnector.emit(pimpCmd);
  }

  public getPmpEngineLinks (): void {
    let pimpCmd = pmpEngineSocketEvts.inputs.getUsefulLinks();
    this.socketConnector.emit(pimpCmd);
  }

  public getPmpEngineAvailablePlugins (): void {
    let pimpCmd = pmpEngineSocketEvts.inputs.getAvailablePlugins();
    this.socketConnector.emit(pimpCmd);
  }

  public get isPmpEngineConnected (): Observable<boolean> {
    return this.socketConnector.isConnectedStream;
  }

  public get pmpEngineDataAllStreams (): Observable<PmpSocketOutputEvt> {
    return this.socketConnector.socketOutputStream;
  }

  public get pmpEngineDataStatusStream (): Observable<string> {
    return this.engineStatusStream.asObservable().filter(state => (state !== undefined) );
  }

  public get pmpEngineDataLogStream (): Observable<string> {
    return this.socketConnector.socketOutputStream
      .filter(data => { return (data.subType === pmpEngineSocketEvts.outputsSubTypes.log); })
      .map(data => data.payload);
  }

  public get pmpEngineDataErrorStream (): Observable<string> {
    return this.socketConnector.socketOutputStream
      .filter(data => { return (data.subType === pmpEngineSocketEvts.outputsSubTypes.error); })
      .map(data => data.payload);
  }

  public get pmpEngineDataConfigStream (): Observable<PimpConfig> {
    return this.socketConnector.socketOutputStream
      .filter(data => { return (data.subType === pmpEngineSocketEvts.outputsSubTypes.config); })
      .map(data => data.payload);
  }

  public get pmpEngineLinksStream (): Observable<any> {
    // distincUntilChanged with custom heuristic function for getting identical object
    return this.engineLinksStream.asObservable().distinctUntilChanged((a, b) => (JSON.stringify(a) === JSON.stringify(b)));
  }

  public get pmpEngineAvailablePlugins (): Observable<string[]> {
    return this.socketConnector.socketOutputStream
      .filter(data => { return (data.subType === pmpEngineSocketEvts.outputsSubTypes.availablePlugins); })
      .map(data => data.payload);
  }
}

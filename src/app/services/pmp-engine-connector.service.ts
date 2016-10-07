import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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
        getConfigCmd: function () { return { type: 'input', subType: 'config-command' }; }
    },
    outputsSubTypes: {
        engineStatusLog: 'status',
        log: 'log',
        error: 'error',
        config: 'config'
    }
};

@Injectable()
export class PmpEngineConnectorService {

  constructor(private socketConnector: SocketConnectorService) {}

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

  public get isPmpEngineConnected (): Observable<boolean> {
    return this.socketConnector.isConnectedStream;
  }

  public get pmpEngineDataAllStreams (): Observable<PmpSocketOutputEvt> {
    return this.socketConnector.socketOutputStream;
  }

  public get pmpEngineDataStatusStream (): Observable<string> {
    return this.socketConnector.socketOutputStream
      .filter(data => { return (data.subType === pmpEngineSocketEvts.outputsSubTypes.engineStatusLog); })
      .map(data => data.payload);
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
}

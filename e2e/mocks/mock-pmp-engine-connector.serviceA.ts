/* tslint:disable:no-unused-variable */
import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { PimpConfig, defaultConfigGenerator } from '../../src/app/schema/config';

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
export class MockPmpEngineConnectorService {
  private isConnectedStream = new BehaviorSubject(false);
  private allStreams = new Subject();

  constructor() {}

  public testTriggerIsConnected(connectionStatus:boolean):void {
      this.isConnectedStream.next(connectionStatus);
  }

  public testTriggerpmpEngineEvts(subType:string, payload?:any):void {
      let evt = {
          type: 'output',
          subType: subType,
          payload: payload
      };
      this.allStreams.next(evt);
  }

  public startPmpEngine (config: PimpConfig): void {
    console.log('mock start cmd');
  }

  public restartPmpEngine (config?: PimpConfig): void {
    console.log('mock restart cmd');
  }

  public stopPmpEngine (): void {
    console.log('mock stop cmd');
  }

  public getPmpEngineConfig (): void {
    console.log('mock config cmd');
  }

  public get isPmpEngineConnected (): Observable<boolean> {
    return this.isConnectedStream.asObservable();
  }

  public get pmpEngineDataAllStreams (): Observable<PmpSocketOutputEvt> {
    return (<Subject<PmpSocketOutputEvt>>this.allStreams).asObservable();
  }

  public get pmpEngineDataStatusStream (): Observable<string> {
    return this.pmpEngineDataAllStreams
      .filter(data => { return (data.subType === pmpEngineSocketEvts.outputsSubTypes.engineStatusLog); })
      .map(data => data.payload);
  }

  public get pmpEngineDataLogStream (): Observable<string> {
    return this.pmpEngineDataAllStreams
      .filter(data => { return (data.subType === pmpEngineSocketEvts.outputsSubTypes.log); })
      .map(data => data.payload);
  }

  public get pmpEngineDataErrorStream (): Observable<string> {
    return this.pmpEngineDataAllStreams
      .filter(data => { return (data.subType === pmpEngineSocketEvts.outputsSubTypes.error); })
      .map(data => data.payload);
  }

  public get pmpEngineDataConfigStream (): Observable<PimpConfig> {
    return this.pmpEngineDataAllStreams
      .filter(data => { return (data.subType === pmpEngineSocketEvts.outputsSubTypes.config); })
      .map(data => data.payload);
  }
}

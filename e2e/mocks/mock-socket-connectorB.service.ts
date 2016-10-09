import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import { defaultConfigGenerator } from '../../src/app/schema/config';

const mockSocketEvt = {
    outputs: {
        engineStatusLog: function (status) { return { type: 'output', subType: 'status', payload: status }; },
        log: function (log) { return { type: 'output', subType: 'log', payload: log }; },
        error: function (error) { return { type: 'output', subType: 'error', payload: error }; },
        config: function (config) { return { type: 'output', subType: 'config', payload: config }; }
    }
};

@Injectable()
export class MockSocketConnectorServiceB {
  private currentConfig = defaultConfigGenerator();
  private outputStream: Subject<any> = new Subject();
  private engineStatStream: BehaviorSubject<string> = new BehaviorSubject(undefined);
  private connectedStream: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor () {
      // delayed connection
      setTimeout(() => { this.connectedStream.next(true); }, 250);

      // delay engine status update after connection
      setTimeout(() => { 
          this.propagateEngineStatus('stopped'); 
      }, 500);

      // send logs regularly when started
      Observable.interval(200)
                .map(index => { return mockSocketEvt.outputs.log(`mock log N°${index}`); })
                .subscribe(log => {
                    this.outputStream.next(log);
                });

      // send errors regularly when started
      Observable.interval(600)
                .map(index => { return mockSocketEvt.outputs.error(`mock error N°${index}`); })
                .subscribe(err => {
                    this.outputStream.next(err);
                });
  }

  private propagateEngineStatus(status:string):void {
    this.outputStream.next(mockSocketEvt.outputs.engineStatusLog(status));
    this.engineStatStream.next(status); 
  }

  public emit (data: any): void {
    switch (data.subType) {
        case 'start-command':
            if (this.engineStatStream.value === 'stopped') {
                // store config
                this.currentConfig = data.payload;

                let stateSequence = ['pending', 'started'];
                let cmdSubscription = Observable.interval(50)
                          .take(stateSequence.length)
                          .map(index => { return stateSequence[index]; })
                          .subscribe(
                              status => { this.propagateEngineStatus(status); },
                              undefined,
                              () => { cmdSubscription.unsubscribe(); }
                          );
            }
        break;

        case 'restart-command':
            if (this.engineStatStream.value === 'started') {
                // store config
                if (data.payload) { this.currentConfig = data.payload; };

                let stateSequence = ['pending', 'stopped', 'pending', 'started'];
                let cmdSubscription = Observable.interval(50)
                          .take(stateSequence.length)
                          .map(index => { return stateSequence[index]; })
                          .subscribe(
                              status => { this.propagateEngineStatus(status); },
                              undefined,
                              () => { cmdSubscription.unsubscribe(); }
                          );
            }
        break;

        case 'stop-command':
            if (this.engineStatStream.value === 'started') {
                let stateSequence = ['pending', 'stopped'];
                let cmdSubscription = Observable.interval(50)
                          .take(stateSequence.length)
                          .map(index => { return stateSequence[index]; })
                          .subscribe(
                              status => { this.propagateEngineStatus(status); },
                              undefined,
                              () => { cmdSubscription.unsubscribe(); }
                          );
            }
        break;

        case 'config-command':
            this.outputStream.next(mockSocketEvt.outputs.config(this.currentConfig));
        break;
    }
  }

  public get isConnected (): boolean {
    return this.connectedStream.value;
  }

  public get isConnectedStream (): Observable<boolean> {
    return this.connectedStream.asObservable();
  }

  public get socketOutputStream (): Observable<any> {
    /*
    * only outputs if connected
    * only output logs if engine is not stopped
    */ 
    return this.outputStream.asObservable()
                            .filter(() => { return this.isConnected; })
                            .filter(event => { return (event.subType !== 'log' || (event.subType !== 'log' && this.engineStatStream.value !== 'stopped')); });
  }
}

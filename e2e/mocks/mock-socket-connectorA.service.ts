import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject, Observable } from 'rxjs';

const mockSocketEvt = {
    outputs: {
        engineStatusLog: function (status) { return { type: 'output', subType: 'status', payload: status }; },
        log: function (log) { return { type: 'output', subType: 'log', payload: log }; },
        error: function (error) { return { type: 'output', subType: 'error', payload: error }; },
        config: function (config) { return { type: 'output', subType: 'config', payload: config }; }
    },
    utils: {
        disconnect: 'disconnect',
        connect: 'connection'
    }
};

@Injectable()
export class MockSocketConnectorService {
  private outputStream: Subject<any> = new Subject();
  private connectedStream: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor () {
      // mock flaky connection
      let flakyConnection = Observable.interval(500).map(index => { return ((Math.random() >= .75) ? false : true); });
      flakyConnection.subscribe(isConnected => {
          this.connectedStream.next(isConnected);
      });

      // mock engine status
      let mockEngineStatus = Observable.interval(200)
      .filter(() => {
          // blocks all emissions when disconnected
          return this.isConnected;
      })
      .map(() => {
          // generate random state (no pending)
          let status: string;
          switch (Math.round(Math.random())) {
              case 0:
                status = 'started';
              break;

              case 1:
                status = 'stopped';
              break;
          }
          return status;
      })
      .pairwise()
      .flatMap(bundleStatus => {
        // insert a pending state between each new states
        let itemArray: string[];
        if (bundleStatus [0] === bundleStatus [1]) {
            itemArray = [bundleStatus [1]];
        } else {
            itemArray = ['pending', bundleStatus [1]];
        }
        return Observable.from(itemArray);
      })
      .distinctUntilChanged()
      .map(status => {
        // generate mock evt
        return mockSocketEvt.outputs.engineStatusLog(status);
      });
      mockEngineStatus.subscribe(status => {
          this.outputStream.next(status);
      });
  }

  public emit (data: any): void {
    switch (data.subType) {
        case 'start-command':

        break;

        case 'restart-command':

        break;

        case 'stop-command':

        break;

        case 'config-command':

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
    return this.outputStream.asObservable();
  }
}

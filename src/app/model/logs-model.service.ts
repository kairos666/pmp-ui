import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { PmpEngineConnectorService  } from '../services/pmp-engine-connector.service';

const maxLogEntries = 100;

@Injectable()
export class LogsService {
  private _logs = [];
  private _clearAllowed = new BehaviorSubject(false);
  private _engineStream:Observable<string> = this.pmpEngine.pmpEngineDataLogStream.merge(this.pmpEngine.pmpEngineDataErrorStream);
  private _logStream:BehaviorSubject<string[]> = new BehaviorSubject(this._logs);

  constructor(private pmpEngine:PmpEngineConnectorService) {
    // handle clearability state
    this._logStream.subscribe(logsArray => {
      let result:boolean = (logsArray.length === 0) ? false : true;
      this._clearAllowed.next(result);
    });

    // tap in pmp engine log & errors flow
    this._engineStream.subscribe(log => {
      this._logs.push(log);
      
      // remove items if too many
      if (this._logs.length === (maxLogEntries + 1)) {
        this._logs.shift();
      }

      // update output stream
      this._logStream.next(this._logs);
    });

    // test TODO remove from sources
    Observable.interval(500).map(index => { return 'mock log N°' + index; }).subscribe(fakeLog => {
      this._logs.push(fakeLog);
      
      // remove items if too many
      if (this._logs.length === (maxLogEntries + 1)) {
        this._logs.shift();
      }

      // update output stream
      this._logStream.next(this._logs);
    });
  }

  public clear():void {
    this._logs = [];

    // update output stream
    this._logStream.next(this._logs);
  }

  public get allLogs():string[] {
    return this._logs;
  }

  public get logsStream():Observable<string[]> {
    return this._logStream.asObservable();
  }

  public get isClearable():Observable<boolean> {
    return this._clearAllowed.asObservable().distinctUntilChanged();
  }
}

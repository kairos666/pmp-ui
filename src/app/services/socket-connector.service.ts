import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import * as io from 'socket.io-client';

const socketConfig = {
    host: 'http://localhost',
    port: 5000
};
const pmpEngineOutputKey = 'output';

@Injectable()
export class SocketConnectorService {
  private socket: SocketIOClient.Socket = undefined;
  private outputStream: Subject<any> = new Subject();
  private connectedStream: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor() { 
    // connect WebSocket
    let socketUrl = socketConfig.host + ':' + socketConfig.port;
    this.socket = io.connect(socketUrl);

    // handlers
    this.socket.on('connect', () => { this.connectedStream.next(true); });
    
    this.socket.on('disconnect', () => { this.connectedStream.next(false); });

    this.socket.on(pmpEngineOutputKey, data => { this.outputStream.next(data); });

    // console feedback
    this.isConnectedStream.subscribe(state => {
      if (state) {
        console.log('WEBSOCKET SERVICE --> connected socket');
      } else {
        console.log('WEBSOCKET SERVICE --> disconnected socket');
      }
    });
  }

  public emit (data: any): void {
    this.socket.emit(data);
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

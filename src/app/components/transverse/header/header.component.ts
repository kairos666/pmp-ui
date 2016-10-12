import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { ConfigActions } from '../../../schema/config';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit  {
  private engineStatus:string;
  private isConnected:boolean;
  private isStartAllowed = true;
  private isStopAllowed = true;
  @Input() statusStream: Observable<string>;
  @Input() connectionStream: Observable<boolean>;
  @Input() availableActionsStream: Observable<ConfigActions>;
  @Output() onMenuCall = new EventEmitter();
  @Output() onStartClick = new EventEmitter();
  @Output() onStopClick = new EventEmitter();

  constructor() {}

  ngOnInit():void {
    // handle available actions changes
    this.availableActionsStream.subscribe(aActions => {
      this.isStartAllowed = aActions.startAllowed;
      this.isStopAllowed = aActions.stopAllowed;
    });

    // handle engine status changes
    this.statusStream.subscribe(status => {
      this.engineStatus = status;
    });

    // handle connection status changes
    this.connectionStream.subscribe(isConnected => {
      this.isConnected = isConnected;
    });
  }
}

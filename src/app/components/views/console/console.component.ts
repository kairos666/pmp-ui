/* tslint:disable:no-unused-variable */
import { Component, ViewChild, OnDestroy } from '@angular/core';
import { ConsoleOutputComponent } from '../../ui-parts/console-output/console-output.component';
import { LogsService } from '../../../model/logs-model.service';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-console',
  templateUrl: './console.component.html',
  styleUrls: ['./console.component.scss']
})
export class ConsoleComponent implements OnDestroy {
  @ViewChild('consoleOutput') consoleOutput:ConsoleOutputComponent;
  private isClearAllowed                = false;
  private isGoBottomAllowed             = false;
  private logStream:Observable<string[]>;
  private sub:Subscription;

  constructor(private logsService:LogsService) {
    // handle clearability
    this.sub = this.logsService.isClearable.subscribe(isClearable => { this.isClearAllowed = isClearable; });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  private onClearClick():void {
    this.logsService.clear();
  }

  private onGoBottomClick():void {
    this.consoleOutput.goToBottom();
  }
}

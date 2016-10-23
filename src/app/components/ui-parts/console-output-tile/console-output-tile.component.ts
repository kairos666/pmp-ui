import { Component, Input, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-console-output-tile',
  styleUrls: ['./console-output-tile.component.scss'],
  template: `
    <h3>Console</h3>
    <div class="console-output-tile-container">
      <pre *ngFor="let log of logs | async">{{log}}</pre>
    </div>
  `
})
export class ConsoleOutputTileComponent implements OnInit, OnDestroy {
  @Input() logs:Observable<string>;
  private sub:Subscription;

  constructor(private element:ElementRef) {}

  ngOnInit() {
    // handle auto scroll behavior (delay is necessary to synchronize better with log display in view)
    this.sub = this.logs
      .delay(0)
      .subscribe(() => {
        this.element.nativeElement.children[1].scrollTop = this.element.nativeElement.children[1].scrollHeight;
      });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}

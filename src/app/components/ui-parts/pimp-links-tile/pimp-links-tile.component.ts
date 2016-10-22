import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable, Subscription } from 'rxjs';
import { PimpConfig } from '../../../schema/config';

@Component({
  selector: 'app-pimp-links-tile',
  template: `
    <h3>Pimp links</h3>
    <ul class="pimp-links-tile-container link-list">
      <li *ngFor="let link of links">
        <a [href]="sanitize(link.href)" title="open tab at {{link.href}}" target="_blank">
            <md-icon>{{link.icon}}</md-icon>
            <h4>{{link.title}}</h4>
            <p>{{link.href}}</p>
        </a>
      </li>
    </ul>
  `
})
export class PimpLinksTileComponent implements OnInit, OnDestroy {
  @Input() config:Observable<PimpConfig>;
  private subs:Subscription;
  private links = [];

  constructor(private sanitizer:DomSanitizer) { }

  private sanitize(url:string){
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  ngOnInit() {
    this.subs = this.config.subscribe(config => {
      let targetURL = config.bsOptions.proxy.target;
      let port = config.bsOptions.port;

      this.links = [
        { href: targetURL, title: 'Origin URL', icon: 'link' },
        { href: 'localhost:' + port, title: 'Pimped URL', icon: 'link' },
        { href: 'localhost:' + (port+1), title: 'BrowserSync interface', icon: 'developer_board' }
      ]
    });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}

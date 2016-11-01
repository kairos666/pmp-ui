import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router }   from '@angular/router';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-pimp-links-tile',
  template: `
    <h3>
      <button type="button" class="btn-edit" (click)="onClickEdit()"><md-icon>mode_edit</md-icon></button>
      <span>Pimp links</span>
    </h3>
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
  @Input() linksStream:Observable<any>;
  private subs:Subscription;
  private links = [];

  constructor(private sanitizer:DomSanitizer, private router:Router) { }

  private sanitize(url:string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  private onClickEdit() {
    this.router.navigate(['/configuration']);
  }

  ngOnInit() {
    this.subs = this.linksStream.subscribe(links => {
      if(JSON.stringify(links) !== JSON.stringify({})) {
        this.links = [
          { href: links.originURL, title: 'Origin URL', icon: 'link' },
          { href: links.proxiedURL, title: 'Pimped URL', icon: 'link' },
          { href: links.bsUIURL, title: 'BrowserSync interface', icon: 'developer_board' },
          { href: links.pimpSrcFilesPath, title: 'Pimp source files', icon: 'folder_open' },
        ];
      } else {
        this.links = [];
      }
    });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}

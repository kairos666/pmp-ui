import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '@angular/material';
import { RouterModule } from '@angular/router';
import { PmpServicesModule } from './modules/pmp-services/pmp-services.module';

/* COMPONENTS */
import { AppComponent } from './app.component';
import { MainNavComponent } from './components/transverse/main-nav/main-nav.component';
import { DashboardComponent } from './components/views/dashboard/dashboard.component';
import { ConfigComponent } from './components/views/config/config.component';
import { ConsoleComponent } from './components/views/console/console.component';
import { HelpComponent } from './components/views/help/help.component';
import { HeaderComponent } from './components/transverse/header/header.component';
import { ConsoleOutputComponent } from './components/ui-parts/console-output/console-output.component';
import { PimpFormGeneralComponent } from './components/ui-parts/forms/pimp-form-general/pimp-form-general.component';
import { PimpFormRulesComponent } from './components/ui-parts/forms/pimp-form-rules/pimp-form-rules.component';
import { PimpRuleInputComponent } from './components/ui-parts/forms/pimp-rule-input/pimp-rule-input.component';
import { ConsoleOutputTileComponent } from './components/ui-parts/console-output-tile/console-output-tile.component';
import { EngineIndicatorTileComponent } from './components/ui-parts/engine-indicator-tile/engine-indicator-tile.component';
import { PimpLinksTileComponent } from './components/ui-parts/pimp-links-tile/pimp-links-tile.component';
import { ConfigPreviewTileComponent } from './components/ui-parts/config-preview-tile/config-preview-tile.component';
import { PimpFormPluginsComponent } from './components/ui-parts/forms/pimp-form-plugins/pimp-form-plugins.component';
import { PluginReadmeComponent } from './components/ui-parts/dialogs/plugin-readme/plugin-readme.component';

/* PIPES */
import { MarkdownToHtmlPipe } from 'markdown-to-html-pipe';
import { SidenavRuleHelperComponent } from './components/ui-parts/sidenav-rule-helper/sidenav-rule-helper.component';

let routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'console', component: ConsoleComponent },
  { path: 'configuration', component: ConfigComponent },
  { path: 'help', component: HelpComponent },
  { path: '', redirectTo:'/dashboard', pathMatch: 'full'},
  { path: '**', redirectTo:'/dashboard', pathMatch: 'full' }
];

@NgModule({
  declarations: [
    AppComponent,
    MainNavComponent,
    DashboardComponent,
    ConsoleComponent,
    ConfigComponent,
    HelpComponent,
    HeaderComponent,
    ConsoleOutputComponent,
    PimpFormGeneralComponent,
    PimpFormRulesComponent,
    PimpRuleInputComponent,
    ConsoleOutputTileComponent,
    EngineIndicatorTileComponent,
    PimpLinksTileComponent,
    ConfigPreviewTileComponent,
    PimpFormPluginsComponent,
    PluginReadmeComponent,
    MarkdownToHtmlPipe,
    SidenavRuleHelperComponent
  ],
  entryComponents: [
    PluginReadmeComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
    MaterialModule.forRoot(),
    PmpServicesModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';

import { LocalStorageService } from '../../services/local-storage.service';
import { ConfigStorageService } from '../../services/config-storage.service';
import { SocketConnectorService } from '../../services/socket-connector.service';
import { PmpEngineConnectorService } from '../../services/pmp-engine-connector.service';
import { ConfigModelService } from '../../model/config-model.service';
import { LogsService } from '../../model/logs-model.service';

@NgModule({
  providers:    [ 
    LocalStorageService, 
    ConfigStorageService,
    SocketConnectorService,
    PmpEngineConnectorService,
    ConfigModelService,
    LogsService
  ]
})
export class PmpServicesModule { 
  constructor (@Optional() @SkipSelf() parentModule:PmpServicesModule) {
    if (parentModule) {
      throw new Error('PmpServicesModule is already loaded. Import it in the AppModule only');
    }
  }

  static forRoot():ModuleWithProviders {
    return {
      ngModule: PmpServicesModule,
      providers: []
    };
  }
}

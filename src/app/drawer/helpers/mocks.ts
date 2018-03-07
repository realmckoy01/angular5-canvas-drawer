import { NgRedux } from "@angular-redux/store";
import { ChangeHelperService } from "../services/change-helper.service";
import { DrawerObjectHelperService } from "../services/drawer-object-helper.service";


export class MockRedux extends NgRedux<any> {
    constructor(private state: any) {
      super();
    }
    dispatch = () => undefined;
    getState = () => this.state;
    configureStore = () => undefined;
    configureSubStore = () => undefined;
    provideStore = () => undefined;
    replaceReducer = () => undefined;
    select = () => undefined;
    subscribe = () => undefined;
  
  }

  export class MockChangeHelperService extends ChangeHelperService {
  }

  export class MockDrawerObjectHelperService extends DrawerObjectHelperService {

  }
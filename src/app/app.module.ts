import { NgModule, ApplicationRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, PreloadAllModules } from '@angular/router';
import { removeNgStyles, createNewHosts, createInputTransfer } from '@angularclass/hmr';
import { AngularFireModule } from 'angularfire2';

/*
 * Platform and Environment providers/directives/pipes
 */
import { ENV_PROVIDERS } from './environment';
import { ROUTES } from './app.routes';
// App is our top level component
import { AppComponent } from './app.component';
import { APP_RESOLVER_PROVIDERS } from './app.resolver';
import { AppState, InternalStateType } from './app.service';
import { HomeComponent } from './home';
import { AboutComponent } from './about';
import { ProfileComponent } from './profile';
import { TimelineComponent } from './timeline';
import { NoContentComponent } from './no-content';
import { CreateVulgeComponent } from './vulge';
import { LoginComponent, EqualValidator} from './login';
import { SpinnerComponent } from './spinner/spinner.component';
import { ReversePipe, NotificationPipe, UserVotePipe} from './pipes';

//Services
import { AuthenticationService, ToasterService, ErrorCodeService, VulgeService, HelperService} from './services';

//Directives
import { XLarge } from './home/x-large';



// Must export the config
export const firebaseConfig = {
  apiKey: 'AIzaSyD6HIhUjveUDieITrERUHsqK935h7b_wSg',
  authDomain: 'dayvulge-27f09.firebaseapp.com',
  databaseURL: '"https://dayvulge-27f09.firebaseio.com',
  storageBucket: 'dayvulge-27f09.appspot.com',
  messagingSenderId: '24226133302'
};

// Application wide providers
const APP_PROVIDERS = [
  ...APP_RESOLVER_PROVIDERS,
  AppState,
  AuthenticationService,
  ToasterService,
  ErrorCodeService,
  VulgeService,
  HelperService
];

type StoreType = {
  state: InternalStateType,
  restoreInputValues: () => void,
  disposeOldHosts: () => void
};

/**
 * `AppModule` is the main entry point into Angular2's bootstraping process
 */
@NgModule({
  bootstrap: [ AppComponent ],
  declarations: [
    AppComponent,
    AboutComponent,
    HomeComponent,
    ProfileComponent,
    TimelineComponent,
    NoContentComponent,
    XLarge,
    LoginComponent,
    EqualValidator,
    SpinnerComponent,
    CreateVulgeComponent,
    ReversePipe,
    NotificationPipe,
    UserVotePipe
  ],
  imports: [ // import Angular's modules
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(ROUTES, { useHash: true, preloadingStrategy: PreloadAllModules }),
    AngularFireModule.initializeApp(firebaseConfig)
  ],
  providers: [ // expose our Services and Providers into Angular's dependency injection
    ENV_PROVIDERS,
    APP_PROVIDERS
  ]
})
export class AppModule {
  constructor(public appRef: ApplicationRef, public appState: AppState) {}

  hmrOnInit(store: StoreType) {
    if (!store || !store.state) return;
    console.log('HMR store', JSON.stringify(store, null, 2));
    // set state
    this.appState._state = store.state;
    // set input values
    if ('restoreInputValues' in store) {
      let restoreInputValues = store.restoreInputValues;
      setTimeout(restoreInputValues);
    }

    this.appRef.tick();
    delete store.state;
    delete store.restoreInputValues;
  }

  hmrOnDestroy(store: StoreType) {
    const cmpLocation = this.appRef.components.map(cmp => cmp.location.nativeElement);
    // save state
    const state = this.appState._state;
    store.state = state;
    // recreate root elements
    store.disposeOldHosts = createNewHosts(cmpLocation);
    // save input values
    store.restoreInputValues  = createInputTransfer();
    // remove styles
    removeNgStyles();
  }

  hmrAfterDestroy(store: StoreType) {
    // display new elements
    store.disposeOldHosts();
    delete store.disposeOldHosts;
  }

}


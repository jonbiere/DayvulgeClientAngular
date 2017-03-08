import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home';
import { AboutComponent } from './about';
import { NoContentComponent } from './no-content';
import { ProfileComponent } from './profile';
import {TimelineComponent} from './timeline';


export const ROUTES: Routes = [
  { path: '',      component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'profile', component: ProfileComponent},
  { path: 'timeline', component: TimelineComponent },
  { path: '**',    component: NoContentComponent },
];

import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgxPermissionsModule } from 'ngx-permissions';
import {UrlSerializer} from '@angular/router';

import {RouteUrlSerializer} from './shared/classes/route-url-serializer';
import { LoginComponent } from './shared/components/login/login.component';
import { ForgotPasswordComponent } from './shared/components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './shared/components/reset-password/reset-password.component';
import { PagenotfoundComponent } from './shared/components/pagenotfound/pagenotfound.component';
import { ErrorComponent } from './shared/components/error/error.component';
import { RedirectComponent } from './shared/components/redirect/redirect.component';
import { PrivacyComponent } from './shared/components/privacy/privacy.component';
import { TermsComponent } from './shared/components/terms/terms.component';

import {AdminRoutes} from './routes/admin.routes';
import {InstructorRoutes} from './routes/instructor.routes';
import {SchoolRoutes} from './routes/school.routes';
import {StudentRoutes} from './routes/student.routes';
import {TeacherRoutes} from './routes/teacher.routes';
import { LinkExpiredComponent } from './shared/components/link-expired/link-expired.component';

const routes: Routes = [
AdminRoutes.routes,
SchoolRoutes.routes,
InstructorRoutes.routes,
StudentRoutes.routes,
TeacherRoutes.routes,
{ path: 'forgot-password', component: ForgotPasswordComponent },
{ path: 'link-expired', component: LinkExpiredComponent },
{ path: 'resend-mail/account-verification', component: ForgotPasswordComponent },
{ path: 'reset-password',  component: ResetPasswordComponent },
{ path: 'reset-password/:uniqeId',  component: ResetPasswordComponent },
{ path: 'reset-password/:uniqeId/:status', component: ResetPasswordComponent },
{ path: '', component: LoginComponent },
{ path: 'login/:uniqeId/:status', component: LoginComponent },
{ path: 'redirect/:token', component : RedirectComponent},
{ path: 'privacy', component : PrivacyComponent},
{ path: 'terms', component : TermsComponent},
{ path : '**',component : PagenotfoundComponent},
];

@NgModule({
  imports: [ RouterModule.forRoot(routes,{useHash : true}),
  NgxPermissionsModule.forRoot() ],
  exports: [ RouterModule, NgxPermissionsModule ],
  providers : [{ provide: UrlSerializer, useClass: RouteUrlSerializer }]
})

export class AppRoutingModule {
}
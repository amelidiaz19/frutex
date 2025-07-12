import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent,  {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    {
      provide: 'SUPPRESS_HYDRATION_WARNING',
      useValue: true
    }
  ]
}).catch((err) => console.error(err));

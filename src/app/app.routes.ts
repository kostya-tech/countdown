import { Routes } from '@angular/router';
import { CountdownComponent } from './components/countdown/countdown.component';

export const routes: Routes = [
    {
        path: '',
        component: CountdownComponent,
        title: 'Countdown Timer',
        data: {
            description: 'Сountdown timer',
            preload: true
        }
    },
    {
        path: '**',
        redirectTo: ''
    }
];

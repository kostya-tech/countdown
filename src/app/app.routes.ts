import { Routes } from '@angular/router';
import { CountdownContainerComponent } from './components/countdown-container/countdown-container.component';

export const routes: Routes = [
    {
        path: '',
        component: CountdownContainerComponent,
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

import { Component, OnInit } from '@angular/core';
import { AuthorizationService } from './services/hue/authorization.service';
import { LightService } from './services/hue/light.service';
import { FlagsEnum } from './shared/enum/flags.enum';
import { F1mvService } from './services/f1mv.service';
import { interval, Subject, takeUntil } from 'rxjs';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'f1mvHueApp';

  public isProd = environment.production;
  public destroy$ = new Subject<void>();
  public isSubbed = false;

  constructor(
    public discoveryService: AuthorizationService,
    public lightService: LightService,
    public f1mvService: F1mvService
  ) {}

  ngOnInit(): void {
    this.f1mvService.flagChange.subscribe((flags: number[]) => {
      const lights = this.lightService.getSyncedLights();
      if (lights.length > 0) {
        for (let i = 0; i < 4; i++) {
          if (flags === FlagsEnum.green) {
            this.lightService.flashFlag(lights[i], flags, 254);
          } else {
            this.lightService.setLightColor(lights[i], flags, 254);
          }
        }
      }
    });
  }

  public unsubToApi() {
    this.isSubbed = false;
    this.destroy$.next();
  }

  public subToApi() {
    this.isSubbed = true;
    const interval$ = interval(200);
    interval$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.f1mvService.consumeApi().subscribe();
    });
  }
}

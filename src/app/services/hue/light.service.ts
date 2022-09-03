import { Injectable } from '@angular/core';
import { AuthorizationService } from './authorization.service';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, interval } from 'rxjs';
import { Light } from './light';
import { FlagsEnum } from '../../shared/enum/flags.enum';
import addSeconds from 'date-fns/addSeconds';
import { LightGroupService } from './light-group.service';

@Injectable({
  providedIn: 'root',
})
export class LightService {
  private lightsSubject = new BehaviorSubject<Light[]>([]);
  private syncedLightsArray: string[] = [];
  private revertToWhiteDate: Date | null = null;

  constructor(
    private discoveryService: AuthorizationService,
    private lightGroupService: LightGroupService,
    private http: HttpClient
  ) {
    this.lightGroupService.group$.subscribe(group => {
      this.syncedLightsArray = group?.lights || [];
    });

    const interval$ = interval(1000);
    interval$.subscribe(() => {
      if (this.revertToWhiteDate && this.revertToWhiteDate <= new Date()) {
        this.revertToWhiteDate = null;

        // TODO: Fix group
        // for (const lightIndex in this.getSyncedLights()) {
        //   this.setLightColor(
        //     this.getSyncedLights()[lightIndex],
        //     FlagsEnum.white,
        //     77
        //   );
        // }
      }
    });
  }

  get lights() {
    return this.lightsSubject.getValue();
  }

  public toggleSync(light: Light) {
    if (this.lightGroupService.group?.lights.includes(light.id)) {
      this.syncedLightsArray.splice(
        this.syncedLightsArray.indexOf(light.id),
        1
      );
    } else {
      this.syncedLightsArray.push(light.id);
    }

    this.lightGroupService.createGroup(this.syncedLightsArray);
  }

  public checkIfSynced(light: Light) {
    return this.syncedLightsArray.includes(light.id);
  }

  public getSyncedLights() {
    return this.syncedLightsArray;
  }

  public getLights() {
    this.http
      .get(
        `https://${
          this.discoveryService.bridgeIp
        }/api/${this.discoveryService.hueApiKey.getValue()}/lights`
      )
      .subscribe((resp: Object) => {
        const respConverted = resp as Light[];
        const lightsArray = [];
        for (const respConvertedKey in resp) {
          if (respConverted.hasOwnProperty(respConvertedKey)) {
            // @ts-ignore
            const light = resp[respConvertedKey] as Light;
            light.id = respConvertedKey;
            lightsArray.push(light);
          }
        }
        this.lightsSubject.next(lightsArray);
      });
  }

  turnOnLight(id: string) {
    this.http
      .put(
        `https://${
          this.discoveryService.bridgeIp
        }/api/${this.discoveryService.hueApiKey.getValue()}/lights/${id}/state`,
        {
          on: true,
        }
      )
      .subscribe();
  }

  turnOffLight(id: string) {
    this.http
      .put(
        `https://${
          this.discoveryService.bridgeIp
        }/api/${this.discoveryService.hueApiKey.getValue()}/lights/${id}/state`,
        {
          on: false,
        }
      )
      .subscribe();
  }

  // brightness is 0-254
  setLightColor(light: Light, color: number[], brightness: number = 77) {
    this.http
      .put(
        `https://${
          this.discoveryService.bridgeIp
        }/api/${this.discoveryService.hueApiKey.getValue()}/lights/${
          light.id
        }/state`,
        {
          on: true,
          xy: color,
          bri: brightness,
        }
      )
      .subscribe();
    this.revertToWhiteDate = null;
  }

  // TODO: Somehow deal with multiple changes within the timeout period
  flashFlag(light: Light, color: number[], brightness: number = 77) {
    this.http
      .put(
        `https://${
          this.discoveryService.bridgeIp
        }/api/${this.discoveryService.hueApiKey.getValue()}/lights/${
          light.id
        }/state`,
        {
          on: true,
          xy: color,
          bri: brightness,
        }
      )
      .subscribe();

    this.revertToWhiteDate = addSeconds(new Date(), 5);
  }

  flashAllFlag() {
    for (const light in this.lights) {
      if (this.lights.hasOwnProperty(light)) {
        this.flashFlag(this.lights[light], FlagsEnum.green, 254);
      }
    }
  }
}

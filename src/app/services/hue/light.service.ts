import { Injectable } from '@angular/core';
import { AuthorizationService } from './authorization.service';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Light } from './light';
import { FlagsEnum } from '../../shared/enum/flags.enum';
import { LightGroupService } from './light-group.service';
import { F1mvService } from '../f1mv.service';
import { ConfigService } from '../../shared/config.service';

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
    private f1mvService: F1mvService,
    private http: HttpClient
  ) {
    this.lightGroupService.group$.subscribe(group => {
      this.syncedLightsArray = group?.lights || [];
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
      this.setLightColor(light, FlagsEnum.white);
    } else {
      this.setLightColor(
        light,
        this.f1mvService.flagChange$.getValue(),
        this.f1mvService.flagChange$.getValue() === FlagsEnum.white
          ? ConfigService.brightness
          : ConfigService.flagBrightness
      );
      this.syncedLightsArray.push(light.id);
    }

    if (this.f1mvService.flagChange$.getValue() === FlagsEnum.green) {
      setTimeout(() => {
        this.setLightColor(light, FlagsEnum.white);
      }, 1000);
    }

    this.lightGroupService.createGroup(this.syncedLightsArray);
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
  setLightColor(
    light: Light,
    color: number[],
    brightness: number = ConfigService.brightness
  ) {
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
}

import { Injectable } from '@angular/core';
import { AuthorizationService } from './authorization.service';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Light } from './light';
import { FlagsEnum } from '../../shared/enum/flags.enum';

@Injectable({
  providedIn: 'root',
})
export class LightService {
  private lightsSubject = new BehaviorSubject<Light[]>([]);

  get lights() {
    return this.lightsSubject.getValue();
  }

  constructor(
    private discoveryService: AuthorizationService,
    private http: HttpClient
  ) {}

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

    setTimeout(() => {
      this.http
        .put(
          `https://${
            this.discoveryService.bridgeIp
          }/api/${this.discoveryService.hueApiKey.getValue()}/lights/${
            light.id
          }/state`,
          {
            on: true,
            xy: FlagsEnum.white,
            bri: 77,
          }
        )
        .subscribe();
    }, 5000);
  }

  flashAllFlag() {
    for (const light in this.lights) {
      if (this.lights.hasOwnProperty(light)) {
        this.flashFlag(this.lights[light], FlagsEnum.green, 254);
      }
    }
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthorizationService {
  public bridgeIp: string = '';
  private appName = 'f1mvloveshue';
  private deviceName = 'local';
  public hueApiKey = new BehaviorSubject<string | undefined | null>('');
  public currStatus = '';

  constructor(private http: HttpClient) {
    const currKey = localStorage.getItem('hueApiKey');
    this.bridgeIp = localStorage.getItem('bridgeIp') ?? '';
    if (currKey) {
      this.currStatus = 'Successfully linked to bridge';
      this.hueApiKey.next(currKey);
    }
  }

  public getBridge() {
    this.http.get('https://discovery.meethue.com/').subscribe(resp => {
      const respConverted = resp as {
        id: string;
        internalipaddress: string;
        port: number;
      }[];
      this.bridgeIp = respConverted[0].internalipaddress;
      localStorage.setItem('bridgeIp', this.bridgeIp ?? '');
    });
  }

  public authorizeOnBridge() {
    const body = {
      devicetype: `${this.appName}#${this.deviceName}`,
      generateclientkey: true,
    };

    this.http.post(`https://${this.bridgeIp}/api`, body).subscribe(resp => {
      const respConverted = resp as {
        error?: { address: string; description: string; type: number };
        success?: { clientkey: string; username: string };
      }[];
      if (respConverted[0].error?.type === 101) {
        this.currStatus = 'Press link button, then retry';
        return;
      }

      this.currStatus = 'Successfully linked to bridge';
      this.hueApiKey.next(respConverted[0].success?.username);
      localStorage.setItem(
        'hueApiKey',
        respConverted[0].success?.username ?? ''
      );
    });
  }
}

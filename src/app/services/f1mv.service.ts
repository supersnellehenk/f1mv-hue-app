import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { Injectable } from '@angular/core';
import { FlagsEnum } from '../shared/enum/flags.enum';
import {
  Flag,
  flagToHueColorMapping,
  TrackStatusMessage,
  trackStatusToFlagMapping,
} from '../shared/enum/f1mvToFlags';

@Injectable({
  providedIn: 'root',
})
export class F1mvService {
  public f1mvUrl = '';
  public flagChange$ = new BehaviorSubject<number[]>(FlagsEnum.green);
  public lastMessage$ = new BehaviorSubject<TrackStatusMessage | null>(null);
  private lastMessage: TrackStatusMessage | null = null;

  constructor(private http: HttpClient) {
    this.f1mvUrl = localStorage.getItem('f1mvUrl') || 'http://localhost:10101';
  }

  private removeTrailingSlash(str: string) {
    return str.replace(/\/+$/, '');
  }

  public consumeApi() {
    this.f1mvUrl = this.removeTrailingSlash(
      this.f1mvUrl.replace('api/graphql', '')
    );
    return this.http
      .post(
        `${this.f1mvUrl}/api/graphql`,
        JSON.stringify({
          query: `query LiveTimingState {
                            liveTimingState {
                                TrackStatus
                            }
                        }`,
          operationName: 'LiveTimingState',
        }),
        { headers: { 'Content-Type': 'application/json' } }
      )
      .pipe(
        tap((resp: any) => {
          const message = resp.data.liveTimingState
            .TrackStatus as TrackStatusMessage;

          if (JSON.stringify(message) !== JSON.stringify(this.lastMessage)) {
            if (message.Message in trackStatusToFlagMapping) {
              const flag: Flag = trackStatusToFlagMapping[message.Message];
              const flagColor: number[] = flagToHueColorMapping[flag];
              this.flagChange$.next(flagColor);
            } else if (!this.lastMessage) {
              this.flagChange$.next(FlagsEnum.yellow);
            }

            this.lastMessage = message;
            this.lastMessage$.next(message);
          }
        })
      );
  }
}

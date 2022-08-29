import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, tap} from "rxjs";
import {Injectable} from "@angular/core";
import {FlagsEnum} from "../shared/enum/flags.enum";
import {F1mvToFlagsEnum, TrackStatusToFlagsEnum} from "../shared/enum/f1mvToFlags.enum";

@Injectable({
  providedIn: "root"
})
export class F1mvService {
  public f1mvUrl = "http://localhost:10101";
  public flagChange = new BehaviorSubject<number[]>(FlagsEnum.green);
  private lastMessage = null;

  constructor(private http: HttpClient) {
  }

  public consumeApi() {
    return this.http.get(`${this.f1mvUrl}/api/v1/live-timing/TrackStatus`).pipe(tap((resp: any) => {
      const message = resp;

      if (JSON.stringify(message) !== JSON.stringify(this.lastMessage)) {
        // @ts-ignore
        if (TrackStatusToFlagsEnum[message.Message]) {
          // @ts-ignore
          this.flagChange.next(TrackStatusToFlagsEnum[message.Message]);
        } else if (!this.lastMessage) {
          this.flagChange.next(FlagsEnum.yellow);
        }

        this.lastMessage = message;
      }
    }));
  }
}

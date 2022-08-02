import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: "root"
})
export class DiscoveryService {
  public bridgeIp: string = '';

  constructor(private http: HttpClient) {
  }

  public GetBridge() {
    this.http.get("https://discovery.meethue.com/").subscribe((resp) => {
      const respConverted = resp as { id: string; internalipaddress: string; port: number; }[];
      this.bridgeIp = respConverted[0].internalipaddress;
    })
  }
}

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class TrackingService {

  constructor(private http: HttpClient) { }

  getUsers(): Observable<any> {
    const url = `https://freshvnf-api.firebaseio.com/tracked-locations.json?shallow=true`;
    return this.http.get(url);
  }

  deliveryBoy(user): Observable<any> {
    const url = `https://freshvnf-api.firebaseio.com/tracked-locations/${user}.json`;
    return this.http.get(url);
  }

  latestLocation(): Observable<any> {
    const url = `https://route.freshvnf.com/delivery_details/live_data`;
    return this.http.get(url);
  }
}

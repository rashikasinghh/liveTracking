import { Component, OnInit } from '@angular/core';
import { TrackingService } from './../tracking.service';
import { MatSnackBar } from '@angular/material';
import { FormGroup, FormControl } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-tracking',
  templateUrl: './tracking.component.html',
  styleUrls: ['./tracking.component.css']
})
export class TrackingComponent implements OnInit {
lat = 19.0760;
lng = 72.8777;

locations = [];
allUsers = [];
start = [];
end = [];

valid = false;
delivery = false;

startTime: number;
endTime: number;
sameLocation = [];

locationForm = new FormGroup({
  name: new FormControl('')
});

  constructor(private service: TrackingService,
              private snackbar: MatSnackBar,
              private datePipe: DatePipe) { }

    // To close infoWindow when clicked on different marker
infoWindowOpened = null;
previousInfoWindow = null;
close_window() {
  if (this.previousInfoWindow != null ) {
    this.previousInfoWindow.close();
  }
}
select_marker(infoWindow) {
 if (this.previousInfoWindow == null) {
      this.previousInfoWindow = infoWindow;
    } else {
    this.infoWindowOpened = infoWindow;
    this.previousInfoWindow.close();
  }
  // tslint:disable-next-line:align
  this.previousInfoWindow = infoWindow;
}

  ngOnInit() {
    this.service.getUsers()
    .subscribe(user => {
      const users = user;
      for (const key in users) {
        if (users.hasOwnProperty(key)) {
        this.allUsers.push(key);
        }}}, err => {
            if (err.error instanceof Error) {
            this.snackbar.open('Client-side error', null, {duration: 2000});
            } else {
            this.snackbar.open('User data not fetched', null, {duration: 2000});
      }});
    this.service.latestLocation()
    .subscribe(response => {
      const live = response.live_location;
      live.forEach(us => {
        const a = {
          name: Object.keys(us)[0],
          value: Object.values(us)[0]
      };
      // tslint:disable-next-line:align
      this.locations.push(a);
    });
    },
      err => {
        if (err.error instanceof Error) {
          this.snackbar.open('Client-side error', null, {duration: 2000});
        } else {
          this.snackbar.open('Unable to fetch user latest location', null, {duration: 2000});
        }
      });
  }

  // To fetch locations travelled by delivery boy
  onClick() {
    this.locations = [];
    this.valid = true;
    const user = this.locationForm.value;
    this.service.deliveryBoy(user.name)
    .subscribe(response => {
      const result = response;
      const today = new Date('2019/04/06');
      const todayDate = this.datePipe.transform(today, 'yyyy/MM/dd');
      // tslint:disable-next-line:prefer-for-of
      for (let i = result.length - 1; i >= 0 ; i--) {
            const time1 = this.datePipe.transform(result[i].time, 'yyyy/MM/dd');
            if (todayDate === time1)  {
              this.delivery = true;
              this.locations.push({value: result[i]});
            }
      }
      if (this.delivery === true) {
        for (let j = 0; j < this.locations.length; j++) {
          if (j === 0) {
          this.startTime = this.locations[j].value.time;
          var startValue = this.locations[j].value;
          } else {
          this.endTime = this.locations[j].value.time;
          const endValue = this.locations[j].value;
          const timeDiff: number = Math.ceil((this.endTime - this.startTime) / 60000);
          if ( timeDiff >= 10) {
            if (startValue.lat === endValue.lat && startValue.lng === endValue.lng) {
              this.sameLocation.push(endValue);
            }
          }
          this.startTime = this.endTime;
          startValue = endValue;
        }
        }
      this.start = this.locations[this.locations.length - 1].value;
      this.end = this.locations[0].value;
    }
      if (this.delivery === false) {
        const action = 'network';
        this.snackbar.open('No location to track today!!!', action, {duration: 2000});
      }
    }, err => {
      if (err.error instanceof Error) {
        this.snackbar.open('Client-side error', null, {duration: 2000});
      } else {
        this.snackbar.open('Unable to fetch user latest location', null, {duration: 2000});
      }
    });
}
}


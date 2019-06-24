import { Component, OnInit } from '@angular/core';
import { LoginServiceService } from 'src/app/services/login-service/login-service.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  tfa: any = {};
  authcode: string = "";
  errorMessage: string = null;

  constructor(private _loginService: LoginServiceService) {
    this.getAuthDetails();
  }

  ngOnInit() {
  }

  getAuthDetails() {
    let jwtoken=JSON.parse(localStorage.getItem('jwtoken'));
    this._loginService.getAuth(jwtoken).subscribe((data) => {
      const result = data.body
      if (data['status'] === 200) {
        if (result == null) {
          this.setup();
        } else {
          this.tfa = result;
        }
      }
    });
  }

  setup() {
    let jwtoken=JSON.parse(localStorage.getItem('jwtoken'));
    this._loginService.setupAuth(jwtoken).subscribe((data) => {
      const result = data.body
      if (data['status'] === 200) {
        this.tfa = result;
      }
    });
  }

  confirm() {
    let jwtoken=JSON.parse(localStorage.getItem('jwtoken'));
    this._loginService.verifyAuth(jwtoken, this.authcode).subscribe((data) => {
      const result = data.body
      if (result['status'] === 200) {
        this.errorMessage = null;
        this.tfa.secret = this.tfa.tempSecret;
        this.tfa.tempSecret = "";
      } else {
        this.errorMessage = result['message'];
      }
    });
  }

  disabledTfa() {
    let jwtoken=JSON.parse(localStorage.getItem('jwtoken'));
    this._loginService.deleteAuth(jwtoken).subscribe((data) => {
      const result = data.body
      if (data['status'] === 200) {
        this.authcode = "";
        this.getAuthDetails();
      }
    });
  }

}

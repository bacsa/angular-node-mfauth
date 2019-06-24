import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginServiceService {
  headerOptions: any = null

  _isLoggedIn: boolean = false

  authSub = new Subject<any>();

  constructor(private _http: HttpClient) {
  }

  loginAuth(userObj: any) {
    if (userObj.authcode) {
      console.log('Appending headers');
      this.headerOptions = new HttpHeaders({
        'x-tfa': userObj.authcode
      });
    }
    return this._http.post("http://localhost:3000/login", { uname: userObj.uname, upass: userObj.upass }, { observe: 'response', headers: this.headerOptions });
  }

  setupAuth(jwtoken) {
    this.headerOptions = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': jwtoken
    });

    return this._http.post("http://localhost:3000/tfa/setup", {}, { observe: 'response', headers: this.headerOptions })
  }

  registerUser(userObj: any) {
    return this._http.post("http://localhost:3000/register", { uname: userObj.uname, upass: userObj.upass }, { observe: "response" });
  }

  updateAuthStatus(value: boolean) {
    this._isLoggedIn = value
    this.authSub.next(this._isLoggedIn);
    localStorage.setItem('isLoggedIn', value ? "true" : "false");
  }

  getAuthStatus() {
    this._isLoggedIn = localStorage.getItem('isLoggedIn') == "true" ? true : false;
    return this._isLoggedIn
  }

  logoutUser() {
    console.log('logoutUser');
    this._isLoggedIn = false;
    this.authSub.next(this._isLoggedIn)
    localStorage.setItem('isLoggedIn', "false")

    let jwtoken = localStorage.getItem('jwtoken')
    localStorage.setItem('jwtoken', "")
    
    this.headerOptions = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': jwtoken
    });
    
    return this._http.get("http://localhost:3000/tfa/delete", { observe: 'response', headers: this.headerOptions });
  }

  getAuth(jwtoken) {
    this.headerOptions = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': jwtoken
    });

    return this._http.get("http://localhost:3000/tfa/setup/", { observe: 'response', headers: this.headerOptions });
  }

  deleteAuth(jwtoken) {
    this.headerOptions = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': jwtoken
    });
    
    return this._http.get("http://localhost:3000/tfa/delete", { observe: 'response', headers: this.headerOptions });
  }

  verifyAuth(jwtoken, authcode) {
    this.headerOptions = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': jwtoken
    });

    return this._http.post("http://localhost:3000/tfa/verify", {authcode: authcode}, { observe: 'response', headers: this.headerOptions });
  }
}

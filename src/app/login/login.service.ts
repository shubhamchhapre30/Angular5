import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {login} from './login.modal';
const url = localStorage.getItem('API_url');
let getcompany_list_url = url+'/home/usercompanyList';
let login_url = url+'/home/login';
let get_login_user_info = url+'/home/login_user_info';
@Injectable()

export class LoginService {
    private currentUserSubject = new BehaviorSubject<login>(new login());
    public currentUser = this.currentUserSubject.asObservable().distinctUntilChanged();
    private isAuthenticatedSubject = new ReplaySubject<boolean>(1);
    public isAuthenticated = this.isAuthenticatedSubject;
    
   constructor(private http: HttpClient) {
        this.isAuthenticated.take(1).subscribe(data=>{
            console.log(data);
        })
    }

    getcompany_list(email){
        let body = new HttpParams()
        .set('email',email);
        return this.http.post(getcompany_list_url,body).catch(this.handler);
    }

    handler(error) {
        return Observable.throw(error.json().error || 'server error');
    }

    getlogin(data){
        let body = new HttpParams()
        .set('password',data.password)
        .set('company_id',data.company_id)
        .set('email',data.email);
        return this.http.post(login_url,body).catch(this.handler);
        // return this.http.post(login_url,body).map(data1=>{ 
        //     // this.setData(data1);
        //     return data1;
        // }).catch(this.handler);
    }
    setData(data){
        this.currentUserSubject.next(data.data);
        // Set isAuthenticated to true
        this.isAuthenticatedSubject.next(true);
    }

    get_login_user_data(user_id,company_id){
        let body = new HttpParams()
        .set('user_id',user_id)
        .set('company_id',company_id);
        return this.http.get(get_login_user_info,{params:body}).catch(this.handler);
    }
}
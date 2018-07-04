import { Injectable } from '@angular/core';
import { Http , Response,RequestOptions,Headers,URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/do';
// import { SERVER_URL } from './product';
import { Token } from '@angular/compiler';
import { HttpClient, HttpHeaders,HttpParams } from '@angular/common/http';

let URL = localStorage.getItem('SERVER_URL');
let loginUrl = URL+'/login';
let tokenURL = URL+'/accessToken';
let userStatus = URL+'/userstatus';


@Injectable()
export class ProductService {
   constructor(private http: HttpClient){}
  
    getLogin(loginparam) {
        let body = new HttpParams()
        .set('email',loginparam.email)
        .set('password',loginparam.password);
        let headers = new HttpHeaders()
        .set('Content-Type', 'application/x-www-form-urlencoded');

        return this.http.post(loginUrl, body,{headers:headers}).catch(this.handler);
   }
   

    handler(error){
        return Observable.throw(error.json().error || 'server error');
    }
   

    getNewToken(data){
        let body = new HttpParams()
        .set('email',data.email)
        .set('password',data.password)
        .set('user_id',data.user_id);
        let headers = new HttpHeaders().set( 'Content-Type','application/x-www-form-urlencoded');
       
        
        return this.http.post(tokenURL, body, {headers:headers}).timeout(40000)
            .catch(this.handler);
    }


    getUserStatus(data){
        let myHeaders = new HttpHeaders()
            .set( 'Content-Type','application/x-www-form-urlencoded')
            .set('Authorization','Bearer '+data.token); 
   
        let myParams = new HttpParams()
        .set('user', data.user_id);
        
        return this.http.get(userStatus,{ headers:  myHeaders,params:myParams}).timeout(40000)
        .catch(this.handler);
    }
}
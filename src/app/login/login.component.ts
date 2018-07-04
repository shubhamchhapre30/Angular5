import { Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule,FormGroup, FormBuilder, Validators,FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import {LoginService} from './login.service';

@Component ({
   selector: 'login',
   templateUrl: './login.component.html',
   styleUrls: ['./login.component.css'],
})
export class LoginComponent {
    user: {
		userName? : string,
		password? : string
    } = {};
    error:any;
    iserror:boolean = false;
    login_form: FormGroup;
    company_list:any =[];
    company_count:number=0;
    image:any = 'https://s3-ap-southeast-2.amazonaws.com/static.schedullo.com/upload/background.jpg';
    constructor( public loginservice:LoginService,public route:Router,private formBuilder: FormBuilder) {
        this.login_form = this.formBuilder.group({
            email: [null, [Validators.required,Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')]],
            password: [null, Validators.required],
            company_id:[null]
        });
            localStorage.setItem('API_url','http://192.168.1.27/schedullo/angular');
            localStorage.setItem('SERVER_URL',"http://192.168.1.27/schedullo/api/v1");
    }
    
    getcompany_list(email){
        this.loginservice.getcompany_list(email).subscribe(
            data=>{
               this.company_list = data.info.companys
               this.login_form.controls['company_id'].setValue(this.company_list[0].company_id);
               this.company_count = this.company_list.length;
            },
            error=>{

            }
        )
    }

    login(form){
        let data = form.value; 
        let loginInfo = {
            email : data.email,
            password : window.btoa(data.password),
            "company_id":data.company_id
        };
        this.loginservice.getlogin(loginInfo).subscribe(
          data1 => { 
               if(data1.response == 'success'){
                   localStorage.setItem('user_background_type',data1.data.user_background_type);
                   localStorage.setItem('user_background_name',data1.data.user_background_name);
                   localStorage.setItem('info',JSON.stringify(data1.data))
                   this.route.navigate(['/todo']);
                }
                if(data1.response == 'error'){ 
                    this.error = data1.message;
                    this.iserror = true;
                }
          },
          error=>{ 
              
          });
    }
}
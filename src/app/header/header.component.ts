import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../login/login.service';
import { SettingsComponent } from '../settings/settings.component';
import { UsersettingComponent } from '../usersetting/usersetting.component';
@Component({
    selector: 'header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent {
    info: any = '';
    company_info: any = '';
    Image_url: any = 'https://s3-ap-southeast-2.amazonaws.com/static.schedullo.com/';
    constructor(public router: Router, public loginservice: LoginService) {
        this.get_login_user_info();
        // this.setting.change_company_logo.subscribe(data=>{
        //     this.company_info.company_logo = data.company_image;
        // });
        // this.user_setting.user_profile.subscribe(data=>{ console.log(data);
        //     this.info.profile_image = data.user_profile;
        // })
    }

    get_login_user_info() {
        let user_info = JSON.parse(localStorage.getItem('info'));
        let user_id = user_info.user_id;
        let company_id = user_info.company_id;
        this.loginservice.get_login_user_data(user_id, company_id).subscribe(
            data => {
                this.info = data.info.user_info;
                this.company_info = data.info.company_info;
            }
        )
    }

    logout() {
        localStorage.removeItem('info');
        localStorage.removeItem('status');
        this.router.navigateByUrl('');
    }

}
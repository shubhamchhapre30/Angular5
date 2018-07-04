import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SettingsComponent } from '../settings/settings.component';

@Component ({
   selector: 'sidebar',
   templateUrl: './sidebar.component.html',
   
})
export class SidebarComponent  {
    customer_module_access:number;
    pricing_module_status:number;
    timesheet_module_status:number;
    constructor(){
        let user_info = JSON.parse(localStorage.getItem('info'));
        this.customer_module_access  = user_info.customer_module_activation;
        this.pricing_module_status = user_info.pricing_module_status;
        this.timesheet_module_status = user_info.timesheet_module_status;
        // this.setting.customer_access.subscribe(data=>{
        //     this.customer_module_access = data;
        // })
    } 
}
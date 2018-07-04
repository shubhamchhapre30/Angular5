import { Component } from '@angular/core';
import { TodoComponent } from '../todo/todo.component';
import { EventEmitter } from '@angular/core';


@Component ({
   selector: 'footer-layout',
   templateUrl: './footer.component.html',
   styleUrls: ['./footer.component.css']
   
})

export class FooterComponent  {
   color :any="";
   status:any="";
   calender_sorting:any="";
   user_color_id:any="";
   footerfilterData = new EventEmitter<any>();
   today: number = Date.now();
   filter_status:any = '';
   status_array:Array<any> = [];
   status_all:any = '0';
    constructor(public TodoComponent:TodoComponent){
         this.TodoComponent.footerData.subscribe(
            (data: any) => { 
                this.user_color_id=data.info.cal_user_color_id;
                this.calender_sorting=data.info.calender_sorting;
                this.color = data.colors;
                this.status=JSON.parse(localStorage.status);
                this.filter_status = data.info.task_status_id;
                let data1 = this.filter_status+'';
                let array= data1.split(',');
                array.forEach(element => {
                    this.status_array.push(element);  
                });
            });
            
            
    }
    footerfilter(){
        this.TodoComponent.sortcalenderfilter(this.calender_sorting,this.user_color_id,this.status_array)
     }
    
    checkstatus(task_status_id){
        let data = this.filter_status+'';
        let new_array= data.split(',');
        let status = false;
        new_array.forEach(element => { 
            if(element == task_status_id){
                status = true;
            }
        });
        return status;
     }
    
     allchecked(check){
        let checked:any = document.querySelectorAll('.newcheckbox_task1');
        if(check){
            this.status_array.push('all');
            for (var div of checked) {
                div.checked = true;
                var i = this.status_array.indexOf(div.value);
                if(i == -1){
                this.status_array.push(div.value);
                }
            }
            this.status_all = 0;
        }else{
            this.status_array.splice(0,1);
            for (var div of checked) {
                div.checked = false;
                var index = this.status_array.indexOf(div.value); 
                this.status_array.splice(index,1);
            }
            this.status_all = 1;
        }
        this.footerfilter();
     }

     checkedOtherStatus(status_id,check){
        let checked:any = document.querySelector('.newcheckbox_task2');
        var index = this.status_array.indexOf("all");
        if(index == 0){ 
            this.status_array.splice(index,1);
            checked.checked = 0;
        }

        if(check){
            var index = this.status_array.indexOf(status_id); 
                if(index == -1){
                    this.status_array.push(status_id);
                }
        }else{
            var index = this.status_array.indexOf(status_id); 
                this.status_array.splice(index,1);
        }
        this.status_all = 1;
        this.footerfilter();
     }

}
import { Component,ElementRef,ViewChild,ViewContainerRef,EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { TaskService } from '../services/task.service';
import { DragulaService } from 'ng2-dragula/ng2-dragula';
import { BsModalComponent } from 'ng2-bs3-modal';
import { TaskpopupComponent} from '../taskpopup/taskpopup.component';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import {MatDatepickerInputEvent} from '@angular/material/datepicker';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA,MatDialogConfig} from '@angular/material';
import { TimeConvert } from '../pipes/timeconvter.pipe';
import {ChangeFormat} from '../pipes/changeformat.pipe';
import { LoginService} from '../login/login.service';

@Component ({
   selector: 'todo',
   templateUrl: './todo.component.html',
   styleUrls: ['./todo.component.css'],
   providers:[TimeConvert,MatDialogConfig,ChangeFormat]
})
export class TodoComponent  {
    footerData = new EventEmitter<any>();
    filter_sorting:any="";
    filter_color:any="";
    filter_status:any = "";
    other_user_task_status:boolean;
    other_team_member_tasks:any = '';
    taskclear:string = '';
    tasks:any;
    task_input:any = '';
    week:{
        first?:string,
        last?:string
    } = {};
    options: any = {
        revertOnSpill: true
      }
    capacity:Array<any> = [];
    date_format:any = '';
    today_date:any ='';
    @ViewChild('recurrencewindow')
    recurrencewindow: BsModalComponent;
    @ViewChild('rightclickcomment')
    rightclickcomment:BsModalComponent;
    @ViewChild('rightclickdelete')
    rightclickdelete:BsModalComponent;
    @ViewChild('popupdeleteoption')
    popupdeleteoption: BsModalComponent;
    @ViewChild('showbacklogtask')
    showbacklogtask:BsModalComponent;
    @ViewChild('taskactualtime')
    taskactualtime:BsModalComponent;
    task_detail:any='';
    status:any = '';
    projects = '';
    team = '';  
    login_user_id:number;
    filter_project = 'all';
    filter_user:any = '';
    company_id:any ='';
    Image_url:any = 'https://s3-ap-southeast-2.amazonaws.com/static.schedullo.com/upload/user/';
    default_task_status:any = ''; 
    type_rec:any = '';
    colors:any = '';
    comment_data:any = '';
    task_another_info:any = '';
    nonSchedulleTask:any='';
    backlog_array:any = [];
    date_array:any = '';
    user_capacity:any = '';
    actual_time_status:number;
    on_complete_actual_time:number;
    user_task_type:any = '';
    is_authenticated:boolean = false;
    image:any = '';
    background:any;
    constructor(public route:Router,public loginservice:LoginService, public changeFormat:ChangeFormat, public dialogConfig: MatDialogConfig ,public time:TimeConvert,public dialog: MatDialog,public taskservice:TaskService,public toastr: ToastsManager,vcr: ViewContainerRef,public router:Router,private DragulaService:DragulaService,public ElementRef:ElementRef){
        // this.loginservice.isAuthenticated.take(1).subscribe(authenticated=>{
        //     this.is_authenticated = authenticated;
        // })
        // if(!this.is_authenticated){
        //     this.router.navigateByUrl('');
        // }else{console.log(this.loginservice.currentUser);
        //     this.loginservice.currentUser.subscribe(data=>{
        //         this.login_user_id = data.user_id;
        //         this.company_id = data.company_id
        //     })
        //     this.getTask();
        // }
        let user_info = JSON.parse(localStorage.getItem('info'));
        this.login_user_id = user_info.user_id
        this.company_id = user_info.company_id;
        this.getTask();
        this.toastr.setRootViewContainerRef(vcr);
        DragulaService.drop.subscribe((value) => {
            const [bagName, elSource, bagTarget, bagSource, elTarget] = value;
            let allIndex = this.getAllElementIndex(bagTarget);
            const newIndex = elTarget ? this.getElementIndex(elTarget) : bagTarget.childElementCount;
            this.dragtask(value,newIndex,allIndex);
        });
        this.background = localStorage.getItem('user_background_type');
        if(this.background == 'Image'){
            this.image = this.Image_url+localStorage.getItem('user_background_name');
        }else if(this.background == 'DefaultImage'){
            this.image = 'https://s3-ap-southeast-2.amazonaws.com/static.schedullo.com/upload/background.jpg';
        }else{
            this.image = localStorage.getItem('user_background_name');
        }
    }
    
    getElementIndex(el: HTMLElement): number {
        return [].slice.call(el.parentElement.children).indexOf(el);
    }
    getAllElementIndex(el:HTMLElement){
        let arrayIndex = [].slice.call(el.children);
        let index:Array<any> = [];
        arrayIndex.forEach(element => { 
            var id = element.id.replace('task_','');
            index.push(id);
        });
        return index;
    }
    

    replace_space(task){
        return  task.replace(" ", "");
    }
    /**
     * Open task modal popup
     */
    open(task_info,type='') { 
        this.user_task_type = type;
        this.task_detail = JSON.parse(JSON.stringify(task_info));
        this.dialogConfig.disableClose = true;
        this.dialogConfig.width = "800px";
        this.dialogConfig.data = {
            task_info: this.task_detail,
            type: this.type_rec,
            access:''
        }
        let dialogRef = this.dialog.open(TaskpopupComponent,this.dialogConfig);
          dialogRef.componentInstance.change_array.subscribe(data=>{
            if(this.user_task_type == 'other_user'){
                this.other_team_member_tasks.forEach((element,index) => {
                    element.task_list.forEach((element1,index1) => {
                        if(element1.task_id == this.task_detail.task_id){
                            this.other_team_member_tasks[index].task_list[index1].task_id = data; 
                        }
                    });
                });
            } else{ 
                this.tasks.forEach((element,index) => {
                    element.task_list.forEach((element1,index1) => {
                        if(element1.task_id == this.task_detail.task_id){
                            this.tasks[index].task_list[index1].task_id = data; 
                        }
                    });
                });
            }
          })
          dialogRef.afterClosed().subscribe(result => { 
            if(result.status == 'hide'){
                this.comment_data = this.task_another_info;
                this.popupdeleteoption.open();
            }else if(result.status == 'single'){
                this.comment_data = JSON.stringify(this.task_detail);
                this.delete_task('','occurrence');
            }else{
                this.task_detail = result.info;
                this.comment_data = '';
                this.update_task(result.status);
            }
          });
    }
    /**
     * Get task list for rendering calendar view.
     */
    getTask(){
        let data1:any = {
            "user_id":this.login_user_id,
            "company_id": this.company_id
        };
        this.taskservice.getTaskList(data1).subscribe(
            data => { 
                localStorage.setItem('status',JSON.stringify(data.info.task_status));
                this.status = JSON.parse(localStorage.getItem('status'));
                this.default_task_status = this.get_task_status_id_by_name('Ready');
                this.other_team_member_tasks = data.other_user_tasks;// other users tasks
                if(data.info.show_other_user_task == 1){
                    this.other_user_task_status = true; // other users task status for hide/show
                }else{
                    this.other_user_task_status = false; // other users task status for hide/show
                }
                this.nonSchedulleTask= data.nonSchedulleTask;
                this.colors = data.info.color_codes;
                this.filter_project = data.info.calender_project_id;
                this.filter_user = data.info.calender_team_user_id;
                this.filter_sorting = data.info.calender_sorting;
                this.filter_color = data.info.cal_user_color_id;
                this.filter_status = data.info.left_task_status_id;
                this.date_format = data.info.date_format;
                this.today_date = data.info.today;
                this.tasks  = data.task_list;
                this.week.first = data.info.start_date;
                this.week.last = data.info.end_date;
                this.projects = data.info.projects;
                this.team = data.info.team;
                this.date_array = data.info.date_arr;
                this.user_capacity = data.info.capacity;
                this.actual_time_status = data.info.actual_time_status;
                let emit_data={
                    "colors":this.colors,
                    "info":data.info.last_rember_values
                }
                this.footerData.emit(emit_data);//set colors in emit data
                this.set_capacity_bar();
             },
            error=>{ 
            });
    
    }

    change_view(type){
        if(type == 'pre'){
        var  date = this.week.last;
        }else{
         var date = this.week.last;
        }
        this.filter_user = this.login_user_id;
        
        let data1:any = {
            "user_id":this.login_user_id,
            "company_id":this.company_id,
            "type":type,
            "date":date,
            "filters":''
        };
        this.taskservice.changeView(data1).subscribe(
            data => { 
                this.other_team_member_tasks = data.other_user_tasks;// other users tasks
                if(data.info.show_other_user_task == 1){
                    this.other_user_task_status = true; // other users task status for hide/show
                }else{
                    this.other_user_task_status = false; // other users task status for hide/show
                }
                this.capacity.length = 0;
                this.date_format = data.info.date_format;
                this.today_date = data.info.today;
                this.tasks  = data.task_list;
                this.week.first = data.info.start_date;
                this.week.last = data.info.end_date;
                this.date_array = data.info.date_arr;
                this.user_capacity = data.info.capacity;
                this.set_capacity_bar();
                
            },
            error=>{ 
            }
            );
    }

    change_add_icon(index){
        let hide:any = document.querySelector("#task"+index);
        hide.style.display="none";

        let show:any  = document.querySelector("#inputtag"+index);
        show.style.display = 'block';
        
        let task:any = document.querySelector("#tasktag"+index);
        task.focus();
    }

    create_task(task_name,date,index,keyword){
        let data1:any = {
            "user_id":this.login_user_id,
            "task_title":task_name,
            "scheduled_date":date,
            "task_status_id":this.default_task_status,
            "company_id":this.company_id,
            "task_allocated_user_id":this.filter_user,
            "project_id":this.filter_project
        };
        
        this.taskservice.add_task(data1).subscribe(
            data => { 
                this.tasks.forEach(element => {
                    if(element.date == date){
                        element.task_list.push(data.task_info);
                    }
                });
                if(keyword == 'enter' ){
                    this.open(data.task_info);
                }
                let hide:any = document.querySelector("#task"+index);
                hide.style.display="block";

                let show:any  = document.querySelector("#inputtag"+index);
                show.style.display = 'none';
                 this.taskclear = '';
            },
            error=>{ 
            });
    }

    changetag(index){
        let hide:any = document.querySelector("#task"+index);
        hide.style.display="block";

        let show:any  = document.querySelector("#inputtag"+index);
        show.style.display = 'none';
         this.taskclear = '';
         
    }
  /**
   * Use when click on compress/expand icon on the task widget.
   * @param index 
   * @param index2 
   * @param task_id 
   */
    save_task_pos(task_id){
        let value:number;
        let display1:any = document.querySelector("#hide_show_"+task_id);
        let change_icon:any = document.querySelector('#chnage_icon_'+task_id);
        if(display1.style.display == "block"){
            value = 0;
            display1.style.display = "none";
            change_icon.innerHTML = '<i class="fa fa-expand" aria-hidden="true"></i>';
        }else{
            value = 1;
            display1.style.display = "block";
            change_icon.innerHTML = '<i class="fa fa-compress" aria-hidden="true"></i>'
        }
        let data1 = {
            "task_id":task_id,
            "user_id":this.login_user_id,
            "value":value
        };
        this.taskservice.save_task_pos(data1).subscribe(data=>{
           
                this.other_team_member_tasks.forEach((element,index) => {
                    element.task_list.forEach((element1, index1) => {
                        if (element1.task_id == task_id) {
                            this.other_team_member_tasks[index].task_list[index1].task_ex_pos = value;
                        }
                    });
                });
            
                this.tasks.forEach((element, index) => {
                    element.task_list.forEach((element1, index1) => {
                        if (element1.task_id == task_id) {
                            this.tasks[index].task_list[index1].task_ex_pos = value;
                        }
                    });
                });
            
        },
        error=>{

        });

    }

    dragtask(value,ind,indexALL){  
        let id = value[1].id;
        let id1 = document.querySelector("#"+id).closest('td').id;
        let new_id = id.replace('task_','');
        let id2:any = id1.split('_');
        let task_info:any = '';
        this.tasks.forEach((element, index) => {
            element.task_list.forEach((element1, index1) => {
                if (element1.task_id == new_id) {
                    task_info = element1;
                }
            });
        });
        let move_date:any = id2[1];
        var date = new Date(move_date).toDateString();
        let scheduled_date = new Date(date).getFullYear()+"-"+((new Date(date).getMonth() +1).toString().length == 1? ("0"+(new Date(date).getMonth() +1)) : (new Date(date).getMonth() +1))+"-"+(new Date(date).getDate().toString().length == 1? ("0"+new Date(date).getDate()) : new Date(date).getDate());
        let data1:any = {
            "user_id":this.login_user_id,
            "task_id":new_id,
            "task_scheduled_date":scheduled_date,
            "company_id":this.company_id,
            "task_info":task_info,
            "index":indexALL
        };
        
            this.taskservice.dragTask(data1).subscribe(
                data => { 
                    this.tasks.forEach((element,index) => {
                        element.task_list.forEach((element1,index1) => {
                            if(element1.task_id == new_id){ 
                                this.tasks[index].task_list.splice(index1,1);
                            }
                        });
                        if(element.date == scheduled_date){
                            this.tasks[index].task_list.splice((ind-1),0,data.task_info);
                        }
                    });
                },
                error=>{ 
                    
                }
            );
        
    }

    is_completed(task_info){
        let task_info1:any = JSON.parse(JSON.stringify(task_info));
        if(task_info1.task_status_name == 'Completed'){
            status = '0';
        }else{
            status = '1';
        }
        let data1:any = {
            "task_info":task_info1,
            "user_id":this.login_user_id,
            "task_id":task_info1.task_id,
            "is_completed":status,
            "company_id":this.company_id,
            "time":''
        };
        let dependency={
            "task_id":task_info1.prerequisite_task_id,
            "user_id":task_info1.task_allocated_user_id,
            "company_id":this.company_id
        }
        this.taskservice.complete_task(data1).subscribe(
            data => {
                    this.other_team_member_tasks.forEach((element,index) => {
                        element.task_list.forEach((element1,index1) => {
                            if(element1.task_id == task_info1.task_id){ 
                                this.other_team_member_tasks[index].task_list[index1] = data.info;
                            }
                        });
                    });
                
                    this.tasks.forEach((element,index) => {
                        element.task_list.forEach((element1,index1) => {
                            if(element1.task_id == task_info1.task_id){ 
                                this.tasks[index].task_list[index1] = data.info;
                            }
                        });
                    });
                    if(task_info1.is_prerequisite_task == 1){
                        this.taskservice.check_completed_task_dependency(dependency).subscribe(
                            data=>{
                                this.tasks.forEach((element,index) => {
                                    element.task_list.forEach((element1,index1) => {
                                        if(element1.task_id == task_info1.prerequisite_task_id){ 
                                            this.tasks[index].task_list[index1].task_status_id = data.info.task_status_id;
                                            this.tasks[index].task_list[index1].task_status_name = this.get_status_name_by_id(data.info.task_status_id);
                                            this.tasks[index].task_list[index1].completed_depencencies = data.info.completed_depencencies;
                                        }
                                    });
                                });
                                this.other_team_member_tasks.forEach((element,index) => {
                                    element.task_list.forEach((element1,index1) => {
                                        if(element1.task_id == task_info1.prerequisite_task_id){ 
                                            this.other_team_member_tasks[index].task_list[index1].task_status_id = data.info.task_status_id;
                                            this.other_team_member_tasks[index].task_list[index1].task_status_name = this.get_status_name_by_id(data.info.task_status_id);
                                            this.other_team_member_tasks[index].task_list[index1].completed_depencencies = data.info.completed_depencencies;
                                        }
                                    });
                                });
                            },error=>{
                                console.log(error);
                        });
                    }
               
            },
            error=>{ 
               
            }
        );
    }

    get_task_status_id_by_name(name){
        let status:any = JSON.parse(localStorage.getItem('status'));
        let status_id = '';
        status.forEach(element => { 
            if(element.task_status_name == name){
                status_id = element.task_status_id;
            }
        });
        return status_id;
    }

    get_status_name_by_id(id){
        let status:any = JSON.parse(localStorage.getItem('status'));
        let status_id = '';
        status.forEach(element => {// console.log(element);
            if(element.task_status_id == id){
                status_id = element.task_status_name;
            }
        });
        return status_id;
    }

    update_task(form){
        let info = form.value; 
        let data1:any = {
            "user_id":this.login_user_id,
            "company_id":this.company_id,
            "task_info":this.task_detail,
            "info":info,
            "start_date":this.week.first,
            "from":'calendar'
        };

        this.taskservice.updatetask(data1).subscribe(
            data => { 
                if(this.user_task_type == 'other_user'){
                    this.other_team_member_tasks.forEach((element,index) => {
                        element.task_list.forEach((element1,index1) => {
                           if(element1.task_id == this.task_detail.task_id && this.task_detail.frequency_type == 'one_off'){ 
                               this.other_team_member_tasks[index].task_list[index1] = data.task_info.tasks;
                           }else{
                               if(element1.master_task_id == this.task_detail.task_id && element1.frequency_type == 'recurrence' && this.task_detail.frequency_type == 'recurrence'){
                                   this.other_team_member_tasks[index].task_list.splice(index1,1);
                               } else if(element1.task_id == this.task_detail.task_id && element1.frequency_type == 'one_off' && this.task_detail.frequency_type == 'recurrence'){
                                   this.other_team_member_tasks[index].task_list.splice(index1,1);
                               }
                               if(this.task_detail.frequency_type == 'one_off'){
                                   if(element1.task_id.search(this.task_detail.task_id) > 0){
                                       this.other_team_member_tasks[index].task_list.splice(index1,1);
                                       this.type_rec = 'add';
                                   }
                               }
                           }
                       });
                      
                           if(data.task_info.tasks.task_scheduled_date == element.date && this.task_detail.frequency_type =='one_off' && this.type_rec == 'add'){
                               this.other_team_member_tasks[index].task_list.push(data.task_info.tasks);
                           }
                       
                   });
                   
                   if(this.task_detail.frequency_type == 'recurrence'){
                       this.other_team_member_tasks.forEach((element,index) => {
                           data.task_info.tasks.forEach((element1,index1) => {
                               if(element.date == element1.date && element1.task_list !=''){ 
                                   this.other_team_member_tasks[index].task_list.push(element1.task_list[0]);
                               }        
                           });
                       });
                   }
                } else{
                this.tasks.forEach((element,index) => {
                     element.task_list.forEach((element1,index1) => {
                        if(element1.task_id == this.task_detail.task_id && this.task_detail.frequency_type == 'one_off'){ 
                            this.tasks[index].task_list[index1] = data.task_info.tasks;
                        }else{
                            if(element1.master_task_id == this.task_detail.task_id && element1.frequency_type == 'recurrence' && this.task_detail.frequency_type == 'recurrence'){
                                this.tasks[index].task_list.splice(index1,1);
                            } else if(element1.task_id == this.task_detail.task_id && element1.frequency_type == 'one_off' && this.task_detail.frequency_type == 'recurrence'){
                                this.tasks[index].task_list.splice(index1,1);
                            }
                            if(this.task_detail.frequency_type == 'one_off'){
                                if(element1.task_id.search(this.task_detail.task_id) > 0){
                                    this.tasks[index].task_list.splice(index1,1);
                                    this.type_rec = 'add';
                                }
                            }
                        }
                    });
                   
                        if(data.task_info.tasks.task_scheduled_date == element.date && this.task_detail.frequency_type =='one_off' && this.type_rec == 'add'){
                            this.tasks[index].task_list.push(data.task_info.tasks);
                        }
                    
                });
                
                if(this.task_detail.frequency_type == 'recurrence'){
                    this.tasks.forEach((element,index) => {
                        data.task_info.tasks.forEach((element1,index1) => {
                            if(element.date == element1.date && element1.task_list !=''){ 
                                this.tasks[index].task_list.push(element1.task_list[0]);
                            }        
                        });
                    });
                }
                this.set_capacity_bar();

                }
                this.type_rec = '';
                // this.close();
           },
            error=>{ 
                
            }
        );
    }

    render_project_filter(id){
            let date = this.week.first;
            let u:any = '0';
            if(id=='all'){
                 u = this.login_user_id;
            }
            let filter_array={
                "filter_user": u,
                "filter_project":id,
                "calender_sorting":this.filter_sorting,
                "user_color":this.filter_color,
                "filter_status":this.filter_status
            };
            let data1:any = {
                "user_id":this.login_user_id,
                "company_id":this.company_id,
                "type":"current",
                "date":date,
                "filters":filter_array
            };
            this.taskservice.changeView(data1).subscribe(
                data => {
                    this.other_team_member_tasks = data.other_user_tasks;// other users tasks
                    if(data.info.show_other_user_task == 1){
                        this.other_user_task_status = true; // other users task status for hide/show
                    }else{
                        this.other_user_task_status = false; // other users task status for hide/show
                    }
                    this.filter_project = data.info.calender_project_id;
                    this.filter_user = data.info.calender_team_user_id;
                    this.capacity.length = 0;
                    this.date_format = data.info.date_format;
                    this.today_date = data.info.today;
                    this.tasks  = data.task_list;
                    this.week.first = data.info.start_date;
                    this.week.last = data.info.end_date;
                    this.date_array = data.info.date_arr;
                    this.user_capacity = data.info.capacity;
                    this.set_capacity_bar();
                    
                },
                error=>{ 
                    
                
                });
    }
    filter_calendar(id){
            let date = this.week.first;
            if(id == 'me'){
                id = this.login_user_id;
            }
            let filter_array={
                "filter_user": id,
                "filter_project":'all',
                "calender_sorting":this.filter_sorting,
                "user_color":this.filter_color,
                "filter_status":this.filter_status
            };
            let data1:any = {
                "user_id":this.login_user_id,
                "company_id":this.company_id,
                "type":"current",
                "date":date,
                "filters":filter_array
            };
            this.taskservice.changeView(data1).subscribe(
                data => {
                    this.other_team_member_tasks = data.other_user_tasks;// other users tasks
                    if(data.info.show_other_user_task == 1){
                        this.other_user_task_status = true; // other users task status for hide/show
                    }else{
                        this.other_user_task_status = false; // other users task status for hide/show
                    }
                    this.filter_project = data.info.calender_project_id;
                    this.filter_user = data.info.calender_team_user_id;
                    this.capacity.length = 0;
                    this.date_format = data.info.date_format;
                    this.today_date = data.info.today;
                    this.tasks  = data.task_list;
                    this.week.first = data.info.start_date;
                    this.week.last = data.info.end_date;
                    this.date_array = data.info.date_arr;
                    this.user_capacity = data.info.capacity;
                    this.set_capacity_bar();
                    
                },
                error=>{ 
                });
    }
    recurrence_close(){
       this.recurrencewindow.close();
    }
    recurrence_open(task,type){
        this.user_task_type = type;
        this.task_detail =  JSON.parse(JSON.stringify(task));
        this.task_another_info = JSON.stringify(task);
        this.recurrencewindow.open();
    }

    recurrence(type,task_id){
        if(type == 'series'){
            this.task_detail.task_id = task_id;
            this.task_detail.master_task_id = 0;
            this.type_rec = '';
        }else{
            this.task_detail.frequency_type = 'one_off';
            this.type_rec = 'occurrence';
        }
        this.recurrencewindow.close();
        this.open(this.task_detail,this.user_task_type);
        
    }
    
    change_view1(event: MatDatepickerInputEvent<Date>){
        let date = this.changeFormat.transform(event.value);
        let data1:any = {
            "user_id":this.login_user_id,
            "company_id":this.company_id,
            "type":'pre',
            "date":date,
            "filters":'',
        };
        this.taskservice.changeView(data1).subscribe(
            data => { 
                this.capacity.length = 0;
                this.date_format = data.info.date_format;
                this.today_date = data.info.today;
                this.tasks  = data.task_list;
                this.week.first = data.info.start_date;
                this.week.last = data.info.end_date;
                this.date_array = data.info.date_arr;
                this.user_capacity = data.info.capacity;
                this.set_capacity_bar();
                this.other_team_member_tasks = data.other_user_tasks;// other users tasks
                if(data.info.show_other_user_task == 1){
                    this.other_user_task_status = true; // other users task status for hide/show
                }else{
                    this.other_user_task_status = false; // other users task status for hide/show
                }
                
            },
            error=>{ 
            }
            );
    }

    change_priority(task_id,priority,task_info){
        let data1:any = {
            "task_id":task_id,
            "user_id":this.login_user_id,
            "company_id":this.company_id,
            "task_priority":priority,
            "task_info":task_info
        };
        this.taskservice.change_priority(data1).subscribe(
            data=>{
                
                    this.other_team_member_tasks.forEach((element,index) => {
                        element.task_list.forEach((element1,index1) => {
                            if(element1.task_id == task_id){ 
                                this.other_team_member_tasks[index].task_list[index1] = data.info;
                            }
                        });
                    });
                
                    this.tasks.forEach((element,index) => {
                        element.task_list.forEach((element1,index1) => {
                        if(element1.task_id == task_id){ 
                            this.tasks[index].task_list[index1] = data.info;
                        }
                        });
                    });
                
            },
            error =>{
            }
        );
    }

    add_watch_list(task_id,task_info){
        let data1:any = {
            "task_id":task_id,
            "company_id":this.company_id,
            "watch_list":1,
            "task_info":task_info
        };
        this.taskservice.watch_list(data1).subscribe(
            data=>{
                
                    this.other_team_member_tasks.forEach((element,index) => {
                        element.task_list.forEach((element1,index1) => {
                            if(element1.task_id == task_id){ 
                                this.other_team_member_tasks[index].task_list[index1] = data.info;
                            }
                        });
                    });
                
                    this.tasks.forEach((element,index) => {
                        element.task_list.forEach((element1,index1) => {
                        if(element1.task_id == task_id){ 
                            this.tasks[index].task_list[index1] = data.info;
                        }
                        });
                    });
               
            },
            error =>{
            }
        );
    }
    remove_watch_list(task_id,task_info){
        let data1:any = {
            "task_id":task_id,
            "company_id":this.company_id,
            "watch_list":0,
            "task_info":task_info
        };
        this.taskservice.watch_list(data1).subscribe(
            data=>{
                
                    this.other_team_member_tasks.forEach((element,index) => {
                        element.task_list.forEach((element1,index1) => {
                            if(element1.task_id == task_id){ 
                                this.other_team_member_tasks[index].task_list[index1] = data.info;
                            }
                        });
                    });
                
                    this.tasks.forEach((element,index) => {
                        element.task_list.forEach((element1,index1) => {
                        if(element1.task_id == task_id){ 
                            this.tasks[index].task_list[index1] = data.info;
                        }
                        });
                    });
                
            },
            error =>{
            }
        );
    }

    change_status(task_id,status_id,task_info){
        let data1:any = {
            "task_id":task_id,
            "company_id":this.company_id,
            "status_id":status_id,
            "task_info":task_info,
            "user_id":this.login_user_id
        };
        this.taskservice.change_status(data1).subscribe(
            data=>{
                
                    this.other_team_member_tasks.forEach((element,index) => {
                        element.task_list.forEach((element1,index1) => {
                            if(element1.task_id == task_id){ 
                                this.other_team_member_tasks[index].task_list[index1] = data.info;
                            }
                        });
                    });
                
                    this.tasks.forEach((element,index) => {
                        element.task_list.forEach((element1,index1) => {
                        if(element1.task_id == task_id){ 
                            this.tasks[index].task_list[index1] = data.info;
                        }
                        });
                    });
                
            },
            error =>{
            }
        );
    }

    copy_task(task_id,task_info){
        let data1:any = {
            "task_id":task_id,
            "company_id":this.company_id,
            "task_info":task_info,
            "user_id":this.login_user_id
        };
        this.taskservice.copy_task(data1).subscribe(
            data=>{
                
                    this.other_team_member_tasks.forEach((element,index) => {
                        if(element.date == data.info.task_scheduled_date && data.info.task_allocated_user_id != this.login_user_id){ 
                            this.other_team_member_tasks[index].task_list.push(data.info);
                        } 
                    });
                
                    this.tasks.forEach((element,index) => {
                        if(element.date == data.info.task_scheduled_date && data.info.task_allocated_user_id == this.login_user_id){ 
                            this.tasks[index].task_list.push(data.info);
                        } 
                    });
                
            },
            error =>{
            }
        );
    }

    change_task_color(task_id,color_id,task_info){
        let data1:any = {
            "task_id":task_id,
            "company_id":this.company_id,
            "task_info":task_info,
            "user_id":this.login_user_id,
            "color_id":color_id
        };
        this.taskservice.change_color(data1).subscribe(
            data=>{
                this.tasks.forEach((element,index) => {
                    element.task_list.forEach((element1,index1) => {
                        if(element1.task_id == task_id){ 
                            this.tasks[index].task_list[index1] = data.info;
                        }
                     });
                });
            },
            error =>{
            }
        );
    }

    rightclick_comment(task_id,task_data){
        this.comment_data = JSON.stringify(task_data);
        this.rightclickcomment.open();
    }
    close_rightclick_comment(){
        this.comment_data = '';
        this.rightclickcomment.close();
    }

    save_comment(form){
        let info = JSON.parse(form.info.value);
        let comment = form.right_task_comment.value;
        if(comment !=''){
            let data1:any = {
                "company_id":this.company_id,
                "task_info":info,
                "user_id":this.login_user_id,
                "comment":comment
            };
            this.taskservice.right_click_comment(data1).subscribe(
                data=>{
                   
                        this.other_team_member_tasks.forEach((element,index) => {
                            element.task_list.forEach((element1,index1) => {
                                if(element1.task_id == info.task_id){ 
                                    this.other_team_member_tasks[index].task_list[index1] = data.info;
                                }
                            });
                        });
                   
                        this.tasks.forEach((element,index) => {
                            element.task_list.forEach((element1,index1) => {
                                if(element1.task_id == info.task_id){ 
                                    this.tasks[index].task_list[index1] = data.info;
                                }
                            });
                        });
                    
                    form.right_task_comment.value = '';
                    this.close_rightclick_comment();
                },
                error =>{
                }
            );
        }else{
            this.toastr.error('Please enter comment.','',{positionClass:'toast-top-center'});
        }
    }

    right_click_delete(task_data){
        this.comment_data = JSON.stringify(task_data);
        this.rightclickdelete.open();
    }
    close_right_click_delete(){
        this.comment_data = '';
        this.rightclickdelete.close();
    }

    close_taskpopup_option(){
        this.comment_data = '';
        this.task_another_info = '';
        this.popupdeleteoption.close();
    }
    delete_task(task,type){
        if(type == 'single'){ 
            let data1:any = {
                "company_id":this.company_id,
                "task_info":task,
                "user_id":this.login_user_id,
                "type":type
            };
            this.taskservice.delete_task(data1).subscribe(
                data=>{

                    this.other_team_member_tasks.forEach((element, index) => {
                        element.task_list.forEach((element1, index1) => {
                            if(element1.task_id == task.task_id){ 
                                this.other_team_member_tasks[index].task_list.splice(index1, 1);
                            }
                        });
                    });
                    
                    this.tasks.forEach((element,index) => {
                        element.task_list.forEach((element1,index1) => {
                            if(element1.task_id == task.task_id){ 
                                this.tasks[index].task_list.splice(index1,1);
                            }
                         });
                    });
                    this.set_capacity_bar();
                },
                error =>{
                }
            );
        }else{
            let info = JSON.parse(this.comment_data);
            let data1:any = {
                "company_id":this.company_id,
                "task_info":info,
                "user_id":this.login_user_id,
                "type":type
            };
            this.taskservice.delete_task(data1).subscribe(
                data=>{
                    this.other_team_member_tasks.forEach((element, index) => {
                        element.task_list.forEach((element1, index1) => {
                            if(element1.task_id == info.task_id && type == 'occurrence'){ 
                                this.other_team_member_tasks[index].task_list.splice(index1,1);
                            }
                            if((element1.task_id.search(info.master_task_id) > 0) && type == 'series'){
                                this.other_team_member_tasks[index].task_list.splice(index1,1);
                            }
                            if((element1.task_id.search(info.master_task_id) > 0) && type == 'future' && element1.task_scheduled_date > data.date){
                                this.other_team_member_tasks[index].task_list.splice(index1,1);
                            }
                        });
                    });
                    this.tasks.forEach((element,index) => {
                        element.task_list.forEach((element1,index1) => {
                            if(element1.task_id == info.task_id && type == 'occurrence'){ 
                                this.tasks[index].task_list.splice(index1,1);
                            }
                            if((element1.task_id.search(info.master_task_id) > 0) && type == 'series'){
                                this.tasks[index].task_list.splice(index1,1);
                            }
                            if((element1.task_id.search(info.master_task_id) > 0) && type == 'future' && element1.task_scheduled_date > data.date){
                                this.tasks[index].task_list.splice(index1,1);
                            }
                         });
                    });
                    this.close_right_click_delete();
                    this.close_taskpopup_option();
                    this.comment_data = '';
                    this.task_another_info = '';
                },
                error =>{
                }
            );
        }
    }

    update_due_date(event,info){ 
        let new_date = this.changeFormat.transform(event);
        let data1:any = {
            "company_id":this.company_id,
            "task_info":info,
            "user_id":this.login_user_id,
            "type":'due_date',
            'date':new_date
        };
        this.taskservice.update_task_date(data1).subscribe(
            data=>{
                this.other_team_member_tasks.forEach((element, index) => {
                    element.task_list.forEach((element1, index1) => {
                        if(element1.task_id == info.task_id){
                            this.other_team_member_tasks[index].task_list[index1] = data.info;
                        }
                    });
                });
                this.tasks.forEach((element,index) => {
                    element.task_list.forEach((element1,index1) => {
                        if(element1.task_id == info.task_id){ 
                            this.tasks[index].task_list[index1] = data.info;
                        }
                     });
                });
            },
            error =>{
            }
        );
    }

    update_scheduled_date(event,info){
        let new_date = this.changeFormat.transform(event);
        let data1:any = {
            "company_id":this.company_id,
            "task_info":info,
            "user_id":this.login_user_id,
            "type":'scheduled_date',
            'date':new_date
        };
        this.taskservice.update_task_date(data1).subscribe(
            data=>{
                this.other_team_member_tasks.forEach((element, index) => {
                    element.task_list.forEach((element1,index1) => {
                        if(element1.task_id == info.task_id){ 
                            this.other_team_member_tasks[index].task_list.splice(index1,1);
                        }
                     });
                     if(element.date == data.info.task_scheduled_date){ 
                        this.other_team_member_tasks[index].task_list.unshift(data.info);
                    } 
                });
                this.tasks.forEach((element,index) => {
                    element.task_list.forEach((element1,index1) => {
                        if(element1.task_id == info.task_id){ 
                            this.tasks[index].task_list.splice(index1,1);
                        }
                     });
                     if(element.date == data.info.task_scheduled_date){ 
                        this.tasks[index].task_list.unshift(data.info);
                    } 
                });
            },
            error =>{
            }
        );
    }
    
     /***********function for sort calerder value******************************* */
     sortcalenderfilter(calender_sorting,user_color_id,filter_status){
        let date = this.week.first;
         this.filter_color=user_color_id;
         this.filter_sorting=calender_sorting;
         this.filter_status= filter_status.join(',');
        let filter_array={
            "filter_user": this.filter_user,
            "filter_project":this.filter_project,
            "calender_sorting":this.filter_sorting,
            "user_color":this.filter_color,
            "filter_status":this.filter_status
        };
        let data1:any = {
            "user_id":this.login_user_id,
            "company_id":this.company_id,
            "type":"current",
            "date":date,
            "filters":filter_array 
        };
        this.taskservice.changeView(data1).subscribe(
            data => {
                this.capacity.length = 0;
                this.date_format = data.info.date_format;
                this.today_date = data.info.today;
                this.tasks  = data.task_list;
                this.week.first = data.info.start_date;
                this.week.last = data.info.end_date;
                this.date_array = data.info.date_arr;
                this.user_capacity = data.info.capacity;
                this.set_capacity_bar();
                this.other_team_member_tasks = data.other_user_tasks;// other users tasks
                if(data.info.show_other_user_task == 1){
                    this.other_user_task_status = true; // other users task status for hide/show
                }else{
                    this.other_user_task_status = false; // other users task status for hide/show
                }
                
            },
            error=>{ 
                
            
            });
         
    }

    /**
     * Complete Task steps from task widget on calendaview
     */

    completed_step(task_detail,step_title,value){
        if(value){
            status = '1';
        }else{
            status = '0';
        }
        let task_info1 = {
            "info":task_detail,
            "is_completed":status,
            "step_title":step_title
        }
        this.taskservice.complete_step(task_info1).subscribe(data=>{
            this.other_team_member_tasks.forEach((element, index) => {
                element.task_list.forEach((element1, index1) => {
                    if(element1.task_id == task_detail.task_id){ 
                        this.other_team_member_tasks[index].task_list[index1] = data.info;
                    }
                });
            });
            this.tasks.forEach((element,index) => {
                element.task_list.forEach((element1,index1) => {
                    if(element1.task_id == task_detail.task_id){ 
                        this.tasks[index].task_list[index1] = data.info;
                    }
                 });
            });
        },
        error=>{

        });
    }
    showbacklogtaskpopup() {
        let modal: any = document.querySelector('.taskpopup2').closest('.modal-dialog');
        modal.style.width = '800px';
        this.showbacklogtask.open();
   }
    closebacklogpopup() {
        this.showbacklogtask.close();
    }
    schedulledtaskdata(date, id) {
        var firstday = new Date(date).toDateString();
        let date1 = new Date(firstday).getFullYear() + "-" + ((new Date(firstday).getMonth() + 1).toString().
            length == 1 ? ("0" + (new Date(firstday).getMonth() + 1)) : (new Date(firstday).getMonth() + 1))
            + "-" + (new Date(firstday).getDate().toString().length == 1 ? ("0" + new Date(firstday).getDate())
                : new Date(firstday).getDate());
        let backlog = {
            task_id: id,
            scheduled_date: date1
        };
        if (this.backlog_array) {
            if (this.backlog_array.find(x => x.task_id === id)) {
                let itemIndex = this.backlog_array.findIndex(item => item.task_id == id);
                this.backlog_array[itemIndex] = backlog;
            }
            else {
                this.backlog_array.push(backlog);
            }
        }

    }
    submitnonscheduletask() {
        let data1: any = {
            "company_id": this.company_id,
            "user_id": this.login_user_id,
            "data": this.backlog_array
        };
        if (this.backlog_array.length > 0) {
            this.taskservice.update_backlog_task(data1).subscribe(
                data => {
                    this.tasks.forEach((element1, index1) => {
                        data.info.forEach((element2, index2) => {
                            if (element1.date == element2.task_scheduled_date) {
                                this.tasks[index1].task_list.push(element2);
                            }
                        });

                    });
                    this.nonSchedulleTask.forEach((element3, index) => {
                        this.backlog_array.forEach(element4 => {
                            if (element3.task_id == element4.task_id) {
                                this.nonSchedulleTask.splice(index, 1);
                            }
                        });
                    });
                    this.backlog_array.length = 0;
                    this.closebacklogpopup();
                },
                error => {
                }
            );
        }

    }
    
    set_capacity_bar() {
        this.capacity.length = 0;
        let date_arr = this.date_array;
        let capacity = this.user_capacity;
        date_arr.forEach(element => {
            var estimate_time = 0;
            var spent_time = 0;
            this.tasks.forEach(element1 => {
                if(element == element1.date){
                    element1.task_list.forEach(element2 => {
                        estimate_time += parseInt(element2.task_time_estimate);
                        spent_time += parseInt(element2.task_time_spent);
                    });
                }
            });
            var d = new Date(element);
            var dayName = d.toString().split(' ')[0];
            let cap = 0;
            if(dayName == 'Mon'){
                cap = capacity.MON_hours;
            }else if(dayName = 'Tue'){
                cap = capacity.TUE_hours;
            }else if(dayName == 'Wed'){
                cap = capacity.WED_hours;
            }else if(dayName == 'Thu'){
                cap = capacity.THU_hours;
            }else if(dayName == 'Fri'){
                cap = capacity.FRI_hours;
            }else if(dayName == 'Sat'){
                cap = capacity.SAT_hours;
            }else if(dayName == 'Sun'){
                cap = capacity.SUN_hours;
            }
            if(cap>estimate_time){
                var estcolor= (estimate_time*100)/cap;
                if(estimate_time!=0){
                var spentcolor=(spent_time*100)/estimate_time;
                }else{
                var spentcolor=(spent_time*100)/cap;
                }
            }else{
                var spentcolor=(spent_time*100)/estimate_time;
                var capColor = (cap*100)/estimate_time;
            }
            var array = {"estimate_time":estimate_time,"spent_time":spent_time,"capacity":cap,"spentcolor":spentcolor,"capColor":capColor,"estcolor":estcolor};
            this.capacity.push(array);
            
        });
       
    }
    /**
     * Open modal popup for getting task actual time
     */
    open_actual_time_popup(data){
        this.comment_data = data;
        this.on_complete_actual_time = 0;
        this.taskactualtime.open();
    }
    /**
     * Close actual time popup
     */
    close_actual_time_popup(save = ''){
        if(save == ''){
            let checkbox:any = document.querySelectorAll("#is_completed_"+this.comment_data.task_id);
            checkbox[0].checked = false;
        }
        this.comment_data = '';
        this.on_complete_actual_time = 0;
        this.taskactualtime.close();
    }
    /**
     * Check time validation
     */
    change_actual_time(data):void{
        let value = data.task_actual_time.value;
        let hour: any = 0;
        let minute: any = 0;
        length = value.length;
        var numbers = /^[0-9]+$/;
        if (value.match(numbers)) {
            if (length > 4) {
                this.on_complete_actual_time = 0;
                data.task_actual_time.value = '';
                this.toastr.error('Only 4 digit number is allowed.', '', { positionClass: "toast-top-center" });
            } else if (length == 1 || length == 2) {
                hour = value;
                this.on_complete_actual_time = hour*60;
                data.task_actual_time.value = this.time.transform(hour*60);
            } else if (length == 3 || length == 4) {
                hour = (value / 100);
                hour = parseInt(hour)
                minute = (value - (parseInt(hour) * 100));
                if (minute > 59) {
                    hour++;
                    minute = minute - 60;
                }
                var total_time = hour*60 + minute;
                this.on_complete_actual_time = total_time;
                data.task_actual_time.value = this.time.transform(total_time);
            }
        } else {
            this.toastr.error('Please number is allowed. ', '', { positionClass: "toast-top-center" });
            data.task_actual_time.value = '';
            this.on_complete_actual_time = 0;
        }
        

    }
   
    /**
     * Save actual in db
     */
    save_actual_time(from){
        let task_info1 = this.comment_data;
        let data1:any = {
            "task_info":task_info1,
            "user_id":this.login_user_id,
            "task_id":task_info1.task_id,
            "is_completed":1,
            "company_id":this.company_id,
            'time':this.on_complete_actual_time
        };
        let dependency={
            "task_id":task_info1.prerequisite_task_id,
            "user_id":task_info1.task_allocated_user_id,
            "company_id":this.company_id
        }
        this.taskservice.complete_task(data1).subscribe(
            data => {
                this.other_team_member_tasks.forEach((element, index) => {
                    element.task_list.forEach((element1, index1) => {
                        if(element1.task_id == task_info1.task_id){ 
                            this.other_team_member_tasks[index].task_list[index1] = data.info;
                        }
                    });
                });
                this.tasks.forEach((element,index) => {
                    element.task_list.forEach((element1,index1) => {
                        if(element1.task_id == task_info1.task_id){ 
                            this.tasks[index].task_list[index1] = data.info;
                        }
                    });
                });
                if(task_info1.is_prerequisite_task == 1){
                    this.taskservice.check_completed_task_dependency(dependency).subscribe(
                        data=>{
                            this.tasks.forEach((element,index) => {
                                element.task_list.forEach((element1,index1) => {
                                    if(element1.task_id == task_info1.prerequisite_task_id){ 
                                        this.tasks[index].task_list[index1].task_status_id = data.info.task_status_id;
                                        this.tasks[index].task_list[index1].task_status_name = this.get_status_name_by_id(data.info.task_status_id);
                                        this.tasks[index].task_list[index1].completed_depencencies = data.info.completed_depencencies;
                                    }
                                });
                            });
                            this.other_team_member_tasks.forEach((element,index) => {
                                element.task_list.forEach((element1,index1) => {
                                    if(element1.task_id == task_info1.prerequisite_task_id){ 
                                        this.other_team_member_tasks[index].task_list[index1].task_status_id = data.info.task_status_id;
                                        this.other_team_member_tasks[index].task_list[index1].task_status_name = this.get_status_name_by_id(data.info.task_status_id);
                                        this.other_team_member_tasks[index].task_list[index1].completed_depencencies = data.info.completed_depencencies;
                                    }
                                });
                            });
                        },error=>{
                            console.log(error);
                    });
                }
               this.close_actual_time_popup('close');
               this.set_capacity_bar();
               from.task_actual_time.value = '';
            },
            error=>{ 
               
            }
        );
    }
    /**
     * Update status for showing other users task on calendar.
     * @param param status
     */
    hidden_other_user_task(param){
        this.other_user_task_status = param;
        let status:number;
        if(param == true){
            status =1;
        }else{
            status = 0;
        }
        let detail = {
            "user_id":this.login_user_id,
            "value":status
        };
        this.taskservice.status_show_other_users_task(detail).subscribe(data=>{

        },error=>{
            console.log(error);
        })
    }
}

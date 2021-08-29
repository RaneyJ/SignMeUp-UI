import { ViewComponent } from '../view.component.js';
import state from '../../util/state.js';
import router from '../../app.js';
import env from '../../util/env.js';

DashboardComponent.prototype = new ViewComponent('dashboard');
function DashboardComponent() {

    let welcomeUserElement;
    let tableBodyElement;
    let errorMessageElement;
    let createClassBtn;


    //Modal elements
    let className;
    let updateDescription;
    let updateCapacity = 0;
    let updateProfessor;
    let updateDeadline;
    let updateOpen;

    let modalErrorMessageElement;
    let cancelModalElement;

    //Maps

    var dateMap = new Map();
    var capacityMap = new Map();
    var numOfProfMap = new Map();
    var profMap = new Map();

    this.render = function() {

        console.log(state);

        if (!state.authUser) {
            router.navigate('/login');
            return;
        }

        let authUser = state.authUser;

        DashboardComponent.prototype.injectStylesheet();
        DashboardComponent.prototype.injectTemplate(() => {

            welcomeUserElement = document.getElementById('Dashboard-title');
            tableBodyElement = document.getElementById('class-table-body');
            errorMessageElement = document.getElementById('error-msg');  
            modalErrorMessageElement = document.getElementById('modal-error-msg');    
            cancelModalElement = document.getElementById('cancelModalButton'); 
            createClassBtn = document.getElementById('createModalConfirm');


            AppendUsersClasses(authUser.id);



            if(authUser.faculty){

                welcomeUserElement.innerText = "Faculty Dashboard";
                createClassBtn.addEventListener('click',createClass);


            } else {

                welcomeUserElement.innerText = "Student Dashboard";

            }
            
            window.history.pushState('dashboard', 'Dashboard', '/dashboard');

        });

    }

    async function createClass(){

        let response = await fetch(`${env.apiUrl}/classes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': state.JWT
            },
            body: createBody()
        })

    }

    function createBody() {

    }



    async function AppendUsersClasses(id){
        
        let response = await fetch(`${env.apiUrl}/classes/?id=${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': state.JWT
            },
        })


        let data = await response.json();

        if(response.status!=200)
            updateErrorMessage(data.message, false);
        else{
                //Render faculty classes
                //currently teaching
            if(state.authUser.faculty){

                for(let c of data){
                    let id = c.id;

                    let row = document.createElement('tr');
                    let titleCell = document.createElement('td');
                    let professorCell = document.createElement('td');
                    let descriptionCell = document.createElement('td');
                    let capacityCell = document.createElement('td');
                    let interactCell = document.createElement('td');
                    let deleteCell = document.createElement('td');

                    //----Assignment----
                    row.key = id;

                    interactCell.innerHTML = 
                    `
                    <button id="updatebtn" type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#updateModal">
                    Edit
                    </button>
                    `
                    deleteCell.innerHTML = 
                    `
                    <button id="deletebtn" type="button" class="btn btn-danger" data-bs-toggle="modal" data-bs-target="#deleteModal">
                    Delete
                    </button>
                    `


                    //----Work with capacities----
                    let bsSpan = document.createElement('span')

                    bsSpan.innerText = Object.keys(c.students).length+"/"+c.capacity;
                    let badgeIndex = (c.students).length/c.capacity==1;
                    if(badgeIndex==1)
                        bsSpan.className = 'badge bg-danger';
                    else if(badgeIndex>=.85)
                        bsSpan.className = 'bg-warning text-dark';
                    else
                        bsSpan.className = 'badge bg-info text-dark';

                    
                    capacityCell.appendChild(bsSpan);
                    capacityCell.style.width = '5%';   

                    capacityMap.set( id, c.capacity);

                    
                    //----Work with windows----
                    dateMap.set( id, [c.openWindow, c.closeWindow]);

        
                    // Append cells to the row
                    row.appendChild(titleCell);
                    row.appendChild(descriptionCell);
                    row.appendChild(professorCell);
                    row.appendChild(capacityCell);
                    row.appendChild(interactCell);
                    row.appendChild(deleteCell);
                    

                    document.getElementById('class-table-body').appendChild(row);

                    let buttons = row.getElementsByTagName('button');
                    buttons[0].addEventListener('click', setModal);
                    buttons[1].addEventListener('click', setDelModal);
                

                    titleCell.innerText = c.name;
                    descriptionCell.innerText = c.description;
                    //capacityCell.innerText = Object.keys(c.students).length+"/"+c.capacity;

                    let professors = c.faculty;
                    let numOfProf = 0;
                    let profArr = new Array();

                    for(let p of professors){
                        professorCell.innerText += ("Dr. "+p.lastName + "\n");
                        numOfProf++;
                        profArr.push(p.username);
                    }

                    profMap.set(id,profArr);
                    console.log('profmap:'+profMap.get(id));
                    
                    numOfProfMap.set(id,numOfProf);

                } 
            }else {
                    //Render student dash
                    //Classes currently enrolled in.
                    //Should have: title of class, description, and headcount / capacity
                
                for(let c of data){
                    let id = c.id;

                    let row = document.createElement('tr');
                    let titleCell = document.createElement('td');
                    let descriptionCell = document.createElement('td');
                    let professorCell = document.createElement('td');
                    let capacityCell = document.createElement('td');
                    let interactCell = document.createElement('td');


                    let bsSpan = document.createElement('span')

                    bsSpan.innerText = Object.keys(c.students).length+"/"+c.capacity;
                    let badgeIndex = (c.students).length/c.capacity==1;
                    if(badgeIndex==1)
                        bsSpan.className = 'badge bg-danger';
                    else if(badgeIndex>=.85)
                        bsSpan.className = 'bg-warning text-dark';
                    else
                        bsSpan.className = 'badge bg-info text-dark';

                    capacityCell.appendChild(bsSpan);

                    capacityCell.style.width = '5%';

                    row.key = id;
                    dateMap.set( id , [c.openWindow, c.closeWindow]);

        
                    // Append cells to the row
                    row.appendChild(titleCell);
                    row.appendChild(professorCell);
                    row.appendChild(descriptionCell);
                    row.appendChild(capacityCell);
                    row.appendChild(interactCell);


                    document.getElementById('class-table-body').appendChild(row);



                    titleCell.innerText = c.name;
                    descriptionCell.innerText = c.description;
                    capacityCell.innerText = Object.keys(c.students).length+"/"+c.capacity;

                    let professors = c.faculty;
                    for(let p of professors)
                        professorCell.innerText += ("Dr. "+p.lastName + "\n");
                }
            }        
            
        }

    }

    function setModal(e){
        updateErrorMessage('',false);

        let row = e.target.parentNode.parentNode
        let elements = row.getElementsByTagName('td');
        
        modal_id = row.key;

        className = elements[0].innerText;
        updateCapacity = capacityMap.get(modal_id);
        updateDeadline = dateMap.get(modal_id)[1];
        updateOpen = dateMap.get(modal_id)[0];
        updateDescription = elements[1].innerText;

        console.log("cap:"+updateCapacity+"  deadline:"+updateDeadline+"   desc:"+updateDescription);

        document.getElementById('updateModalLabel').innerText = `${className} | ${elements[2].innerText}`;
        document.getElementById('descriptionInput').innerText = updateDescription;           //If broken use `${elements[1].innerText}`
        document.getElementById('capacityInput').value = updateCapacity;
        document.getElementById('previousDate').innerText = 'Previous deadline:  ' + new Date(updateDeadline).toDateString();

        let confirm = document.getElementById('updateModalConfirm');

        //Event listeners
        document.getElementById('professorInput').addEventListener('change',profChangeHandler);
        document.getElementById('deadlineInput').addEventListener('change',dateChangeHandler);
        document.getElementById('capacityInput').addEventListener('change',capactiyChangeHandler);
        document.getElementById('descriptionInput').addEventListener('change', descriptionChangeHandler);

        confirm.addEventListener('click', updateModal);
    }

    function setDelModal(e){
        updateErrorMessage('',false);

        let row = e.target.parentNode.parentNode
        let elements = row.getElementsByTagName('td');
        
        modal_id = row.key;

        document.getElementById('deleteModalLabel').innerText = `${elements[0].innerText} | ${elements[2].innerText}`;
        document.getElementById('deleteModalBody').innerText = `Are you sure you wish to delete this class?`;

        let confirm = document.getElementById('deleteModalConfirm');

        confirm.addEventListener('click', deleteModal);
    }

    var modal_id = undefined;

    async function updateModal() {

        let response = await fetch(`${env.apiUrl}/classes/?id=${modal_id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': state.JWT
            },
            body: buildUpdateBody()
        })

        let data = await response.json();

        console.log(data);

        if(response.status!=201)
            updateErrorMessage(data.message, false);


        cancelModalElement.click();
        
    }
    function deleteModal(){
        console.log(modal_id);
    }

    function buildUpdateBody(){
        console.log('updateCapacity'+updateCapacity);
        let body = {
            capacity: updateCapacity,
            description: updateDescription,
            openWindow: updateOpen,
            closeWindow: updateDeadline,
            faculty: undefined,
        }

        if(updateProfessor)
            body.faculty = updateProfessor;

        console.log(JSON.stringify(body));

        return JSON.stringify(body);
    }

    function descriptionChangeHandler(e){
        
        console.log(e.target.value);
    }

    function dateChangeHandler(e){
        let input = e.target.value;

        if(new Date(input).getTime() < Date.now()){
            updateErrorMessage('Deadline must be a future date',true);
            e.target.value = undefined;
        }
        else{
            updateErrorMessage('',true);
            updateDeadline = new Date(input).getTime().toString();
        }
    }

    function capactiyChangeHandler(e){
        let input = e.target.value;
        console.log("in cap change handler");

        if(input<=0 || input > 100){
            updateErrorMessage('Capacity must be greater than 0 and less than 100', true);
            e.target.value = updateCapacity;
        } else {
            updateErrorMessage('',true);
            console.log('change capacityInput '+input);
            updateCapacity = input;
        }
    }

    function profChangeHandler(e){

        console.log(numOfProfMap.get(modal_id));

        if(profMap.get(modal_id).includes(e.target.value)){
            if(numOfProfMap.get(modal_id)<2){                                   //Dont allow user to remove the only professor
                updateErrorMessage('Unable to remove the only teaching professor!', true);
                updateProfessor = undefined;
                e.target.value = '';
            }else {
            updateErrorMessage(`This will remove ${e.target.value} from the class!`,true )
            updateProfessor = e.target.value;
            }

        }else {
            updateErrorMessage('',true);
            updateProfessor = e.target.value;
        }

    }
    
    function updateErrorMessage(errorMessage,modal) {
        if(modal){
            if (errorMessage) {
                modalErrorMessageElement.removeAttribute('hidden');
                modalErrorMessageElement.innerText = errorMessage;
            } else {
                modalErrorMessageElement.setAttribute('hidden', 'true');
                modalErrorMessageElement.innerText = '';
            }
        }
        else {
            if (errorMessage) {
                errorMessageElement.removeAttribute('hidden');
                errorMessageElement.innerText = errorMessage;
            } else {
                errorMessageElement.setAttribute('hidden', 'true');
                errorMessageElement.innerText = '';
            }
        }
        
    }

}

export default new DashboardComponent();

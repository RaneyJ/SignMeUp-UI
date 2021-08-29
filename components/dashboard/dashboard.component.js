import { ViewComponent } from '../view.component.js';
import state from '../../util/state.js';
import router from '../../app.js';
import env from '../../util/env.js';

DashboardComponent.prototype = new ViewComponent('dashboard');
function DashboardComponent() {

    let welcomeUserElement;
    let tableBodyElement;
    let errorMessageElement;
    let modalErrorMessageElement;

    //Modal elements
    let className;
    let updateDescription;
    let updateCapacity = 0;
    let updateProfessor;
    let updateDeadline;
    let updateOpen;

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


            AppendUsersClasses(authUser.id);



            if(authUser.faculty){

                welcomeUserElement.innerText = "Faculty Dashboard";



            } else {

                welcomeUserElement.innerText = "Student Dashboard";


            }
            
            window.history.pushState('dashboard', 'Dashboard', '/dashboard');

        });

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

                    bsSpan.className = 'badge bg-info text-dark';
                    bsSpan.innerText = Object.keys(c.students).length+"/"+c.capacity;
                    
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
        document.getElementById('professorInput').addEventListener('keyup',profRadioHandler);
        document.getElementById('professorInput').addEventListener('change',profChangeHandler);
        document.getElementById('deadlineInput').addEventListener('change',dateChangeHandler);
        document.getElementById('capacityInput').addEventListener('change',capactiyChangeHandler);
        document.getElementById('descriptionInput').addEventListener('change', descriptionChangeHandler);
        confirm.addEventListener('click', updateModal);
    }

    function setDelModal(e){
        let row = e.target.parentNode.parentNode;

        let elements = row.getElementsByTagName('td');
        document.getElementById('deleteModalLabel').innerText = `${elements[0].innerText} | ${elements[2].innerText}`;
        document.getElementById('deleteModalBody').innerText = `${elements[1].innerText}`;

        let confirm = document.getElementById('deleteModalConfirm');

        modal_id = row.key;

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
            body: buildBody()
        })

        let data = await response.json();

        console.log(data);

        if(response.status!=200)
            updateErrorMessage(data.message, false);
        
    }
    function deleteModal(){
        console.log(modal_id);
    }

    function buildBody(){
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
        let input = e.target.value;

        if(document.getElementById('addProfRadio').attributes.getNamedItem('checked') && profMap.get(modal_id).includes(input) ){
            updateErrorMessage('Cannot add a professor that is already teaching this class',true);
        } else if(document.getElementById('removeProfRadio').attributes.getNamedItem('checked') && !profMap.get(modal_id).includes(input)){
            updateErrorMessage('Cannot remove a professor that is not teaching this class',true);
        } else if(input){
            //Check for valid professor
            updateProfessor = input;
            updateErrorMessage('',true);
        }

    }

    function profRadioHandler(e){
        let input = e.target.value;
    
        //Either add or Remove a single professor from the class
        if(input.length > 0 ){
            document.getElementById('addProfRadio').removeAttribute('disabled');
            if(numOfProfMap.get(modal_id)>=2)                                   //Dont allow user to remove the only professor
                document.getElementById('removeProfRadio').removeAttribute('disabled');
        } else {
            document.getElementById('addProfRadio').setAttribute('disabled','true');
            document.getElementById('removeProfRadio').setAttribute('disabled','true');
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

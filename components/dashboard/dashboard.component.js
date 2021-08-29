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
    //Update Modal
    let className;
    let updateDescription;
    let updateCapacity = 0;
    let updateProfessor;
    let updateDeadline;
    let updateOpen;
    let cancelModalElement;

    //Create Modal

    let createModalErrorMessageElement;
    let modalErrorMessageElement;

    //Maps

    let profMap = new Map();
    let numOfProfMap = new Map();
    let capacityMap = new Map();
    let dateMap = new Map();


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
            modalErrorMessageElement = document.getElementById('update-modal-error-msg');   
            createModalErrorMessageElement = document.getElementById('create-modal-error-msg');
            cancelModalElement = document.getElementById('cancelModalButton'); 


            AppendUsersClasses(authUser.id);


            if(authUser.faculty){
                
                welcomeUserElement.innerText = "Faculty Dashboard";




                document.getElementById('createModalConfirm').addEventListener('click',createClass);
                document.getElementById('createNameInput').addEventListener('change',nameCreateHandler);
                document.getElementById('createCapacityInput').addEventListener('change',capacityCreateHandler);
                document.getElementById('createOpenInput').addEventListener('change',openCreateHandler);
                document.getElementById('createDeadlineInput').addEventListener('change',deadlineCreateHandler);
                document.getElementById('createDescriptionInput').addEventListener('change',descriptionCreateHandler);
                


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
        // let body = {
        //     name:
        //     capacity:
        //     description:
        //     openWindow:
        //     closeWindow:

        // }
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
            updateErrorMessage(data.message, '');
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
                    numOfProfMap.set(id,numOfProf);

                } 
            }else {
                    //Render student dash
                    //Classes currently enrolled in.
                    //Should have: title of class, description, and headcount / capacity

                    document.getElementById('createClassCard').hidden=true;
                
                for(let c of data){
                    let id = c.id;

                    let row = document.createElement('tr');
                    let titleCell = document.createElement('td');
                    let descriptionCell = document.createElement('td');
                    let professorCell = document.createElement('td');
                    let capacityCell = document.createElement('td');
                    let interactCell = document.createElement('td');
                    row.key = id;


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
                    let button = ''
                    button = 
                    `
                    <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
                    Unenroll
                    </button>
                    `
                    interactCell.innerHTML = button;

                    row.key = id;
                    dateMap.set( id , [c.openWindow, c.closeWindow]);

        
                    // Append cells to the row
                    row.appendChild(titleCell);
                    row.appendChild(professorCell);
                    row.appendChild(descriptionCell);
                    row.appendChild(capacityCell);
                    row.appendChild(interactCell);

                    row.getElementsByTagName('button')[0].addEventListener('click', setStudentModal);
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

    function setStudentModal(e) {
        let row = e.target.parentNode.parentNode
        let elements = row.getElementsByTagName('td');
        document.getElementById('exampleModalLabel').innerText = `Unenroll from: ${elements[0].innerText} | ${elements[1].innerText}?`;
        document.getElementById('exampleModalBody').innerText = `${elements[2].innerText}`;
        let confirm = document.getElementById('exampleModalConfirm');
        
        
        modal_id = row.key;
        confirm.addEventListener('click', unenroll);
    }

    function setModal(e){
        updateErrorMessage('','');

        let row = e.target.parentNode.parentNode
        let elements = row.getElementsByTagName('td');
        
        modal_id = row.key;

        className = elements[0].innerText;
        updateCapacity = capacityMap.get(modal_id);
        updateDeadline = dateMap.get(modal_id)[1];
        updateOpen = dateMap.get(modal_id)[0];
        updateDescription = elements[1].innerText;

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
        updateErrorMessage('','');

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

        try{
            let response = await fetch(`${env.apiUrl}/classes/?id=${modal_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': state.JWT
                },
                body: buildUpdateBody()
            });

            let data = await response.json();

            if(response.status!=201)
                updateErrorMessage(data.message,'');
            else{
                updateErrorMessage('','update');
                router.navigate('/dashboard');
            }
        }catch(e){
            console.log(e);
        }
        
    }
    async function deleteModal(){
        let response = await fetch(`${env.apiUrl}/classes/?id=${modal_id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': state.JWT
            }
        })

        let data = await response.json();

        console.log(data);

        if(response.status!=200)
            updateErrorMessage(data.message,'');
        else{
            updateErrorMessage('','update');
        }
    }

    var modal_id = undefined;
    
    async function unenroll() {
        console.log(modal_id);

        try{

            let response = await fetch(`${env.apiUrl}/enrollment/?user_id=${state.authUser.id}&class_id=${modal_id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': state.JWT
                }
            })

            if(response.status != 201) {
                let data = await response.json();
                updateErrorMessage(data.message);
            }else{
                cancelModalElement.click();
                router.navigate('/dashboard');
            }

        } catch(err){
            console.error(err);
        }
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

        console.log(updateProfessor);

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
            updateErrorMessage('Deadline must be a future date','update');
            e.target.value = undefined;
        }
        else{
            updateErrorMessage('','update');
            updateDeadline = new Date(input).getTime().toString();
        }
    }

    function capactiyChangeHandler(e){
        let input = e.target.value;

        if(input<=0 || input > 200){
            updateErrorMessage('Capacity must be greater than 0 and less than 200', 'update');
            e.target.value = updateCapacity;
        } else {
            updateErrorMessage('','update');
            console.log('change capacityInput '+input);
            updateCapacity = input;
        }
    }

    function profChangeHandler(e){

        if(profMap.get(modal_id).includes(e.target.value)){
            if(numOfProfMap.get(modal_id)<2){                                   //Dont allow user to remove the only professor
                updateErrorMessage('Unable to remove the only teaching professor!', 'update');
                updateProfessor = undefined;
                e.target.value = '';
            }else {
            updateErrorMessage(`This will remove ${e.target.value} from the class! click again to confirm`,'update')
            updateProfessor = e.target.value;
            }

        }else {
            updateErrorMessage('','update');
            updateProfessor = e.target.value;
        }

    }

    function capacityCreateHandler(e){

        console.log("--Cap change Handler--");
        console.log(e.target.parentNode);
        console.log(e.target.parentNode.parentNode);

    }

    function openCreateHandler(e){}
    function deadlineCreateHandler(e){}
    function descriptionCreateHandler(e){}

    function nameCreateHandler(e){

        if(e.target.value.length>50){
            className = undefined;
            updateErrorMessage('Provide a name shorter than 50 characters','create');
            e.target.value = '';
        }
        else{
            updateErrorMessage('','create');
            className = e.target.value;
        }
    }
    
    function updateErrorMessage(errorMessage,modal) {
        if(modal==='update'){
            if (errorMessage) {
                modalErrorMessageElement.removeAttribute('hidden');
                modalErrorMessageElement.innerText = errorMessage;
            } else {
                modalErrorMessageElement.setAttribute('hidden', 'true');
                modalErrorMessageElement.innerText = '';
            }
        } else if(modal ==='create'){

            if (errorMessage) {
                createModalErrorMessageElement.removeAttribute('hidden');
                createModalErrorMessageElement.innerText = errorMessage;
            } else {
                createModalErrorMessageElement.setAttribute('hidden', 'true');
                createModalErrorMessageElement.innerText = '';
            }
        } else {

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

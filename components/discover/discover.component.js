import { ViewComponent } from '../view.component.js';
import state from '../../util/state.js';
import router from '../../app.js';
import env from '../../util/env.js';

DiscoverComponent.prototype = new ViewComponent('discover');
function DiscoverComponent() {

    let welcomeUserElement;
    let tableBodyElement;
    let errorMessageElement;
    let modalElement;
    let cancelModalElement;
    let showCheckboxElement;

    let showAll = false;

    function updateShowAll(e) {
        showAll = e.target.checked;

        if(showAll == true) {
            renderTable();
        } else {
            renderTable();
        }
    }

    function renderTable() {
        AppendUsersClasses();
    }


    this.render = function() {

        if (!state.authUser) {
            router.navigate('/login');
            return;
        } else if(state.authUser.faculty === true) {
            //Faculty shouldnt be here
            console.log("IN HERE")
            router.navigate('/dashboard');
            return;
        }

        let authUser = state.authUser;

        DiscoverComponent.prototype.injectStylesheet();
        DiscoverComponent.prototype.injectTemplate(() => {

            welcomeUserElement = document.getElementById('Discover-title');
            tableBodyElement = document.getElementById('class-table-body');
            errorMessageElement = document.getElementById('error-msg');
            modalElement = document.getElementById('exampleModal');
            cancelModalElement = document.getElementById('cancelModalButton');
            showCheckboxElement = document.getElementById('show-all-container');

            showCheckboxElement.addEventListener('change', updateShowAll);

            showAll = false;
            AppendUsersClasses();

            welcomeUserElement.innerText = "Discover Classes";
            
            window.history.pushState('discover', 'Discover', '/discover');

        });

    }

    async function AppendUsersClasses(){

        //Clearing table
        let table = document.getElementById('class-table-body');
        table.innerHTML = '';
        
        let response = await fetch(`${env.apiUrl}/classes`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': state.JWT
            },
        })


        let data = await response.json();

        if(response.status!=200)
            updateErrorMessage(data.message);
        else{
                //Render student dash
                //Classes currently enrolled in.
                //Should have: title of class, description, and headcount / capacity
            console.log("HERE")
            for(let c of data){
                let enrolled = false;
                for(let stu of c.students) {
                    if(stu.id === state.authUser.id) {
                        enrolled = true;
                    }
                }

                if(enrolled && !showAll) {
                    console.log("HIDING")
                    console.log(c)
                    continue;
                } else {
                    console.log("SHOWING")
                    console.log(c);
                }

                let row = document.createElement('tr');
                row.setAttribute('data-toggle', "modal");
                row.setAttribute('data-target', '#exampleModal');


                let titleCell = document.createElement('td');
                let descriptionCell = document.createElement('td');
                let professorCell = document.createElement('td');
                let capacityCell = document.createElement('td');
                let enrollCell = document.createElement('td');

                let button = ''
                if(!enrolled) {
                    button = 
                    `
                    <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
                    Enroll
                    </button>
                    `
                } else {
                    button =
                    `
                    <button type="button" class="btn btn-secondary" disabled>
                    Enroll
                    </button>
                    `
                }
                enrollCell.innerHTML = button;


                row.key = c.id
                capacityCell.style.width = '5%';

                row.appendChild(titleCell);
                row.appendChild(descriptionCell);
                row.appendChild(professorCell);
                row.appendChild(capacityCell);
                row.appendChild(enrollCell);

                table.appendChild(row);

                if(!enrolled) {
                    row.getElementsByTagName('button')[0].addEventListener('click', setModal);
                }
                

                titleCell.innerText = c.name;
                descriptionCell.innerText = c.description;
                capacityCell.innerText = Object.keys(c.students).length+"/"+c.capacity;

                let professors = c.faculty;
                for(let p of professors)
                    professorCell.innerText += ("Dr. "+p.lastName + "\n");
            }
        }
        

    }
    

    function setModal(e) {
        console.log("SETTING MODAL");
        let row = e.target.parentNode.parentNode
        console.log(row);
        let elements = row.getElementsByTagName('td');
        document.getElementById('exampleModalLabel').innerText = `${elements[1].innerText} | ${elements[3].innerText}`;
        document.getElementById('exampleModalBody').innerText = `${elements[2].innerText}`;
        let confirm = document.getElementById('exampleModalConfirm');
        
        
        modal_id = row.key;
        confirm.addEventListener('click', enroll);
    }

    var modal_id = undefined;
    
    async function enroll() {
        console.log(modal_id);

        try{

            let response = await fetch(`${env.apiUrl}/enrollment/?user_id=${state.authUser.id}&class_id=${modal_id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': state.JWT
                }
            })
            let data = response.json();
            if(response.status != 201)
                updateErrorMessage(data.message);
            else{
                cancelModalElement.click();
                router.navigate('/dashboard');
            }

        } catch(err){
            console.error(err);
        }
    }
    
    function updateErrorMessage(errorMessage) {
        if (errorMessage) {
            errorMessageElement.removeAttribute('hidden');
            errorMessageElement.innerText = errorMessage;
        } else {
            errorMessageElement.setAttribute('hidden', 'true');
            errorMessageElement.innerText = '';
        }
    }
}


export default new DiscoverComponent();
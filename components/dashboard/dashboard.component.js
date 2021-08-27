import { ViewComponent } from '../view.component.js';
import state from '../../util/state.js';
import router from '../../app.js';
import env from '../../util/env.js';

DashboardComponent.prototype = new ViewComponent('dashboard');
function DashboardComponent() {

    let welcomeUserElement;
    let tableBodyElement;
    let errorMessageElement;
    let modalElement;

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
            modalElement = document.getElementById('exampleModal');
            


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

        console.log('appending the classes')
        
        let response = await fetch(`${env.apiUrl}/classes/?id=${id}`, {
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
                //Render faculty classes
                //currently teaching
            if(state.authUser.faculty){

                for(let c of data){

                    let row = document.createElement('tr');
                    let idCell = document.createElement('td');
                    let titleCell = document.createElement('td');
                    let professorCell = document.createElement('td');
                    let descriptionCell = document.createElement('td');
                    let capacityCell = document.createElement('td');
                    let interactCell = document.createElement('td');

                    interactCell.innerHTML = 
                    `
                    <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
                    Edit
                    </button
                    `


                    let bsSpan = document.createElement('span')

                    bsSpan.className = 'badge bg-info text-dark';
                    bsSpan.innerText = Object.keys(c.students).length+"/"+c.capacity;

                    
                    capacityCell.appendChild(bsSpan)


                    row.key = c.id
                    capacityCell.style.width = '5%';

                    // console.log(c.name.length+ "      w:"+c.name.length*100/70);
                    // let w = c.name.length*100/70;


                    // titleCell.style.width = `${w}%`
        
                    // console.log(titleCell.style.width);
                    // console.log(row.key);
        
                    // Append cells to the row
                    row.appendChild(idCell);
                    row.appendChild(titleCell);
                    row.appendChild(descriptionCell);
                    row.appendChild(professorCell);
                    row.appendChild(capacityCell);
                    row.appendChild(interactCell);
                    

                    document.getElementById('class-table-body').appendChild(row);

                    row.getElementsByTagName('button')[0].addEventListener('click', setModal);


                    idCell.innerText = c.id;
                    titleCell.innerText = c.name;
                    descriptionCell.innerText = c.description;
                    //capacityCell.innerText = Object.keys(c.students).length+"/"+c.capacity;

                    let professors = c.faculty;
                    for(let p of professors)
                        professorCell.innerText += ("Dr. "+p.lastName + "\n");
                } 
            }else {
                    //Render student dash
                    //Classes currently enrolled in.
                    //Should have: title of class, description, and headcount / capacity
                
                for(let c of data){

                    let row = document.createElement('tr');
                    let idCell = document.createElement('td');
                    let titleCell = document.createElement('td');
                    let descriptionCell = document.createElement('td');
                    let professorCell = document.createElement('td');
                    let capacityCell = document.createElement('td');
                    let interactCell = document.createElement('td');

                    row.key = c.id
                    capacityCell.style.width = '5%';

                    // console.log(c.name.length+ "      w:"+c.name.length*100/70);
                    // let w = c.name.length*100/70;


                    // titleCell.style.width = `${w}%`
        
                    // console.log(titleCell.style.width);
                    // console.log(row.key);
        
                    // Append cells to the row
                    row.appendChild(idCell);
                    row.appendChild(titleCell);
                    row.appendChild(professorCell);
                    row.appendChild(descriptionCell);
                    row.appendChild(capacityCell);
                    row.appendChild(interactCell);


                    document.getElementById('class-table-body').appendChild(row);


                    
                    idCell.innerText = c.id;
                    titleCell.innerText = c.name;
                    descriptionCell.innerText = c.description;
                    capacityCell.innerText = Object.keys(c.students).length+"/"+c.capacity;

                    let professors = c.faculty;
                    for(let p of professors)
                        professorCell.innerText += ("Dr. "+p.lastName + "\n");
                }
            }        

        }

        function setModal(){
            console.log("MODAL CLICKED!");
            let row = e.target.parentNode.parentNode;
            console.log(row);
            let elements = row.getElementsByTagName('td');
            document.getElementById('exampleModalLabel').innerText = `${elements[1].innerText} | ${elements[3].innerText}`;
            document.getElementById('exampleModalBody').innerText = `${elements[2].innerText}`;
            let confirm = document.getElementById('exampleModalConfirm');

            modal_id = row.key;
            confirm.addEventListener('click', updateModal);
        }

        var modal_id = undefined;
        function updateModal() {
            console.log(modal_id);
        }
        function deleteModal(){
            
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

export default new DashboardComponent();

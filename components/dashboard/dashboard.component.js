import { ViewComponent } from '../view.component.js';
import state from '../../util/state.js';
import router from '../../app.js';
import env from '../../util/env.js';

DashboardComponent.prototype = new ViewComponent('dashboard');
function DashboardComponent() {

    let welcomeUserElement;
    let tableBodyElement;
    let errorMessageElement;

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

                    let bsSpan = document.createElement('span')
                    bsSpan.className = 'badge alert-warning';
                    bsSpan.innerText = Object.keys(c.students).length+"/"+c.capacity;
                    capacityCell.appendChild(bsSpan)
                    //capacityCell.innerText = w.toString();

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
                    row.addEventListener('click',(e) => {

                    })

                    document.getElementById('class-table-body').appendChild(row);


                    
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

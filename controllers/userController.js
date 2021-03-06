const { ipcRenderer, dialog } = require('electron');

const userForm = document.querySelector("#userForm");
const userId = document.querySelector("#id");
const userName = document.querySelector("#name");
const userEmail = document.querySelector("#email");
const userWhatsapp = document.querySelector("#whatsapp");
const usersList = document.querySelector("#users");
const submitButton = document.querySelector("#submit");
//const nomeFind = document.querySelector("#nomeFind");
//const btnFindUser = document.querySelector("#btnFind");

let users = [];
let editingStatus = false;

const deleteUser = async (id) => {
    //const response = confirm("Deseja apagar este user?");
    //const response = dialog.showMessageBox("Deseja apagar este user?");
    const response = true;
    if (response) {
        ipcRenderer.send('delete', id);
        ipcRenderer.on('delete', (event, response) => {
            //alert(response);
            getUsers();
            
        });
    }
};

const editUser = async (id) => {
    ipcRenderer.send('find', id);
    ipcRenderer.on('find', (event, response) => {
        response.forEach((r) => {
            const { id, name, email, whatsapp } = r;
            userId.value = id;
            userName.value = name;
            userEmail.value = email;
            userWhatsapp.value = whatsapp;
        });
    });
    editingStatus = true;
};


//btnFindUser.onclick = findByUser;
async function findByUser() {
    ipcRenderer.send('findName', nomeFind.value);
    ipcRenderer.on('findName', (event, response) => {
        console.log(response);

        renderUsers(response);
    });
};

submitButton.onclick = addUser;
async function addUser() {
    try {
        const user = {
            id: userId.value,
            name: userName.value,
            email: userEmail.value,
            whatsapp: userWhatsapp.value
        };

        if (!editingStatus) {
            ipcRenderer.send('create', user);
            ipcRenderer.on('create', (event, response) => {
                //alert(response);
                getUsers();
            });
        }
        else {
            ipcRenderer.send('update', user);
            ipcRenderer.on('update', (event, response) => {
                //alert(response);
                getUsers();
            });
            editingStatus = false;
            //editingStatus = true;
        }

        userForm.reset();
        userName.focus();
        getUsers();
    } catch (error) {
        console.log(error);
    }
};

function renderUsers(tasks) {
    usersList.innerHTML = ``;
    tasks.forEach((t) => {
        usersList.innerHTML += `
        <tr>
            <td>${t.name}</td>
            <td>${t.email}</td>
            <td>${t.whatsapp}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="deleteUser('${t.id}')">
                    DELETAR
                </button>
            </td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="editUser('${t.id}')">
                    EDITAR 
                </button>
            </td>
      </tr>  `;
    });
};

const getUsers = async () => {
    ipcRenderer.send('selectAll');
    ipcRenderer.on('selectAll', (event, response) => {
        renderUsers(response);
    });
};

async function init() {
    getUsers();
}
init();
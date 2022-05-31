const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
//const appPath = app.getAppPath().replace("app.asar", "database.sqlite")

const knex = require('knex');

const { title } = require('./package.json');

const connection = knex({
    client: "sqlite3",
    connection: {
        //filename: './database/database.sqlite'
        filename: path.join(__dirname, '/database/', 'database.sqlite')
    },
    migrations: {
        directory: './database/migrations'
    },
    useNullAsDefault: true,
});

ipcMain.on('selectAll', async (event, args) => {
    const user = await getUsers();
    event.reply('selectAll', user);
});

const getUsers = async () => {
    const results = await connection('users')
        .limit(25)
        .select(['users.*']);
    return results;
};

ipcMain.on('delete', async (event, args) => {
    const user = await deleteUser(args);
    event.reply('delete', user);
});
const deleteUser = async (id) => {
    try {
        await connection('users')
            .where('id', id)
            .first()
            .delete();
        return 'Usuario deletado';
    } catch (error) {
        console.log(error);
    }
};

ipcMain.on('create', async (event, args) => {
    const user = await createUser(args);
    event.reply('create', user);
});
const createUser = async (user) => {
    const { id, name, email, whatsapp } = user;
    await connection('users').insert({
        name,
        email,
        whatsapp,
    });
    return `${name} registrado com sucesso.`;
};

ipcMain.on('find', async (event, args) => {
    const user = await find(args);
    event.reply('find', user);

});
const find = async (id) => {
    const results = await connection('users')
        .where('id', id)
        .limit(1)//limite de registro a vir pro ver
        .select(['users.*']);
    return results;
};

ipcMain.on('findName', async (event, name) => {
    const user = await findByName(name);
    event.reply('findName', user);
});
const findByName = async (name) => {
    try {
        const results = await connection('users')
            .where('name', name)
            .limit(25)//limite de registro a vir pro ver
            .select(['users.*']);
        return results;
    } catch (error) {
        console.log(error);
    }
};

ipcMain.on('update', async (event, args) => {
    const user = await updateUser(args);
    event.reply('update', user);
});
const updateUser = async (user) => {
    const { id, name, email, whatsapp } = user;
    const result = await connection('users')
        .where({ id })
        .update({ name, email, whatsapp }, ['id', 'title'])
    return `${name} alterado com sucesso.`;
};

function createWindow() {
    // Cria uma janela de navegação.
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        //fullscreen: true,
        //titleBarStyle: 'hidden',
        webPreferences: {
            scrollBounce: true,
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    win.setMenuBarVisibility(false);
    // e carregar o main.html do aplicativo.
    win.loadFile('./main.html');
    win.webContents.on('did-finish-load', () => {
        win.maximize();
        //win.setTitle(`${title}`);
        win.setTitle(`SellUP`);
        //win.reload();
        //win.webContents.openDevTools();
    });
};

//app.whenReady().then(createWindow);//.then(getusers)
app.whenReady().then(() => {
    createWindow()
  
    app.on('activate', function () {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })
  
  // Quit when all windows are closed, except on macOS. There, it's common
  // for applications and their menu bar to stay active until the user quits
  // explicitly with Cmd + Q.
  app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
  })
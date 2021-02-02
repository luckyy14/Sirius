const electron = require('electron');
const url = require('url');
const path = require('path');
const {PythonShell} =  require('python-shell');
const { dialog } = require('electron')

const {app, BrowserWindow, Menu, ipcMain} = electron;

let mainWindow;

// This should be placed at top of main.js to handle setup events quickly
//Events handled Quickly
if (handleSquirrelEvent(app)) {
    // squirrel event handled and app will exit in 1000ms, so don't do anything else
    return;
}

app.on('ready',function(){
    createMainWindow();
});

process.on('uncaughtException', function (error) {
    console.log("error");
    // Handle the error
})


function createMainWindow()
{
    PythonShell.run('app.py'); 
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        }
    });
    /*mainWindow.maximize();*/
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true,
        backgroundColor: '#3C4858',
        icon: path.join(__dirname, 'icons/png/64x64.png')
    }));
    //Quit app when closed
    mainWindow.on('closed',function(){
        mainWindow = app.quit();
    });
    //Build Menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    //Insert Menu
    Menu.setApplicationMenu(mainMenu);
}


//create main menu template
const mainMenuTemplate = [
    {
        label:'Options',
        submenu:[
            {
                label: 'About',
                accelerator: process.platform == 'darwin' ? 'Command+H' : 'Ctrl+H',
                click(){
                    const options = {
                        type: 'question',
                        buttons: ['Cancel'],
                        defaultId: 2,
                        title: 'About',
                        message: 'Titanium VM Manager',
                        detail: 'Titanium VM manager is built by Apratim Shukla and Abhishek TK. It utilizes the pyvirtualbox library. It is an educational instance built for the course CSE2005-Operating Systems under Professor Abdul Qadir.',
                    };
                    dialog.showMessageBox(options)
                }
            },
            {
                role: 'reload'
            },
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click(){
                    app.quit();
                }
            } 
        ]
    }
];



//for mac add empty object
if(process.platform=="darwin"){
    mainMenuTemplate.unshift({});
}




function handleSquirrelEvent(application) {
    if (process.argv.length === 1) {
        return false;
    }

    const ChildProcess = require('child_process');
    const path = require('path');

    const appFolder = path.resolve(process.execPath, '..');
    const rootAtomFolder = path.resolve(appFolder, '..');
    const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
    const exeName = path.basename(process.execPath);

    const spawn = function(command, args) {
        let spawnedProcess, error;

        try {
            spawnedProcess = ChildProcess.spawn(command, args, {
                detached: true
            });
        } catch (error) {}

        return spawnedProcess;
    };

    const spawnUpdate = function(args) {
        return spawn(updateDotExe, args);
    };

    const squirrelEvent = process.argv[1];
    switch (squirrelEvent) {
        case '--squirrel-install':
        case '--squirrel-updated':
            // Optionally do things such as:
            // - Add your .exe to the PATH
            // - Write to the registry for things like file associations and
            //   explorer context menus

            // Install desktop and start menu shortcuts
            spawnUpdate(['--createShortcut', exeName]);

            setTimeout(application.quit, 1000);
            return true;

        case '--squirrel-uninstall':
            // Undo anything you did in the --squirrel-install and
            // --squirrel-updated handlers

            // Remove desktop and start menu shortcuts
            spawnUpdate(['--removeShortcut', exeName]);

            setTimeout(application.quit, 1000);
            return true;

        case '--squirrel-obsolete':
            // This is called on the outgoing version of your app before
            // we update to the new version - it's the opposite of
            // --squirrel-updated

            application.quit();
            return true;
    }
};




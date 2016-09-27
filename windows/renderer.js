// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const remote = require('electron').remote; 
const BrowserWindow = remote.BrowserWindow;

const ipcRenderer = require('electron').ipcRenderer
const Config = require('electron-config');
const config = new Config();
const ftp = require('jsftp');

var ftpClient

function contextMenuItems() {
    var items = [];
    var connections = config.get('connections');
    
    for(var i=0; i<connections.length; i++) {
        items.push({
            id: i,
            text: connections[i].connectionName,
            icons: {
                "file": "icon-file",
                "folder_opened": "fa-database fa-fw blue",
                "folder_closed": "fa-database fa-fw"
            },
            //items: [{id: i+"_1", text: "Text "+i+"_1", userdata: { type: "file" }}],
            kids: true,
            userData: {
                type: 'connection',
                id: i
            }
        });
    }
    return items;
}

function connectionItems() {
    var items = {id: 0, item:[]};
    var connections = config.get('connections');
    
    if(undefined != connections) {
        for(var i=0; i<connections.length; i++) {
            items.item.push({
                id: i+1,
                text: connections[i].connectionName,
                userdata: [
                    { name: 'order', content: i },
                    { name: 'type', content: 'connection' },                
                    { name: 'host', content: connections[i].host },
                    { name: 'port', content: connections[i].port },
                    { name: 'username', content: connections[i].userName },
                    { name: 'password', content: connections[i].password },
                ],
                child: 1,
                item: []
            });
        }
    }

    /*var items = {id:0,
        item:[
            {id:1,text:"first"},
            {id:2, text:"middle",child:"1",im0:"server.gif",im1:"server.gif",im2:"server.gif",
                item:[
                    {id:"21", text:"child"}
                ]},
            {id:3,text:"last"}
        ]
    };*/

    //var items = "<?xml version='1.0' ?><tree id='0'><item id='host^0' child='true' im0='server.gif' im1='server.gif' im2='server.gif'><itemtext><![CDATA[db2.dhtmlx.com]]></itemtext></item></tree>";
    return items;
}

var dhtmlxMainWindow, connectionsTree, connectionsContextMenu, fileContextMenu, folderContextMenu;
function doOnLoad() {
    dhtmlxMainWindow = new dhtmlXLayoutObject({
        parent: document.body,  // parent container
        pattern: "2U"           // layout's pattern
    });

    dhtmlxMainWindow.cells("a").setWidth(250);
    dhtmlxMainWindow.cells("a").setText("Connections");
    dhtmlxMainWindow.cells("b").hideHeader();

    dhtmlxMainWindow.cells("b").attachObject("editor");

    connectionsTree = dhtmlxMainWindow.cells("a").attachTree(0);
    connectionsTree.setIconSize(18,18);
    connectionsTree.setImagePath("../assets/images/");
    connectionsTree.enableSmartXMLParsing(true);
    connectionsTree.enableItemEditor(false);
    //var ci = JSON.stringify(connectionItems());
    var ci = connectionItems();
    //console.log(ci);
    connectionsTree.parse(ci, "json");

    connectionsTree.attachEvent("onOpenEnd", function(id, state) {
        switch(connectionsTree.getUserData(id, "type")) {
            case 'connection':
                console.log(id, state);
                if(state == 0) {
                    var opts = {
                        host: connectionsTree.getUserData(id, "host"),
                        port: connectionsTree.getUserData(id, "port"),
                        user: connectionsTree.getUserData(id, "username"),
                        pass: atob(connectionsTree.getUserData(id, "password")),
                    }

                    ftpClient = new ftp(opts);

                    var files = [];
                    var folders = [];

                    ftpClient.ls('/', function(err, res) {
                        if (err) throw err;
                        res.forEach(function(file) {
                            switch(file.type) {
                                case 0:
                                    files.push({
                                        id: id,
                                        name: file.name,
                                    });
                                    break;

                                case 1:
                                    folders.push({
                                        id: id,
                                        name: file.name,
                                    });
                                    break;
                            }
                        });

                        folders.forEach(function(folder) {
                            connectionsTree.insertNewItem(id, folder.name, folder.name,0,"folderOpen.gif");
                            connectionsTree.insertNewItem(folder.name, opts.name+folder.name+"_", "");
                            connectionsTree.closeItem(folder.name);

                            connectionsTree.setUserData(folder.name, "type", "folder");
                            connectionsTree.setUserData(folder.name, "name", "/"+folder.name);
                        });

                        files.forEach(function(file) {
                            connectionsTree.insertNewItem(id, file.name, file.name);
                                
                            connectionsTree.setUserData(file.name, "type", "file");
                            connectionsTree.setUserData(file.name, "name", "/"+file.name);
                        });
                    });
                }
                break;

            case 'folder':
                if(state == 1) {
                    var opts = {
                        name: connectionsTree.getUserData(id, "name"),
                    }

                    //connectionsTree.deleteItem(opts.name+"_");
                    connectionsTree.deleteChildItems(id);

                    var files = [];
                    var folders = [];
                    
                    ftpClient.ls(opts.name, function(err, res) {
                        if (err) throw err;
                        res.forEach(function(file) {
                            switch(file.type) {
                                case 0:
                                    /*connectionsTree.insertNewItem(id, file.name, file.name);
                                    
                                    connectionsTree.setUserData(file.name, "type", "file");
                                    connectionsTree.setUserData(file.name, "name", file.name);*/
                                    files.push({
                                        id: id,
                                        name: file.name,
                                        parent: opts.name+"/"+file.name,
                                    });
                                    break;

                                case 1:
                                    folders.push({
                                        id: id,
                                        name: file.name,
                                        parent: opts.name+"/"+file.name,
                                    });
                                    /*connectionsTree.insertNewItem(id, file.name, file.name,0,"folderOpen.gif");
                                    connectionsTree.insertNewItem(file.name, opts.name+file.name+"_", "");
                                    connectionsTree.closeItem(file.name);

                                    connectionsTree.setUserData(file.name, "type", "folder");
                                    connectionsTree.setUserData(file.name, "name", opts.name+"/"+file.name);*/
                                    break;
                            }
                        });

                        folders.forEach(function(folder) {
                            connectionsTree.insertNewItem(id, folder.parent, folder.name,0,"folderOpen.gif");
                            connectionsTree.insertNewItem(folder.parent, folder.name+"_", "");
                            connectionsTree.closeItem(folder.parent);

                            connectionsTree.setUserData(folder.parent, "type", "folder");
                            connectionsTree.setUserData(folder.parent, "name", folder.parent);
                        });

                        files.forEach(function(file) {
                            connectionsTree.insertNewItem(id, file.parent, file.name);
                                
                            connectionsTree.setUserData(file.parent, "type", "file");
                            connectionsTree.setUserData(file.parent, "name", file.parent);
                        });

                        console.log(folders, files);
                    });
                }
                break;
            case 'file':
                console.log(id, state);
                console.log(remote.app.getPath('temp'));

                var temp = require('temp').track();
                var fs = require('fs');
                var tempFile = temp.openSync();

                ftpClient.get(id, tempFile.path, function(err) {
                    if(err) {
                        console.log(err);
                    } else {
                        console.log(tempFile, "File transfered");
                        fs.readFile(tempFile.path, 'utf-8', function(err, data) {
                            console.log(data);
                            fs.unlink(tempFile.path, (err) => {
                                if (err) throw err;
                                console.log('successfully deleted '+tempFile.path);
                            });
                        })
                    }
                })
                break;
            default:
                console.log(connectionsTree.getUserData(id, "type"));
        }

        return true;
    });

    connectionsTree.attachEvent("onRightClick", function(id, ev) {
        switch(connectionsTree.getUserData(id, "type")) {
            case 'connection':
                if(connectionsContextMenu == null) {
                    connectionsContextMenu = new dhtmlXMenuObject({
                        context: true,
                        open_mode: "win",
                        items: [
                            {id: "editConnection", text: 'Edit Connection'},
                            {id: "newConnection", text: 'New Connection'},
                            {type: "separator"},
                            {id: "deleteConnection", text: "Delete Account"}
                        ]
                    });

                    connectionsContextMenu.attachEvent("onClick", function(id) {
                        switch(id) {
                            case "newConnection":
                                ipcRenderer.sendSync('open-window', 'createConnectionWindow');
                                break;

                            case "editConnection":
                                break;

                            case "deleteConnection":
                                break;
                        }
                    });
                } 
                connectionsContextMenu.showContextMenu(ev.x, ev.y);
                break;

            case 'folder':
                if(folderContextMenu == null) {
                    folderContextMenu = new dhtmlXMenuObject({
                        context: true,
                        open_mode: "win",
                        items: [
                            {id: "newFolder", text: 'New Folder'},
                            {id: "newFile", text: 'New File'},
                            {type: "separator"},
                            {id: "deleteFolder", text: 'Delete Folder'}
                        ]
                    });

                    folderContextMenu.attachEvent("onClick", function(id) {
                        switch(id) {
                            case "newFolder":
                                break;

                            case "newFile":
                                break;

                            case "deleteFolder":
                                break;
                        }
                    });
                }
                folderContextMenu.showContextMenu(ev.x, ev.y);
            default:
                console.log(connectionsTree.getUserData(id, "type"));
        }

        return true;
    });

    /*connectionsTree = dhtmlxMainWindow.cells("a").attachTreeView({
		root_id: "",
        context_menu: true,
		iconset: "font_awesome",
		items: contextMenuItems()
	});

    connectionsTree.attachEvent("onOpenStart", function(id, state) {
        console.log(id, state);
    });

    connectionsTree.attachEvent("onContextMenu", function(id, x, y, ev){
        if(connectionsContextMenu == null) {
            connectionsContextMenu = new dhtmlXMenuObject({
                context: true,
                open_mode: "win",
                items: [
                    {id: "editConnection", text: 'Edit Connection'},
                    {id: "newConnection", text: 'New Connection'},
                    {type: "separator"},
                    {id: "deleteConnection", text: "Delete Account"}
                ]
            });

            connectionsContextMenu.attachEvent("onClick", function(id) {
                console.log(id);
                switch(id) {
                    case "newConnection":
                        ipcRenderer.sendSync('open-window', 'createConnectionWindow');
                        break;

                    case "editConnection":
                        break;

                    case "deleteConnection":
                        break;
                }
            });
        } else {
            connectionsContextMenu.hideContextMenu();
        }

        if(fileContextMenu == null) {
            fileContextMenu = new dhtmlXMenuObject({
                context: true,
                open_mode: "win",
                items: [
                    {id: "openFile", text: 'Open File'},
                    {id: "renameFile", text: 'Rename'},
                    {type: "separator"},
                    {id: "deleteFile", text: 'Delete'}
                ]
            });

            fileContextMenu.attachEvent("onClick", function(id) {
                console.log(id);
            });
        } else {
            fileContextMenu.hideContextMenu();
        }

        if(folderContextMenu == null) {
            folderContextMenu = new dhtmlXMenuObject({
                context: true,
                open_mode: "win",
                items: [
                    {id: "newFolder", text: 'New Folder'},
                    {id: "newFile", text: 'New File'},
                    {type: "separator"},
                    {id: "deleteFolder", text: 'Delete Folder'}
                ]
            });

            folderContextMenu.attachEvent("onClick", function(id) {
                console.log(id);
                switch(id) {
                    case "newFolder":
                        break;

                    case "newFile":
                        break;

                    case "deleteFolder":
                        break;
                }
            });
        } else {
            folderContextMenu.hideContextMenu();
        }

        switch(connectionsTree.getUserData(id, "type")) {
            case "connection":
                connectionsContextMenu.showContextMenu(x, y);
                break;

            case "file":
                fileContextMenu.showContextMenu(x, y);
                break;

            case "folder":
                folderContextMenu.showContextMenu(x, y);
                break;
        }
        return true;
    });*/
}
doOnLoad();


/*var size = remote.getCurrentWindow().getBounds()
var window;
function createConnectionWindow() {
    var width = 475;
    var height = 420;
    var x = (size.width-width)/2;
    var y = (size.height-height)/2;

    var connectionWindow = new dhtmlXWindows();
    if(window == null) {
        connectionWindow.createWindow("createConnection", x, y, width, height);

        window = connectionWindow.window("createConnection"); 
        window.setText("New Connection");
        window.denyResize();
        window.denyPark();
        window.attachURL(`file://${__dirname}/createConnection.html`);

        window.attachEvent("onClose", function(win){
            window = null;
            return true;
        });
    } 
}*/
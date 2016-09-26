// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const remote = require('electron').remote; 
const BrowserWindow = remote.BrowserWindow;

const {ipcRenderer} = require('electron')

/*const storage = require('electron-json-storage');

storage.set('foobar', { foo: 'bar' }, function(error) {
  if (error) throw error;
});

storage.get('foobar', function(error, data) {
  if (error) throw error;

  console.log(data);
});*/

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

    connectionsTree = dhtmlxMainWindow.cells("a").attachTreeView({
		root_id: "",
        context_menu: true,
		iconset: "font_awesome",
		items: [
            {id: "1", text: "Text 1", icons: {
                    "file": "icon-file",
                    "folder_opened": "fa-database fa-fw blue",
                    "folder_closed": "fa-database fa-fw"
            }
            , items: [
                {id: "1_1", text: "Text 1_1", userdata: { type: "file" }},
                {id: "1_2", text: "Text 1_2", userdata: { type: "file" }},
                {id: "1_3", text: "Text 1_3", kids: true, userdata: { type: "folder" }, items: [{id:"1_3_1", text: "Text 1_3_1", userdata: { type: "file" }}]},
                {id: "1_4", text: "Text 1_4", kids: true, userdata: { type: "folder" }, items: [{id:"1_4_1", text: "Text 1_4_1", userdata: { type: "file" }}]}
            ],
            userdata: {
                type: "connection"
            }}, // rendered as folder
            {id: "2", text: "Text 2", kids: true}, // rendered as folder
            {id: "3", text: "Text 3", userdata: { type: "file" }}, // rendered as file
            {id: "4", text: "Text 4", userdata: { type: "file" }}  // rendered as file
        ]
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
    });
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
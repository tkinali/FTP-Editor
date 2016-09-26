const storage = require('electron-json-storage');
const {ipcRenderer} = require('electron')

layout = new dhtmlXLayoutObject({
    parent: document.body,
    pattern: "1C"
});

formStructure = [
	{type: "settings", position: "label-top", inputWidth: "100", labelAlign: "right"},
	{_idd: "100", type: "block", width: "auto", blockOffset: "", list: [
		{type: "settings", position: "label-left", labelWidth: "150", inputWidth: "250"},
		{_idd: "106", type: "input", label: "Connection Name", value: "", name: "connectionName", offsetTop: "20"},
		{_idd: "107", type: "input", label: "Host", value: "", name: "host", offsetTop: "20"},
		{_idd: "209", type: "input", label: "Port", value: "", name: "port", offsetTop: "20", position: "label-left", inputWidth: "100", maxLength: "4"},
		{_idd: "228", type: "input", label: "User Name", value: "", name: "userName", offsetTop: "20"},
		{_idd: "235", type: "password", label: "Password", value: "", name: "password", offsetTop: "20"},
		{_idd: "278", type: "checkbox", label: "Save password", value: "", checked: true, name: "savePassword", offsetTop: "20"},
		{_idd: "476", type: "button", label: "New Input", value: "Save Connection", inputTop: "10", offsetTop: "20", name: "saveConnection", inputLeft: "150"}
	]}
];

//var myForm = new dhtmlXForm("form_container",formStructure);

layout.cells("a").hideHeader();
myForm = layout.cells("a").attachForm(formStructure);

myForm.attachEvent("onButtonClick", function(id){
    /*var sttngs = new Object();
    sttngs.connectionName = myForm.isItemChecked("connectionName");
    sttngs.host = myForm.isItemChecked("host");
    sttngs.port = myForm.isItemChecked("port");
    sttngs.userName = myForm.isItemChecked("userName");

    if(myForm.isItemChecked("savePassword")) {
        sttngs.password = myForm.isItemChecked("password");
    }

    console.log(sttngs);
    console.log(myForm.isItemChecked("savePassword"))*/
    console.log("hebele");
    ipcRenderer.sendSync('open-window', 'closeConnectionWindow');
})
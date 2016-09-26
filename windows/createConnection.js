const electron = require('electron').remote
const storage = require('electron-json-storage');
const {ipcRenderer} = require('electron')
const dialog = electron.dialog

layout = new dhtmlXLayoutObject({
    parent: document.body,
    pattern: "1C"
});

formStructure = [
	{type: "settings", position: "label-top", inputWidth: "100", labelAlign: "right"},
	{_idd: "100", type: "block", width: "auto", blockOffset: "", list: [
		{type: "settings", position: "label-left", labelWidth: "150", inputWidth: "250"},
		{_idd: "106", type: "input", label: "Connection Name", value: "", name: "connectionName", offsetTop: "20", note: 		{text: "Please enter a connection name"}, style: "margin-bottom:4px;"},
		{_idd: "107", type: "input", label: "Host", value: "", name: "host", offsetTop: "20", note: 		{text: "Enter host name (eg: ftp.example.com)"}, style: "margin-bottom:4px;"},
		{_idd: "209", type: "input", label: "Port", value: "21", name: "port", offsetTop: "20", position: "label-left", inputWidth: "50", maxLength: "4", numberFormat: "0000", note: 		{text: "FTP Port (Default:21)", width: "120"}, style: "margin-bottom:4px;"},
		{_idd: "228", type: "input", label: "User Name", value: "", name: "userName", offsetTop: "20", note: 		{text: "FTP username"}, style: "margin-bottom:4px;"},
		{_idd: "235", type: "password", label: "Password", value: "", name: "password", offsetTop: "20", note: 		{text: "FTP password"}, style: "margin-bottom:4px;"},
		{_idd: "278", type: "checkbox", label: "Save password", value: "", checked: true, name: "savePassword", offsetTop: "20", note: 		{text: "If you do not save the password will be prompted during the connection"}},
		{type: "block", width: "auto", blockOffset: 20, offsetLeft: "130", offsetTop: "10", list: [
			{type: "button", label: "New Input", value: "Close", name: "closeConnectionWindow"},
			{type: "newcolumn"},
			{type: "button", label: "New Input", value: "Save Connection", name: "saveConnection", offsetLeft: "30"}
		]}
	]}
];

layout.cells("a").hideHeader();
myForm = layout.cells("a").attachForm(formStructure);

myForm.attachEvent("onButtonClick", function(id){
    switch(id) {
        case "closeConnectionWindow":
            ipcRenderer.sendSync('open-window', 'closeConnectionWindow');
            break;

        case "saveConnection":
            var settings = new Object();
            settings.connectionName = myForm.getItemValue("connectionName");
            settings.host = myForm.getItemValue("host");
            settings.port = myForm.getItemValue("port");
            settings.userName = myForm.getItemValue("userName");

            if(myForm.isItemChecked("savePassword")) {
                settings.password = btoa(myForm.getItemValue("password"));
            }

            var errors = [];
            if('' == settings.connectionName.trim()) {
                errors.push("Please enter a connection name.");
            }

            if('' == settings.host.trim()) {
                errors.push("Please enter FTP hostname.");
            }

            if(isNaN(settings.port.trim())) {
                errors.push("Please enter valid port number.");
            }

            if('' == settings.userName.trim()) {
                errors.push("Please enter FTP hostname.");
            }

            if(0 < errors.length) {
                errors = errors.join("\n- ");
                dialog.showMessageBox({type: 'error', buttons:['OK'], title: 'Error', message: "Please correct the following errors:\n\n- "+errors})
            }

            var connectionData = {connections: []};

            storage.get('connections', function(error, data) {
                if (error) throw error;

                if(undefined != data.connections) {
                    connectionData = data;
                }
                connectionData.connections.push(settings)
                console.log(connectionData)
                storage.set('connections', connectionData, function(error) {
                    if (error) throw error;
                });
                ipcRenderer.sendSync('open-window', 'closeConnectionWindow');
            });
            break;
    }
})
({
    triggerSendMessage: function(component, event, helper) {
        if (event.keyCode == 13) {
            helper.sendMessage(component, event, helper);
        }
    },
    
    sendButtonClicked: function(component, event, helper) {
        helper.sendMessage(component, event, helper);
    },
    
    attachClicked: function(component, event, helper) {
        component.find('fileInput').getElement().click();
    },
    
    fileUploaded: function(component, event, helper) {
        var fileInput = component.find("fileInput").getElement();
        var file = fileInput.files[0];
        component.set('v.uploadedFileName', file.name);
    },
    
    removeFile: function(component, event, helper) {
        var fileInput = component.find("fileInput").getElement();
        fileInput.value = '';
        component.set('v.uploadedFileName', '');
    }
})
({
	init: function(component, event, helper) {
        var recordId = component.get('v.recordId');
        
        if (recordId) {
        	var action = component.get('c.getNetworksForContact');
        	action.setParams({ contactId: recordId})    
            
            action.setCallback(this, function(result) {
                if (result.getState() == 'SUCCESS') {
                    var networks = result.getReturnValue();
                    component.set('v.networks', networks);
                    if (networks.length > 0) {
                    	component.set('v.selectedNetwork', networks[0].Network.Name); 
                        helper.getMessagesForNetwork(component);
                    }
                } else {
                    console.error(result.getError());
                }
            });
            
            $A.enqueueAction(action);
        }
		
	},
    
    sendMessage: function(component, event, helper) {
        helper.sendMessage(component, event, helper);
    },
    
    changeNetwork: function(component, event, helper) {
        helper.getMessagesForNetwork(component);
    },
    
    attachClicked: function(component, event, helper) {
        event.preventDefault();
        event.stopPropagation();
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
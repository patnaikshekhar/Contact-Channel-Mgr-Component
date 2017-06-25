({
	sendMessage : function(component, event, helper) {
        var fileInput = component.find("fileInput").getElement();
        var file = fileInput.files[0];
        
        if (file) {
       		var fr = new FileReader();
            
            fr.onload = $A.getCallback(function() {
                var fileContents = fr.result;
                var base64Mark = 'base64,';
                var dataStart = fileContents.indexOf(base64Mark) + base64Mark.length;
                
                fileContents = fileContents.substring(dataStart);
                
                helper.triggerSendEvent(component, event, helper, {
                    name: file.name,
                    contents: fileContents
                });
            });
            
            fr.readAsDataURL(file);
        } else {
        	helper.triggerSendEvent(component, event, helper);    
        }
        
	},
    
    triggerSendEvent: function(component, event, helper, fileInfo) {
        var messageBox = component.find('messageText').getElement();
        var fileInput = component.find("fileInput").getElement();
        
        var params = { 
            domEvent: event, 
            value: {
                message: messageBox.value,
                file: fileInfo
            }
        };
        
        messageBox.value = '';
        component.getEvent('onSendMessage').fire(params);
        
        component.set('v.uploadedFileName', '');
        fileInput.value = '';
    }
})
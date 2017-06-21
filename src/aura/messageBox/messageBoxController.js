({
    triggerSendMessage : function(component, event, helper) {
        var message = event.target.value;
        
        if (event.keyCode == 13) {
            component.getEvent('onSendMessage').fire({ domEvent: event, value: message });
            event.target.value = '';
        }
    },
    
    sendButtonClicked : function(component, event, helper) {
        var messageBox = component.find('messageText').getElement();
        component.getEvent('onSendMessage').fire({ domEvent: event, value: messageBox.value });
        messageBox.value = '';
    }
})
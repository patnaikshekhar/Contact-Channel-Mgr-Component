({
	init: function(component, event, helper) {
        
        helper.init(component);
        
        helper.requestNotificationPermission(component, helper);
        
        helper.getStoredMessages(component, helper);
        
		helper.getDirectMessages(component, helper, false);
        
        // Refresh after every few seconds
        helper.setRefresh(component, helper);
	},
    
    showMessageDialog: function(component, event, helper) {
        var currentState = component.get('v.showMessages');
        component.set('v.showMessages', !currentState);
        
        // Remove existing messages
        component.set('v.newMessageCount', 0);
        
        // Change the color
        helper.setButtonBackground(component);
        
        setTimeout(function() {
            component.getElement().querySelector('.message-text').focus();
        }, 800);
    },
    
    sendMessage: function(component, event, helper) {
        helper.sendDirectMessage(component, event, helper);
    }
})
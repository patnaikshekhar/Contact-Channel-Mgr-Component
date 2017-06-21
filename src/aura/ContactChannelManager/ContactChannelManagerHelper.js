({
	getDirectMessages: function(component, helper, hideNewMessages) {
		var action = component.get('c.getDMFromChannelManager');
        
        action.setCallback(this, function(result) {
            console.log('Result from action', result.getState())
            if (result.getState() == 'SUCCESS') {
                console.log('Return Value', result.getReturnValue());
                
                var oldMessages = component.get('v.messages') ? component.get('v.messages') : [];
                
                var oldMessageIds = oldMessages.map(function(msg) {
                   return msg.id; 
                });
                
                component.set('v.messages', result.getReturnValue());
                
                var newMessages = component.get('v.messages').filter(function(msg) {
                   return oldMessageIds.indexOf(msg.id) == -1;
                });
                
                if (newMessages.length > 0 && oldMessages.length > 0 && hideNewMessages != true) {
                    
                    // Add to the existing message count
                    var existingCount = parseInt(component.get('v.newMessageCount'));
                    
                    component.set('v.newMessageCount', existingCount + newMessages.length);
                    
                    newMessages.forEach(function(msg) {
                    	helper.sendNotification(component, msg.body.text);
                    });
                }
                
                // Store messages
                helper.storeMessages(component, result.getReturnValue());
                
            } else {
                console.error(result.getError());
            }
        });
        
        $A.enqueueAction(action);
	},
    
    sendDirectMessage: function(component, event, helper) {
		var action = component.get('c.sendDMToChannelManager');
        
        action.setParams({ message: event.getParam('value') });
        
        action.setCallback(this, function(result) {
            if (result.getState() == 'SUCCESS') {
                helper.getDirectMessages(component, helper, true);
            } else {
                console.error(result.getErrors());
            }
        });
        
        $A.enqueueAction(action);
	},
    
    setRefresh: function(component, helper) {
        
        var refreshInterval = parseInt(component.get('v.refreshMessageInterval'));
        
        if (component.get('v.refreshMessages') === true) {
            setTimeout($A.getCallback(function() {
                if (component.isValid()) {
                    helper.getDirectMessages(component, helper, false);    
                    helper.setRefresh(component, helper);
                }
            }), refreshInterval);
        }
    },
    
    storeMessages: function(component, messages) {
        if (component.get('v.cacheMessages') === true) {
        	if (typeof(Storage) !== "undefined") {
                localStorage.setItem('messages', JSON.stringify(messages));    
            }    
        }
    },
    
    getStoredMessages: function(component, helper) {
        if (component.get('v.cacheMessages') === true) {
        	if (typeof(Storage) !== "undefined") {
                var messages = localStorage.getItem('messages');
                if (messages) {
                    try {
                    	component.set('v.messages', JSON.parse(messages));    
                    } catch(e) {
                        console.log('Error', e, ' autofixing message store');
                        // Fix message store
                        helper.storeMessages(component, null);
                        component.set('v.messages', null);    
                    }
                }
            }    
        }
    },
    
    requestNotificationPermission: function(component, helper) {
        if ("Notification" in window) {
            if (component.get('v.showNotifications') === true) {
                if (Notification.permission === "granted") {
                    component.set('v.notificationStatus', Notification.permission);
                } else if (Notification.permission !== 'denied') {
                    Notification.requestPermission(function (permission) {
                    	component.set('v.notificationStatus', Notification.permission);   
                    });
                }
            }
        }
    },
    
    sendNotification: function(component, message) {
        if ("Notification" in window) {
            if (component.get('v.showNotifications') === true) {
		    	if (Notification.permission === "granted") {
    				new Notification(message);
				}
            }
        }
    },
    
    setButtonBackground: function(component) {
        
        var showMessages = component.get('v.showMessages');
        
        var elements = component.getElements();
        elements.forEach(function(element) {
            if (element.className.indexOf('my-channel-partner') > -1) {
                element.style.backgroundColor = 
                    showMessages ? component.get('v.buttonInactiveColor') : component.get('v.buttonColor');
            } 
        });
    }
})
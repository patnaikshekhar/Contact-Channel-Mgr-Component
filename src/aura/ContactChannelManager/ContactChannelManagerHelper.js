({
    init: function(component, callback) {
        var action = component.get('c.getInitialisationDetails');
        
        action.setCallback(this, function(result) {
            if (result.getState() == 'SUCCESS') {
                if (component.get('v.showChannelMgrPictureInsteadOfIcon') == true) {
                    console.log('Setting picture url to ', result.getReturnValue().photo.smallPhotoUrl);
                	component.set('v.cmPictureUrl', result.getReturnValue().photo.smallPhotoUrl);
                }
            } else {
                console.error(result.getError());
            }
        });
        
        $A.enqueueAction(action);
    },
    
	getDirectMessages: function(component, helper, hideNewMessages) {
		var action = component.get('c.getDMFromChannelManager');
        
        action.setCallback(this, function(result) {
            if (result.getState() == 'SUCCESS') {
                console.log('Return Value', result.getReturnValue());
                
                var messages = result.getReturnValue().reduce(function(acc, message) {
                    
                    var file = null;
                    
                    if (message.capabilities.files) {
                        if (message.capabilities.files.items) {
                            if (message.capabilities.files.items.length > 0) {
                                file = {
                                    url: message.capabilities.files.items[0].downloadUrl,
                                    thumbnail: message.capabilities.files.items[0].renditionUrl,
                                    title: message.capabilities.files.items[0].title 
                                };
                            }
                        }    
                    }
                    
                    var msg = {
                        actor: message.actor.name,
                        photo: message.actor.photo.smallPhotoUrl,
                        text: message.body.text,
                        id: message.id,
                        file: file
                    };
                    
                    var result = acc.concat(msg);
                    
                    if (message.capabilities.comments) {
                        var comments = message.capabilities.comments.page.items.reduce(function(acc, comment) {
                            var msg = {
                                actor: comment.user.name,
                                photo: comment.user.photo.smallPhotoUrl,
                                text: comment.body.text,
                                id: comment.id
                            };
                            
                            return acc.concat(msg);
                        }, []);
                        
                        result = comments.concat(result);
                    } 
                    
                    return result;
                   
                }, []);
                
                console.log('messages', messages);
                
                var oldMessages = component.get('v.messages') ? component.get('v.messages') : [];
                
                var oldMessageIds = oldMessages.map(function(msg) {
                   return msg.id; 
                });
                
                component.set('v.messages', messages);
                
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
                helper.storeMessages(component, messages);
                
            } else {
                console.error(result.getError());
            }
        });
        
        $A.enqueueAction(action);
	},
    
    sendDirectMessage: function(component, event, helper) {
		var action = component.get('c.sendDMToChannelManager');
        
        action.setParams({ 
            message: event.getParam('value').message,
            fileName: event.getParam('value').file ? event.getParam('value').file.name : null,
            fileContents: event.getParam('value').file ? event.getParam('value').file.contents : null
        });
        
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
({
	getMessagesForNetwork : function(component) {
		var allNetworks = component.get('v.networks');
        var selectedNetworkName = component.get('v.selectedNetwork');
        var selectedNetwork = allNetworks.filter(function(network) {
            return network.Network.Name == selectedNetworkName;
        })[0];
        
        console.log('getMessagesForNetwork', allNetworks, selectedNetworkName, selectedNetwork);
        
        if (selectedNetwork) {
        	var action = component.get('c.getDMsFromUser');
            
            action.setParams({
                userId: selectedNetwork.MemberId,
                networkId: selectedNetwork.NetworkId
            })
            
            action.setCallback(this, function(result) {
                if (result.getState() == 'SUCCESS') {
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
                        
                        if (message.capabilities.comments) {
                            var comments = message.capabilities.comments.page.items.reduce(function(acc, comment) {
                                var msgComment = {
                                    actor: comment.user.name,
                                    photo: comment.user.photo.smallPhotoUrl,
                                    text: comment.body.text,
                                    id: comment.id
                                };
                                
                                return acc.concat(msgComment);
                            }, []);
                            
                            return acc.concat(comments.concat(msg));
                        } else {
                            return acc.concat(msg);   
                        }
                        
                    }, []);
                    
                    component.set('v.messages', messages);
                } else {
                    console.error(result.getError());
                }
            });
            
            $A.enqueueAction(action);
        }
        
	},
    
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
        var action = component.get('c.sendDM');
        var allNetworks = component.get('v.networks');
        var selectedNetwork = component.get('v.selectedNetwork');
        var fileInput = component.find("fileInput").getElement();
        
        var params = {
            userId: allNetworks[0].MemberId,
            networkId: allNetworks.filter(function(network) {
                return network.Network.Name == selectedNetwork;
            })[0].NetworkId,
            message: component.get('v.message'),
            fileName: fileInfo ? fileInfo.name : null,
            fileContents: fileInfo ? fileInfo.contents : null
        }
        
        action.setParams(params);    
        
        action.setCallback(this, function(result) {
            if (result.getState() == 'SUCCESS') {
                var dismissActionPanel = $A.get("e.force:closeQuickAction");
                dismissActionPanel.fire();
                component.set('v.uploadedFileName', '');
        		fileInput.value = '';
            } else {
                console.error(result.getError());
            }
        });
        
        $A.enqueueAction(action);
    }
})
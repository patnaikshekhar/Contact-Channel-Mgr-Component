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
        var action = component.get('c.sendDM');
        var allNetworks = component.get('v.networks');
        var selectedNetwork = component.get('v.selectedNetwork');
        
        var params = {
            userId: allNetworks[0].MemberId,
            networkId: allNetworks.filter(function(network) {
                return network.Network.Name == selectedNetwork;
            })[0].NetworkId,
            message: component.get('v.message'),
            fileName: null,
            fileContents: null
        }
        
        action.setParams(params);    
            
        action.setCallback(this, function(result) {
            if (result.getState() == 'SUCCESS') {
                console.log('Message sent');
                var dismissActionPanel = $A.get("e.force:closeQuickAction");
                dismissActionPanel.fire();
            } else {
                console.error(result.getError());
            }
        });
        
        $A.enqueueAction(action);
    },
    
    changeNetwork: function(component, event, helper) {
        helper.getMessagesForNetwork(component);
    }
})
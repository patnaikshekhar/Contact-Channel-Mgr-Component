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
                    component.set('v.messages', result.getReturnValue());
                } else {
                    console.error(result.getError());
                }
            });
            
            $A.enqueueAction(action);
        }
        
	}
})
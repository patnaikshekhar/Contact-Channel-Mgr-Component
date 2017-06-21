public with sharing class ContactChannelManagerService {

	/**
	  * Finds the Id of the channel manager of the curren user
		* returns null if the user is not a portal user
		* @return Id of channel manager
	*/
	@TestVisible
	private static Id getChannelManager() {
		User u = [
		SELECT Contact.Account.OwnerId
		FROM User
		WHERE Id = :UserInfo.getUserId()];

		if (u.Contact != null) {
			if (u.Contact.Account != null) {
				return u.Contact.Account.OwnerId;
			}
		}

		return null;
	}
        
	/**
	  * Finds the direct messages from the channel manager
		* @return List of Feed Items of the feeds
	*/
	@AuraEnabled
	public static List<ConnectApi.FeedElement> getDMFromChannelManager() {
		
        List<ConnectApi.FeedElement> result = new List<ConnectApi.FeedElement>();
        
        try {
            Id channelManagerId = getChannelManager();    
            if (channelManagerId != null) {
                result = getDMsFromUser(channelManagerId, Network.getNetworkId());
            }  
        } catch(Exception e) {
            throw(e);
        }

		return result;
	}
    
    /**
	  * Finds the direct messages from the channel manager
		* @return List of Feed Items of the feeds
	*/
	@AuraEnabled
	public static List<ConnectApi.FeedElement> getDMsFromUser(Id userId, Id networkId) {
		
        List<ConnectApi.FeedElement> result = new List<ConnectApi.FeedElement>();
        
        try {   
            if (userId != null) {
                ConnectApi.FeedElementPage allFeeds = ConnectApi.ChatterFeeds.getFeedElementsFromFeed(networkId, ConnectApi.FeedType.DirectMessages);
                if (allFeeds.elements != null) {
                    for (ConnectApi.FeedElement element : allFeeds.elements) {
                        ConnectApi.FeedItem item = (ConnectApi.FeedItem) element;
                        
                        if (item.capabilities != null) {
                            if (item.capabilities.directmessage != null) {
                                if (item.capabilities.directmessage.members != null) {
                                    if (item.capabilities.directmessage.members.users != null) {
                                        for (ConnectApi.UserSummary user : item.capabilities.directmessage.members.users) {
                                            if (user.id == userId) {
                                                result.add(element);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }  
        } catch(ConnectApi.RateLimitException e) {
            System.debug('Hit the rate limit exception ' + e);
        } catch(Exception e) {
            throw(e);
        }
		

		return result;
	}
    
    /**
	  * Sends a direct message to the channel manager
	  * @return List of Feed Items of the feeds
	*/
	@AuraEnabled
    public static Boolean sendDMToChannelManager(String message) {
        
        Boolean result = false;

        if (message != null && message != '') {
            Id channelManagerId = getChannelManager();
            if (channelManagerId != null) {
                
                /*ConnectApi.MessageBodyInput messageInput = new ConnectApi.MessageBodyInput();
                messageInput.messageSegments = new List<ConnectApi.MessageSegmentInput>();
                
                ConnectApi.TextSegmentInput textSegment = new ConnectApi.TextSegmentInput();
                textSegment.text = message;
                messageInput.messageSegments.add(textSegment);
                    
                ConnectApi.DirectMessageCapabilityInput dmCapability = new ConnectApi.DirectMessageCapabilityInput();
                dmCapability.subject = message;
                dmCapability.membersToAdd = new List<String> { channelManagerId };
                
                ConnectApi.FeedItemInput input = new ConnectApi.FeedItemInput();
                input.body = messageInput;
                input.capabilities = new ConnectApi.FeedElementCapabilitiesInput();
                input.capabilities.directMessage = dmCapability;
                
                if (!Test.isRunningTest())
                	ConnectApi.ChatterFeeds.postFeedElement(Network.getNetworkId(), input);
                
                result = true;*/
                
                return sendDM(channelManagerId, Network.getNetworkId(), message);
            }
        }
        
        return result;
    }
    
    /**
	  * Sends a direct message to a user in a network
	  * @return whether the message was sent
	*/
	@AuraEnabled
    public static Boolean sendDM(Id userId, Id networkId, String message) {
        
        Boolean result = false;

        if (message != null && message != '') {
            if (userId != null && networkId != null) {
                
                ConnectApi.MessageBodyInput messageInput = new ConnectApi.MessageBodyInput();
                messageInput.messageSegments = new List<ConnectApi.MessageSegmentInput>();
                
                ConnectApi.TextSegmentInput textSegment = new ConnectApi.TextSegmentInput();
                textSegment.text = message;
                messageInput.messageSegments.add(textSegment);
                    
                ConnectApi.DirectMessageCapabilityInput dmCapability = new ConnectApi.DirectMessageCapabilityInput();
                dmCapability.subject = message;
                dmCapability.membersToAdd = new List<String> { userId };
                
                ConnectApi.FeedItemInput input = new ConnectApi.FeedItemInput();
                input.body = messageInput;
                input.capabilities = new ConnectApi.FeedElementCapabilitiesInput();
                input.capabilities.directMessage = dmCapability;
                
                if (!Test.isRunningTest())
                	ConnectApi.ChatterFeeds.postFeedElement(networkId, input);
                
                result = true;
            }
        }
        
        return result;
    }
    
    @AuraEnabled
    public static List<NetworkMember> getNetworksForContact(Id contactId) {
        if (contactId != null) {
            List<User> users = [SELECT Id FROM User WHERE ContactId = :contactId];
            
            if (users.size() > 0) {
                List<NetworkMember> members = [Select Id, MemberId, NetworkId, Network.Name From NetworkMember WHERE MemberId = :users.get(0).Id];
                return members;    
            }
        }
        
        return null;
    }
}
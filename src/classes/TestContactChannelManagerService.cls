@isTest
private class TestContactChannelManagerService {
    public static Id createUserRole() {
        UserRole ur = new UserRole(Name = 'CEO');
        insert ur;
        
        return ur.Id;
    }
    
    public static User createStandardUser(String profile) {
        User u = new User(
            ProfileId = [SELECT Id FROM Profile WHERE Name = :profile].Id,
            LastName = 'Test',
            Email = 'test@onboarding.com',
            Username = 'test@onboarding.com' + System.currentTimeMillis(),
            CompanyName = 'TEST',
            Title = 'title',
            Alias = 'alias',
            TimeZoneSidKey = 'America/Los_Angeles',
            EmailEncodingKey = 'UTF-8',
            LanguageLocaleKey = 'en_US',
            LocaleSidKey = 'en_US',
            UserRoleId = createUserRole()
        );
        
        return u;
    }
    
    public static User createPartnerCommunityUser() {
        Account a = new Account(name = 'Community Account');
        insert a;
        
        Contact c = new Contact(LastName = 'CommunityAccessTest', AccountId = a.Id);
        insert c;
        
        User u = new User(
            ProfileId = [SELECT Id FROM Profile WHERE Name = 'Partner Community User'].Id,
            LastName = 'Test',
            Email = 'test@onboarding.com',
            Username = 'test@onboarding.com' + System.currentTimeMillis(),
            CompanyName = 'TEST',
            Title = 'title',
            Alias = 'alias',
            TimeZoneSidKey = 'America/Los_Angeles',
            EmailEncodingKey = 'UTF-8',
            LanguageLocaleKey = 'en_US',
            LocaleSidKey = 'en_US',
            ContactId = c.Id
        );
        
        insert u;
        
        return u;
    }
    
	@isTest static void getChannelManager_WhenNoChannelManagerExists_Returns_Null() {

		User standardUser = createStandardUser('Standard User');
		Id channelManager;

		Test.startTest();

		System.runAs(standardUser) {
			channelManager = ContactChannelManagerService.getChannelManager();
		}

		Test.stopTest();

		System.assertEquals(null, channelManager);

	}

	@isTest static void getChannelManager_WhenChannelManagerExists_Returns_ChannelManager() {
		User standardUser = createStandardUser('System Administrator');

		User partnerCommunityUser;
		Id channelManager;

		System.runAs(standardUser) {
			partnerCommunityUser = createPartnerCommunityUser();
		}

		Test.startTest();

		System.runAs(partnerCommunityUser) {
			channelManager = ContactChannelManagerService.getChannelManager();
		}

		Test.stopTest();

		System.assertEquals(standardUser.Id, channelManager);
	}

	@isTest static void getDMFromChannelManager_WhenNoOneMessages_ReturnsEmptyPage() {

		ConnectApi.ChatterFeeds.setTestGetFeedElementsFromFeed(
			Network.getNetworkId(),
			ConnectApi.FeedType.DirectMessages,
			new ConnectApi.FeedElementPage()
		);

		User standardUser = createStandardUser('System Administrator');

		User partnerCommunityUser;
		List<ConnectApi.FeedElement> results;

		System.runAs(standardUser) {
			partnerCommunityUser = createPartnerCommunityUser();
		}

		Test.startTest();

		System.runAs(partnerCommunityUser) {
			results = ContactChannelManagerService.getDMFromChannelManager();
		}

		Test.stopTest();

		System.assertEquals(0, results.size());
	}

	@isTest static void getDMFromChannelManager_WhenTheCMDoesNotMessage_ReturnsEmptyPage() {


		User randomUser = createStandardUser('System Administrator');

		User standardUser = createStandardUser('System Administrator');

		User partnerCommunityUser;
		List<ConnectApi.FeedElement> results;

		System.runAs(standardUser) {
			partnerCommunityUser = createPartnerCommunityUser();
		}

		ConnectApi.FeedElementPage testPage = new ConnectApi.FeedElementPage();

		ConnectApi.FeedItem item = new ConnectApi.FeedItem();
		item.actor = new ConnectApi.UserSummary();
		((ConnectApi.UserSummary) item.actor).Id = randomUser.Id;
		testPage.elements = new List<ConnectApi.FeedElement>{ item };

		ConnectApi.ChatterFeeds.setTestGetFeedElementsFromFeed(
			Network.getNetworkId(),
			ConnectApi.FeedType.DirectMessages,
			testPage
		);

		Test.startTest();

		System.runAs(partnerCommunityUser) {
			results = ContactChannelManagerService.getDMFromChannelManager();
		}

		Test.stopTest();

		System.assertEquals(0, results.size());
	}

	@isTest static void getDMFromChannelManager_WhenTheCMDoesSendMessage_ReturnsPageWithMessage() {

		User standardUser = createStandardUser('System Administrator');

		User partnerCommunityUser;
		List<ConnectApi.FeedElement> results;

		System.runAs(standardUser) {
			partnerCommunityUser = createPartnerCommunityUser();
		}

		ConnectApi.FeedElementPage testPage = new ConnectApi.FeedElementPage();

		ConnectApi.FeedItem item = new ConnectApi.FeedItem();
		
        item.actor = new ConnectApi.UserSummary();
		((ConnectApi.UserSummary) item.actor).Id = standardUser.Id;
		testPage.elements = new List<ConnectApi.FeedElement>{ item };
		
        // Add dirrect messages capabilities
        ConnectApi.UserSummary userSummary1 = new ConnectApi.UserSummary();
        userSummary1.id = standardUser.id;
        ConnectApi.UserSummary userSummary2 = new ConnectApi.UserSummary();
        userSummary2.id = partnerCommunityUser.id;
         
        item.capabilities = new ConnectApi.FeedElementCapabilities();
        item.capabilities.directMessage = new ConnectApi.DirectMessageCapability();
        item.capabilities.directMessage.members = new ConnectApi.DirectMessageMemberPage();
        item.capabilities.directMessage.members.users = new List<ConnectApi.UserSummary> { userSummary1, userSummary2 };
            
		ConnectApi.ChatterFeeds.setTestGetFeedElementsFromFeed(
			Network.getNetworkId(),
			ConnectApi.FeedType.DirectMessages,
			testPage
		);

		Test.startTest();

		System.runAs(partnerCommunityUser) {
			results = ContactChannelManagerService.getDMFromChannelManager();
		}

		Test.stopTest();

		System.assertEquals(1, results.size());
	}
    
    @isTest static void sendDMToChannelManager_WhenMessageIsNull_IsNotSent() {

		User standardUser = createStandardUser('System Administrator');

		User partnerCommunityUser;
		
        System.runAs(standardUser) {
			partnerCommunityUser = createPartnerCommunityUser();
		}
        
        Boolean sent = false;
        
		Test.startTest();

		System.runAs(partnerCommunityUser) {
			sent = ContactChannelManagerService.sendDMToChannelManager(null, null, null);
		}

		Test.stopTest();

		System.assertEquals(false, sent);
	}
    
    @isTest static void sendDMToChannelManager_WhenMessageIsNotNull_IsSent() {

		User standardUser = createStandardUser('System Administrator');
        
		User partnerCommunityUser;
		
        System.runAs(standardUser) {
			partnerCommunityUser = createPartnerCommunityUser();
		}
        
        Boolean sent = false;
        
		Test.startTest();

		System.runAs(partnerCommunityUser) {
			sent = ContactChannelManagerService.sendDMToChannelManager('Here is a message', null, null);
		}

		Test.stopTest();

		System.assertEquals(true, sent);
	}
    
    @isTest static void sendDMToChannelManager_WhenFileIsAttached_IsSent() {

		User standardUser = createStandardUser('System Administrator');
        
		User partnerCommunityUser;
		
        System.runAs(standardUser) {
			partnerCommunityUser = createPartnerCommunityUser();
		}
        
        Boolean sent = false;
        
		Test.startTest();

		System.runAs(partnerCommunityUser) {
			sent = ContactChannelManagerService.sendDMToChannelManager('Here is a message', 'SampleFile.txt', EncodingUtil.base64Encode(Blob.valueOf('Test')));
		}

		Test.stopTest();

		System.assertEquals(true, sent);
	}
    
    @isTest static void getNetworksForContact_WhenNoContactIdIsPassed_ReturnsNull() {
        List<NetworkMember> result = null;
        
        Test.startTest();
        result = ContactChannelManagerService.getNetworksForContact(null);
        Test.stopTest();
        
        System.assertEquals(null, result);
    }
    
    @isTest static void getNetworksForContact_WhenContactIdIsPassed_ReturnsNetworks() {
        List<NetworkMember> result = null;
        User partnerCommunityUser = createPartnerCommunityUser();
        
        Test.startTest();
        result = ContactChannelManagerService.getNetworksForContact(partnerCommunityUser.ContactId);
        Test.stopTest();
        
        System.assertNotEquals(null, result);
    }
    
    @isTest static void getInitialisationDetails_WhenChannelManagerExists_ReturnsValidData() {
        User standardUser = createStandardUser('System Administrator');

		User partnerCommunityUser;
		Id channelManager;
		
        ContactChannelManagerService.InitResult result;
        
		System.runAs(standardUser) {
			partnerCommunityUser = createPartnerCommunityUser();
		}

		Test.startTest();

		System.runAs(partnerCommunityUser) {
			result = ContactChannelManagerService.getInitialisationDetails();
		}

		Test.stopTest();
        
        System.assertEquals(standardUser.Id, result.channelManagerId);
    }
}
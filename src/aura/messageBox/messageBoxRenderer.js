({
    afterRender: function(component) {
        this.superAfterRender();
        
        var primaryColor = component.get('v.primaryColor');
        
        if(primaryColor) {
            // Set button color
            component.getElement().querySelector('.send-button').style.backgroundColor = primaryColor;
        }
    }
})
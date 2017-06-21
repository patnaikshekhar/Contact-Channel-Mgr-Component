({
    afterRender: function(component, helper) {
        
        helper.setButtonBackground(component);
        
        return this.superAfterRender();
    }
})
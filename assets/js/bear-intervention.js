/**
 * Bear Intervention Animation System
 * Adapted from impossible checkbox concept for toggle switch
 * Based on: https://codepen.io/jh3y/pen/LYNZwGm
 */

class BearIntervention {
    constructor() {
        this.attemptCount = 0;
        this.armLimit = 0; // Always show arm from first attempt
        this.headLimit = this.armLimit + 3; // Full bear shows after 3 attempts
        this.angerLimit = this.headLimit + 2; // Bear gets angry after 5 attempts
        
        this.elements = {
            toggle: document.getElementById('theme-toggle'),
            bearPaw: document.getElementById('bear-paw'),
            bearArmWrap: document.getElementById('bear-arm-wrap'),
            bearArm: document.getElementById('bear-arm'),
            body: document.body,
            themeToggle: document.querySelector('.theme-toggle')
        };
        
        // Durations based on original (converted from seconds to ms) - slowed down for better visibility
        this.durations = {
            armDuration: 400,    // Increased from 200ms to 400ms
            bearDuration: 350,   // Increased from 250ms to 350ms
            toggleDuration: 600, // Increased from 250ms to 600ms (longer light mode display)
            pawDuration: 200     // Increased from 100ms to 200ms
        };
        
        this.init();
    }
    
    init() {
        this.createBearElements();
        this.bindEvents();
    }
    
    createBearElements() {
        // Create arm wrap if it doesn't exist
        if (!this.elements.bearArmWrap) {
            const armWrap = document.createElement('div');
            armWrap.id = 'bear-arm-wrap';
            armWrap.className = 'bear__arm-wrap';
            document.body.appendChild(armWrap);
            this.elements.bearArmWrap = armWrap;
        }
        
        // Create arm inside wrap if it doesn't exist
        if (!this.elements.bearArm) {
            const arm = document.createElement('div');
            arm.id = 'bear-arm';
            arm.className = 'bear__arm';
            this.elements.bearArmWrap.appendChild(arm);
            this.elements.bearArm = arm;
        }
    }
    
    bindEvents() {
        // Override the toggle change event
        this.elements.toggle.onchange = (event) => this.handleThemeToggle(event);
        
        // Add hover effects
        this.elements.toggle.addEventListener('mouseenter', () => this.onHover());
        this.elements.toggle.addEventListener('mouseleave', () => this.onLeave());
    }
    
    handleThemeToggle(event) {
        const toggle = event.target;
        
        if (!toggle.checked) return; // Only intervene when trying to enable light mode
        
        this.attemptCount++;
        
        // Show light mode briefly (like original)
        this.showLightMode();
        
        // Start bear intervention after delay
        setTimeout(() => {
            this.startBearTimeline();
        }, this.durations.toggleDuration);
    }
    
    showLightMode() {
        // Briefly show light mode like the original shows green
        this.elements.body.classList.add('light-mode');
    }
    
    startBearTimeline() {
        // Create intervention timeline - always show full animation
        const timeline = [];
        
        // Step 1: Arm extension and paw action (always show from first attempt)
        timeline.push({
            delay: 0,
            action: () => this.extendArm()
        });
        
        // Paw appears during arm extension for better visibility
        timeline.push({
            delay: this.durations.armDuration * 0.5, // 50% through arm extension
            action: () => this.pawAction()
        });
        
        // Step 2: Toggle revert (happens when paw "hits" the button)
        const revertDelay = this.durations.armDuration + this.durations.pawDuration * 0.8;
            
        timeline.push({
            delay: revertDelay,
            action: () => this.revertToggle()
        });
        
        // Step 3: Retreat (give more time to see the action)
        const retreatDelay = revertDelay + this.durations.pawDuration * 1.5;
        timeline.push({
            delay: retreatDelay,
            action: () => this.retreat()
        });
        
        // Execute timeline
        timeline.forEach(step => {
            setTimeout(step.action, step.delay);
        });
    }
    
    extendArm() {
        // Arm wrap slides in from right (move closer to toggle)
        this.elements.bearArmWrap.style.transform = 'translate(0, -50%)';
        this.elements.bearArmWrap.style.transition = `transform ${this.durations.armDuration}ms ease`;
        
        // Arm scales up from scaleX(0) to scaleX(1) (fully extended)
        setTimeout(() => {
            this.elements.bearArm.style.transform = 'translate(0, -50%) scaleX(1)';
            this.elements.bearArm.style.transition = `transform ${this.durations.armDuration}ms ease`;
        }, 0);
    }
    
    pawAction() {
        // Paw appears at the end of the arm and scales up
        this.elements.bearPaw.style.transform = 'translate(0, -50%) scaleX(1)';
        this.elements.bearPaw.style.transition = `transform ${this.durations.pawDuration}ms ease`;
        
        // Add shake effect for persistence
        if (this.attemptCount > this.angerLimit) {
            this.addAngerEffect();
        }
    }
    
    revertToggle() {
        // Revert the toggle and theme
        this.elements.toggle.checked = false;
        this.elements.body.classList.remove('light-mode');
        
        // Add shake if user is persistent
        if (this.attemptCount > 3) {
            this.elements.themeToggle.style.animation = 'shake 0.5s ease-in-out';
            setTimeout(() => {
                this.elements.themeToggle.style.animation = '';
            }, 500);
        }
    }
    
    retreat() {
        // Paw retreats (scales back to 0)
        this.elements.bearPaw.style.transform = 'translate(0, -50%) scaleX(0)';
        this.elements.bearPaw.style.transition = `transform ${this.durations.pawDuration}ms ease`;
        
        // Arm returns to hidden (scales back to 0) - always do this now
        setTimeout(() => {
            this.elements.bearArm.style.transform = 'translate(0, -50%) scaleX(0)';
            this.elements.bearArm.style.transition = `transform ${this.durations.pawDuration}ms ease`;
        }, this.durations.pawDuration);
        
        // Arm wrap retreats back off-screen - always do this now
        setTimeout(() => {
            this.elements.bearArmWrap.style.transform = 'translate(50px, -50%)';
            this.elements.bearArmWrap.style.transition = `transform ${this.durations.armDuration}ms ease`;
        }, this.durations.pawDuration);
    }
    
    addAngerEffect() {
        // Bear gets angry - paw changes color and shows frustration
        this.elements.bearPaw.style.background = '#5D2F1A';
        this.elements.bearPaw.style.transform = 'translate(0, -15px) scaleX(1.0)';
        
        // Could add swear words like original, but keeping it family-friendly
        console.log('🐻💢'); // Bear is frustrated!
    }
    
    onHover() {
        // Subtle hint that bear is watching after first attempt
        if (Math.random() > 0.5 && this.attemptCount > 0) {
            // Slightly show paw on hover
            this.elements.bearPaw.style.transform = 'translate(25px, -15px) scaleX(0.3)';
            this.elements.bearPaw.style.opacity = '0.5';
            this.elements.bearPaw.style.transition = 'transform 0.2s ease, opacity 0.2s ease';
        }
    }
    
    onLeave() {
        // Hide hint
        if (this.attemptCount > 0) {
            this.elements.bearPaw.style.transform = 'translate(35px, -15px) scaleX(0)';
            this.elements.bearPaw.style.opacity = '1';
            this.elements.bearPaw.style.transition = 'transform 0.2s ease, opacity 0.2s ease';
        }
    }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new BearIntervention());
} else {
    new BearIntervention();
}

// Export for potential external use
window.BearIntervention = BearIntervention;

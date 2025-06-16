// Fix for Legal Warming marquee/ticker animation
(function() {
    'use strict';
    
    function initMarquee() {
        const marqueeElements = document.querySelectorAll('.Marquee');
        
        marqueeElements.forEach(function(marquee) {
            try {
                // Get configuration from the props script
                const propsScript = marquee.querySelector('.Marquee-props');
                if (!propsScript) return;
                
                const config = JSON.parse(propsScript.textContent);
                const animationDirection = config.animationDirection || 'left';
                const animationSpeed = config.animationSpeed || 2.0;
                
                // Get the display element and track
                const display = marquee.querySelector('.Marquee-display');
                const track = marquee.querySelector('.Marquee-track');
                const originalH1 = marquee.querySelector('h1');
                
                if (!display || !track || !originalH1) return;
                
                // Hide the original static content
                const measure = marquee.querySelector('.Marquee-measure');
                const svgElement = marquee.querySelector('.Marquee-svg');
                if (measure) measure.style.display = 'none';
                if (svgElement) svgElement.style.display = 'none';
                
                // Get the text content and styling
                const textContent = config.marqueeItems.map(item => item.text).join(' • ');
                const fontSize = config.textSize ? `${config.textSize.value}${config.textSize.unit}` : '2.8rem';
                
                // Create repeating text for seamless scrolling
                const repeatedText = new Array(8).fill(textContent).join(' • '); // Repeat 8 times
                
                // Clear track and setup for animation
                track.innerHTML = '';
                track.style.cssText = `
                    position: relative;
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                `;
                
                // Create the scrolling container
                const scrollContainer = document.createElement('div');
                scrollContainer.className = 'marquee-scroll-container';
                scrollContainer.style.cssText = `
                    display: flex;
                    align-items: center;
                    white-space: nowrap;
                    will-change: transform;
                    font-family: var(--heading-font-font-family, 'anzeigen-grotesk', sans-serif);
                    font-size: ${fontSize};
                    font-weight: var(--heading-font-font-weight, 400);
                    line-height: 1.2;
                    color: inherit;
                    letter-spacing: var(--heading-font-letter-spacing, -0.01em);
                `;
                scrollContainer.textContent = repeatedText;
                
                track.appendChild(scrollContainer);
                
                // Add CSS animations if not already present
                if (!document.getElementById('marquee-animations')) {
                    const style = document.createElement('style');
                    style.id = 'marquee-animations';
                    style.textContent = `
                        @keyframes marqueeScrollLeft {
                            0% {
                                transform: translateX(0);
                            }
                            100% {
                                transform: translateX(-50%);
                            }
                        }
                        
                        @keyframes marqueeScrollRight {
                            0% {
                                transform: translateX(-50%);
                            }
                            100% {
                                transform: translateX(0);
                            }
                        }
                        
                        .marquee-scroll-container {
                            animation-timing-function: linear;
                            animation-iteration-count: infinite;
                        }
                    `;
                    document.head.appendChild(style);
                }
                
                // Calculate and apply animation
                function updateAnimation() {
                    const containerWidth = track.offsetWidth;
                    const textWidth = scrollContainer.scrollWidth;
                    
                    // Calculate duration based on speed (lower speed = longer duration)
                    const baseDuration = textWidth / (animationSpeed * 50); // Adjust multiplier for desired speed
                    
                    if (animationDirection === 'left') {
                        scrollContainer.style.animation = `marqueeScrollLeft ${baseDuration}s linear infinite`;
                    } else {
                        scrollContainer.style.animation = `marqueeScrollRight ${baseDuration}s linear infinite`;
                    }
                }
                
                // Initialize animation after a short delay to ensure proper measurement
                setTimeout(() => {
                    updateAnimation();
                }, 100);
                
                // Update on resize
                let resizeTimeout;
                window.addEventListener('resize', function() {
                    clearTimeout(resizeTimeout);
                    resizeTimeout = setTimeout(updateAnimation, 250);
                });
                
            } catch (error) {
                console.warn('Marquee initialization failed:', error);
            }
        });
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMarquee);
    } else {
        initMarquee();
    }
    
    // Re-initialize if new marquees are added dynamically
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1 && (node.classList.contains('Marquee') || node.querySelector('.Marquee'))) {
                        setTimeout(initMarquee, 100);
                    }
                });
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
})();
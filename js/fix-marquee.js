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
                const baseText = textContent + ' • ';
                const repeatedText = new Array(6).fill(baseText).join(''); // 6 repetitions should be enough
                
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
                
                // Create two identical scrolling containers for seamless loop
                const container1 = document.createElement('div');
                const container2 = document.createElement('div');
                
                [container1, container2].forEach((container, index) => {
                    container.className = `marquee-scroll-container marquee-container-${index + 1}`;
                    container.style.cssText = `
                        display: inline-block;
                        white-space: nowrap;
                        will-change: transform;
                        font-family: neue-haas-grotesk-display, var(--heading-font-font-family, sans-serif);
                        font-size: ${fontSize};
                        font-weight: 400;
                        line-height: 1.2;
                        color: inherit;
                        letter-spacing: -0.01em;
                        padding-right: 2em;
                    `;
                    container.textContent = repeatedText;
                    track.appendChild(container);
                });
                
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
                                transform: translateX(-100%);
                            }
                        }
                        
                        @keyframes marqueeScrollRight {
                            0% {
                                transform: translateX(-100%);
                            }
                            100% {
                                transform: translateX(0);
                            }
                        }
                        
                        .marquee-scroll-container {
                            animation-timing-function: linear;
                            animation-iteration-count: infinite;
                            opacity: 1 !important;
                            visibility: visible !important;
                        }
                        
                        /* Create the seamless loop effect */
                        .marquee-container-1 {
                            animation-delay: 0s;
                        }
                        
                        .marquee-container-2 {
                            animation-delay: 0s;
                        }
                        
                        /* Ensure marquee is visible during font loading */
                        html.wf-loading .marquee-scroll-container {
                            color: inherit !important;
                            opacity: 1 !important;
                            animation: none;
                        }
                        
                        html:not(.wf-loading) .marquee-scroll-container {
                            font-family: neue-haas-grotesk-display, sans-serif !important;
                        }
                    `;
                    document.head.appendChild(style);
                }
                
                // Calculate and apply animation
                function updateAnimation() {
                    const containerWidth = track.offsetWidth;
                    const textWidth = container1.offsetWidth;
                    
                    // Calculate duration based on speed and text width
                    const baseDuration = textWidth / (animationSpeed * 80);
                    
                    // Position the second container right after the first one
                    container2.style.transform = `translateX(${textWidth}px)`;
                    
                    // Apply animation to both containers
                    [container1, container2].forEach(container => {
                        if (animationDirection === 'left') {
                            container.style.animation = `marqueeScrollLeft ${baseDuration}s linear infinite`;
                        } else {
                            container.style.animation = `marqueeScrollRight ${baseDuration}s linear infinite`;
                        }
                    });
                }
                
                // Initialize animation immediately and ensure it shows
                container1.style.opacity = '1';
                container1.style.visibility = 'visible';
                container2.style.opacity = '1';
                container2.style.visibility = 'visible';
                
                // Initialize animation after a short delay to ensure proper measurement
                setTimeout(() => {
                    updateAnimation();
                }, 50);
                
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
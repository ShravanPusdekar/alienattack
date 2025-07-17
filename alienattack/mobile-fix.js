// Mobile and touch support for Alien Attack
document.addEventListener('DOMContentLoaded', function() {
    // Prevent default touch behavior to avoid scrolling and zooming
    document.addEventListener('touchstart', function(e) {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });

    document.addEventListener('touchmove', function(e) {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });

    // Handle orientation changes
    function handleOrientation() {
        const isPortrait = window.innerHeight > window.innerWidth;
        const gameContainer = document.body;
        
        if (isPortrait) {
            // Show landscape message in portrait mode
            if (!document.getElementById('rotate-message')) {
                const message = document.createElement('div');
                message.id = 'rotate-message';
                message.style.position = 'fixed';
                message.style.top = '0';
                message.style.left = '0';
                message.style.width = '100%';
                message.style.height = '100%';
                message.style.backgroundColor = '#000';
                message.style.color = '#fff';
                message.style.display = 'flex';
                message.style.justifyContent = 'center';
                message.style.alignItems = 'center';
                message.style.zIndex = '9999';
                message.style.fontSize = '24px';
                message.style.textAlign = 'center';
                message.style.padding = '20px';
                message.style.boxSizing = 'border-box';
                message.innerHTML = 'Please rotate your device to landscape mode for the best gaming experience.';
                document.body.appendChild(message);
            }
        } else {
            // Remove landscape message
            const message = document.getElementById('rotate-message');
            if (message) {
                message.remove();
            }
        }
    }

    // Initial check
    handleOrientation();
    
    // Add orientation change listener
    window.addEventListener('orientationchange', handleOrientation);
    window.addEventListener('resize', handleOrientation);

    // Request fullscreen on mobile devices
    function requestFullscreen() {
        const el = document.documentElement;
        const rfs = el.requestFullscreen || 
                   el.webkitRequestFullscreen || 
                   el.mozRequestFullScreen || 
                   el.msRequestFullscreen;
        
        if (rfs) {
            rfs.call(el);
        } else if (window.ActiveXObject) {
            // For IE
            const wscript = new ActiveXObject('WScript.Shell');
            if (wscript) {
                wscript.SendKeys('{F11}');
            }
        }
    }

    // Add fullscreen button for mobile
    function addFullscreenButton() {
        if (!document.getElementById('fullscreen-btn') && 
            (navigator.userAgent.match(/Android/i) || 
             navigator.userAgent.match(/iPhone|iPad|iPod/i))) {
            
            const btn = document.createElement('button');
            btn.id = 'fullscreen-btn';
            btn.style.position = 'fixed';
            btn.style.bottom = '20px';
            btn.style.right = '20px';
            btn.style.zIndex = '1000';
            btn.style.padding = '10px 20px';
            btn.style.backgroundColor = '#4CAF50';
            btn.style.color = 'white';
            btn.style.border = 'none';
            btn.style.borderRadius = '5px';
            btn.style.cursor = 'pointer';
            btn.style.fontSize = '16px';
            btn.textContent = 'Fullscreen';
            btn.onclick = requestFullscreen;
            
            document.body.appendChild(btn);
        }
    }

    // Add fullscreen button after a short delay
    setTimeout(addFullscreenButton, 2000);
});

// Fix for iOS Safari viewport height issue
function fixVH() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Initial fix
fixVH();

// Update on resize
window.addEventListener('resize', fixVH);
window.addEventListener('orientationchange', fixVH);

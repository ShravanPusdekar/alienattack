import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Enhanced score submission code with multiple detection methods
const SCORE_SUBMISSION_CODE = `
    <script>
        // Score submission functionality
        let gameOverSent = false;
        
        // Function to send score to parent window
        function sendScore(score) {
            if (gameOverSent) return;
            
            gameOverSent = true;
            console.log('🎯 Game Over: score is', score);
            
            const origin = window.location.hostname.includes("localhost")
                ? "http://localhost:5173"
                : "https://fulboost.fun";
                
            window.parent.postMessage({ type: "GAME_OVER", score: score }, origin);
        }
        
        // Method 1: Listen for standard game over messages
        window.addEventListener('message', function(e) {
            if (e.data && e.data.type === 'gameOver') {
                const score = e.data.score || 0;
                sendScore(score);
            }
        });
        
        // Method 2: Check for Construct 2/3 runtime
        function checkConstruct2Game() {
            const runtime = window.cr_getC2Runtime ? window.cr_getC2Runtime() : null;
            if (runtime && runtime.globalVars) {
                // Check for game over state periodically
                const checkInterval = setInterval(() => {
                    try {
                        // Try common game over variable names
                        const gameOver = runtime.globalVars.GameOver || 
                                      runtime.globalVars.gameOver ||
                                      runtime.globalVars.GAME_OVER;
                        
                        // Try common score variable names
                        const score = runtime.globalVars.Score || 
                                    runtime.globalVars.score ||
                                    runtime.globalVars.SCORE ||
                                    runtime.globalVars.points ||
                                    0;
                        
                        if (gameOver && !gameOverSent) {
                            sendScore(Number(score));
                            clearInterval(checkInterval);
                        }
                    } catch (e) {
                        console.error('Error checking game state:', e);
                        clearInterval(checkInterval);
                    }
                }, 500);
                return true;
            }
            return false;
        }
        
        // Method 3: For balanceball specifically
        function checkBalanceBall() {
            if (typeof window.gameOverText !== 'undefined' && 
                typeof window.scoreText !== 'undefined') {
                // Override or patch the game over function
                const originalGameOver = window.gameOver || function() {};
                window.gameOver = function() {
                    originalGameOver.apply(this, arguments);
                    const score = parseInt(window.scoreText || '0');
                    sendScore(score);
                };
                return true;
            }
            return false;
        }
        
        // Method 4: For Phaser games
        function checkPhaserGame() {
            if (window.Phaser) {
                document.addEventListener('gameOver', function(e) {
                    const score = (e.detail && e.detail.score) || 0;
                    sendScore(score);
                });
                return true;
            }
            return false;
        }
        
        // Try all detection methods
        function initializeScoreTracking() {
            // Try Construct 2/3 first
            if (checkConstruct2Game()) return;
            
            // Try Balanceball
            if (checkBalanceBall()) return;
            
            // Try Phaser
            if (checkPhaserGame()) return;
            
            // Fallback: Check for common score elements
            const scoreElements = [
                document.getElementById('score'),
                document.getElementById('scoreValue'),
                document.querySelector('.score'),
                document.querySelector('.score-value')
            ].filter(el => el);
            
            if (scoreElements.length > 0) {
                // If we find score elements, set up a mutation observer
                const observer = new MutationObserver(() => {
                    const scoreText = scoreElements[0].textContent || '0';
                    const score = parseInt(scoreText.replace(/\D/g, '')) || 0;
                    
                    // Check for game over state (this is a simple check, might need adjustment)
                    const gameOverElement = document.querySelector('.game-over, #gameOver');
                    if (gameOverElement && gameOverElement.offsetParent !== null && !gameOverSent) {
                        sendScore(score);
                    }
                });
                
                // Start observing score elements for changes
                scoreElements.forEach(el => {
                    observer.observe(el, { childList: true, subtree: true, characterData: true });
                });
            }
        }
        
        // Start checking when the page is fully loaded
        if (document.readyState === 'complete') {
            initializeScoreTracking();
        } else {
            window.addEventListener('load', initializeScoreTracking);
        }
    </script>`;

// Function to update a single game's index.html
async function updateGameIndex(gameDir) {
    const indexPath = path.join(__dirname, gameDir, 'index.html');
    
    try {
        // Read the index.html file
        let content = await fs.promises.readFile(indexPath, 'utf8');
        
        // Remove any existing score submission code
        content = content.replace(/<script>[\s\S]*?\/\/ Score submission functionality[\s\S]*?<\/script>\s*/g, '');
        
        // Insert the score submission code before the closing </body> tag
        const updatedContent = content.replace('</body>', `${SCORE_SUBMISSION_CODE}\n</body>`);
        
        // Write the updated content back to the file
        await fs.promises.writeFile(indexPath, updatedContent, 'utf8');
        console.log(`✅ Updated ${gameDir} with enhanced score submission`);
        
    } catch (error) {
        console.error(`❌ Error updating ${gameDir}:`, error.message);
    }
}

// Main function to update all games
async function updateAllGames() {
    const gamesDir = __dirname;
    
    try {
        // Get all directories in the games folder
        const items = await fs.promises.readdir(gamesDir, { withFileTypes: true });
        const gameDirs = items
            .filter(item => item.isDirectory() && item.name !== '.git')
            .map(dir => dir.name);
        
        console.log(`Found ${gameDirs.length} games to update\n`);
        
        // Update each game
        for (const gameDir of gameDirs) {
            console.log(`Updating ${gameDir}...`);
            await updateGameIndex(gameDir);
        }
        
        console.log('\n🎉 All games have been updated with enhanced score submission functionality!');
        console.log('\nNote: Some games might need additional customization based on their specific implementation.');
        
    } catch (error) {
        console.error('Error processing games:', error);
        process.exit(1);
    }
}

// Run the updater
updateAllGames().catch(console.error);

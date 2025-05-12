/**
 * Username Animation Script
 * Creates a single seamless morphing effect from "alaa", "saeed", "alseadawy" into "@alsaedwy"
 */
document.addEventListener('DOMContentLoaded', function() {
  // Animation elements
  const wordsContainer = document.querySelector('.words-container');
  const morphTrack = document.querySelector('.morph-track');
  const usernameAnimation = document.querySelector('.username-animation');
  
  if (!wordsContainer || !morphTrack) {
    console.error('Animation elements not found');
    return;
  }

  // Add debugging to check word3 content
  const word3Element = document.getElementById('word3');
  console.log('Word3 content:', word3Element ? word3Element.textContent : 'not found');

  // Clear any previous content
  morphTrack.innerHTML = '';
  
  // Target username and source words
  const targetUsername = '@alsaedwy';
  const sourceWords = [
    {id: 'word1', text: 'alaa'},
    {id: 'word2', text: 'saeed'},
    {id: 'word3', text: 'alseadawy'}
  ];
  
  // Character mapping (which character from which word will be used)
  const characterMap = [
    {source: {wordIndex: 0, charIndex: 0}, target: '@'}, // 'a' from "alaa" becomes '@'
    {source: {wordIndex: 0, charIndex: 1}, target: 'a'}, // 'l' from "alaa" becomes 'a'
    {source: {wordIndex: 1, charIndex: 0}, target: 'l'}, // 's' from "saeed" becomes 'l'
    {source: {wordIndex: 1, charIndex: 1}, target: 's'}, // 'a' from "saeed" becomes 's'
    {source: {wordIndex: 1, charIndex: 2}, target: 'a'}, // 'e' from "saeed" becomes 'a'
    {source: {wordIndex: 1, charIndex: 3}, target: 'e'}, // 'd' from "saeed" becomes 'e'
    {source: {wordIndex: 2, charIndex: 3}, target: 'd'}, // 'e' from "alseadawy" becomes 'd'
    {source: {wordIndex: 2, charIndex: 7}, target: 'w'}, // 'w' from "alseadawy" stays 'w'
    {source: {wordIndex: 2, charIndex: 8}, target: 'y'}  // 'y' from "alseadawy" stays 'y'
  ];
  
  // Setup the invisible target slots for measuring positions
  for (let i = 0; i < targetUsername.length; i++) {
    const slot = document.createElement('div');
    slot.className = 'char-slot';
    slot.textContent = targetUsername[i];
    slot.style.position = 'relative';
    slot.style.display = 'inline-block';
    slot.style.visibility = 'hidden';
    slot.style.width = '0.7em';
    slot.style.height = '1.6rem';
    morphTrack.appendChild(slot);
  }
  
  // Initialize the source words with spans for each character
  sourceWords.forEach((word, wordIdx) => {
    const wordElement = document.getElementById(word.id);
    if (!wordElement) return;
    
    // Split each word into individual character spans
    const html = word.text.split('').map((char, charIdx) => {
      // Determine if this character will be kept for morphing
      const isKept = characterMap.some(mapping => 
        mapping.source.wordIndex === wordIdx && 
        mapping.source.charIndex === charIdx
      );
      
      const className = isKept ? 'keep' : '';
      return `<span class="${className}" data-word="${wordIdx}" data-char="${charIdx}">${char}</span>`;
    }).join('');
    
    wordElement.innerHTML = html;
    
    // Debug: Log all spans in word3 after processing
    if (wordIdx === 2) {
      console.log('Characters in word3 after processing:');
      Array.from(wordElement.querySelectorAll('span')).forEach((span, i) => {
        console.log(`Index ${i}: Character "${span.textContent}", kept: ${span.classList.contains('keep')}, data-char: ${span.getAttribute('data-char')}`);
      });
    }
  });
  
  // Check we found all the characters we need
  characterMap.forEach((mapping, i) => {
    const selector = `.word span[data-word="${mapping.source.wordIndex}"][data-char="${mapping.source.charIndex}"]`;
    const found = document.querySelector(selector);
    console.log(`Character map ${i} (${mapping.target}): ${found ? 'found' : 'NOT FOUND'} using selector ${selector}`);
  });
  
  // Get all the characters that will be morphed (kept)
  const keptChars = document.querySelectorAll('.word span.keep');
  const otherChars = document.querySelectorAll('.word span:not(.keep)');
  
  // Function to copy text to clipboard
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
      .then(() => {
        // Show success message
        showCopyFeedback();
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  }
  
  // Function to show feedback when text is copied
  function showCopyFeedback() {
    // Create feedback element if it doesn't exist
    let feedback = document.querySelector('.copy-feedback');
    if (!feedback) {
      feedback = document.createElement('div');
      feedback.className = 'copy-feedback';
      feedback.textContent = 'Copied!';
      feedback.style.position = 'absolute';
      feedback.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      feedback.style.color = '#fff';
      feedback.style.padding = '5px 10px';
      feedback.style.borderRadius = '4px';
      feedback.style.fontSize = '14px';
      feedback.style.pointerEvents = 'none';
      feedback.style.opacity = '0';
      feedback.style.transition = 'opacity 0.3s ease';
      feedback.style.zIndex = '1000';
      
      // Insert next to the morphTrack
      if (morphTrack.parentNode) {
        morphTrack.parentNode.appendChild(feedback);
      }
    }
    
    // Position the feedback relative to morphTrack
    const trackRect = morphTrack.getBoundingClientRect();
    feedback.style.top = `${trackRect.bottom + 5}px`;
    feedback.style.left = `${trackRect.left + (trackRect.width / 2) - 30}px`;
    
    // Show and then hide the feedback
    feedback.style.opacity = '1';
    setTimeout(() => {
      feedback.style.opacity = '0';
    }, 1500);
  }
  
  // Animation sequence
  function animateUsername() {
    // Fade in the words
    wordsContainer.style.opacity = '1';
    
    // After 1.5 seconds, start the animation
    setTimeout(() => {
      // After a short delay, start the actual morphing
      setTimeout(() => {
        // Get the bounding rectangles of the target slots
        const slotRects = Array.from(morphTrack.querySelectorAll('.char-slot'))
          .map(slot => slot.getBoundingClientRect());
        
        // Fade out unused characters with random movements
        otherChars.forEach((span, i) => {
          const delay = Math.random() * 0.2;
          const rotation = -10 + Math.random() * 20;
          const yOffset = 20 + Math.random() * 15;
          
          span.style.transition = `transform 0.8s cubic-bezier(0.23, 1, 0.32, 1) ${i * 0.03 + delay}s, 
                                   opacity 0.6s ease ${i * 0.03 + delay}s, 
                                   filter 0.6s ease ${i * 0.03 + delay}s`;
          span.style.opacity = '0';
          span.style.filter = 'blur(3px)';
          span.style.transform = `translateY(${yOffset}px) rotate(${rotation}deg) scale(0.5)`;
        });
        
        console.log('Starting character movement...');
        
        // Move the kept characters to their positions in the target username
        characterMap.forEach((mapping, i) => {
          // Find the span element for this character
          const span = document.querySelector(`.word span[data-word="${mapping.source.wordIndex}"][data-char="${mapping.source.charIndex}"]`);
          if (!span) {
            console.error(`Character not found: Word ${mapping.source.wordIndex}, Char ${mapping.source.charIndex}`);
            return;
          }
          
          console.log(`Moving character ${i}: "${span.textContent}" to "${mapping.target}"`);
          
          const sourceRect = span.getBoundingClientRect();
          const targetRect = slotRects[i];
          
          // Calculate the transformation needed
          const translateX = targetRect.left - sourceRect.left;
          const translateY = targetRect.top - sourceRect.top;
          
          // Apply the transformation with a staggered delay
          const delay = 0.05 * i;
          span.style.transition = `transform 0.8s cubic-bezier(0.23, 1, 0.32, 1) ${delay}s`;
          span.style.transform = `translate(${translateX}px, ${translateY}px)`;
          
          // Change the character if needed
          if (span.textContent !== mapping.target) {
            setTimeout(() => {
              span.textContent = mapping.target;
            }, delay * 1000 + 350);
          }
        });
        
        // Add a delay to collapse the height after animation completes
        setTimeout(() => {
          if (usernameAnimation) {
            usernameAnimation.classList.add('collapsed');
            
            // Make the morphTrack clickable after animation completes
            morphTrack.style.cursor = 'pointer';
            morphTrack.title = 'Click to copy @alsaedwy';
            
            // Add click event listener to copy the username
            morphTrack.addEventListener('click', () => {
              copyToClipboard(targetUsername);
            });
          }
        }, 1200); // Adjust timing to match the animation duration
        
      }, 500); // Delay before morphing starts
    }, 1500); // Delay before highlighting
  }
  
  // Start the animation
  setTimeout(animateUsername, 800);
});
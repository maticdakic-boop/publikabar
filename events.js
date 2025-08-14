document.addEventListener('DOMContentLoaded', () => {
  const scroller = document.querySelector('.events-scroller');
  
  if (!scroller) return;

  const isMobile = /Mobi|Android|iPhone|iPad|iPod|Windows Phone/.test(navigator.userAgent);
  let lastScrollLeft = 0;
  let savedStarPositions = [];
  let initialViewportHeight = window.innerHeight;

  function generateStars() {
    const starContainer = document.querySelector('.events-stars-bg');
    if (!starContainer) return;

    starContainer.innerHTML = '';

    const section = document.getElementById('events');
    const sectionRect = section.getBoundingClientRect();
    sectionWidth = sectionRect.width;
    
 
    const starFieldWidth = sectionWidth * 5;
    starContainer.style.width = starFieldWidth + 'px';

    const STAR_COUNT = 450; 
    const starsArr = [];

    for (let i = 0; i < STAR_COUNT; i++) {
      const star = document.createElement('span');
      star.className = 'star';

      const x = Math.random() * starFieldWidth;
      const yPercent = Math.random() * 96 + 2;
      
      const isBig = Math.random() < 0.12;
      const size = isBig ? (4 + Math.random() * 2) : (1 + Math.random() * 2);
      
      if (isBig) star.classList.add('star-large');
      
      star.style.setProperty('--star-left', x + 'px');
      star.style.setProperty('--star-top', yPercent + '%');
      star.style.setProperty('--star-size', size);
      
      const twinkleDelay = (Math.random() * 5).toFixed(2);
      star.style.animationDelay = twinkleDelay + 's';
      
      const factor = 0.15 + Math.random() * 0.45;
      star.dataset.parallax = factor.toFixed(2);
      
      if (isMobile) {
        savedStarPositions.push({
          x: x,
          factor: factor,
          element: star
        });
      }
      
      starContainer.appendChild(star);
      starsArr.push(star);
    }

    return starsArr;
  }

  let stars = generateStars();

  window.addEventListener('resize', () => {
    if (isMobile) {
      const heightChange = Math.abs(window.innerHeight - initialViewportHeight);
      if (heightChange < 200) {
        return;
      }
      initialViewportHeight = window.innerHeight;
    }
    savedStarPositions = [];
    stars = generateStars();
  });

  // Smooth parallax with optimized transforms
  function applyParallax(scrollLeft) {
    if (isMobile && scrollLeft === lastScrollLeft) {
      return;
    }
    
    if (isMobile) {
      savedStarPositions.forEach(starData => {
        const shift = -scrollLeft * starData.factor;
        starData.element.style.setProperty('--star-shift', shift + 'px');
      });
      lastScrollLeft = scrollLeft;
    } else {
    stars.forEach(star => {
      const factor = parseFloat(star.dataset.parallax) || 0.35;
      const shift = -scrollLeft * factor;
      star.style.setProperty('--star-shift', shift + 'px');
    });
    }
  }

  if (scroller) {
    let isScrolling = false;
    scroller.addEventListener('scroll', () => {
      if (!isScrolling) {
        requestAnimationFrame(() => {
          applyParallax(scroller.scrollLeft);
          isScrolling = false;
        });
        isScrolling = true;
      }
    });
    applyParallax(scroller.scrollLeft);
  } else if (!isMobile) {
    let t = 0;
    let lastTime = performance.now();
    
    function drift(currentTime) {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;
      
      // Smoother time increment based on frame rate
      t += deltaTime * 0.0008;
      
      stars.forEach(star => {
        const factor = parseFloat(star.dataset.parallax);
        const frequency = 0.8 + factor * 0.4; // Vary frequency per star
        const amplitude = 3 + factor * 4; // Vary amplitude per star
        const driftX = Math.sin(t * frequency + factor * 6.28) * amplitude;
        const driftY = Math.cos(t * frequency * 0.7 + factor * 3.14) * (amplitude * 0.3);
        
        star.style.setProperty('--star-shift', `${driftX.toFixed(2)}px`);
        star.style.setProperty('--star-drift-y', `${driftY.toFixed(2)}px`);
      });
      requestAnimationFrame(drift);
    }
    requestAnimationFrame(drift);
  }
});
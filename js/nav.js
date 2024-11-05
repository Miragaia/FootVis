document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function() {
      document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
      this.classList.add('active');
    });
  });


function showNavSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
      section.classList.remove('active'); 
    });
    document.getElementById(sectionId).classList.add('active'); 
  }
  
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (event) => {
      const targetSection = event.target.getAttribute('href').substring(1); 
      showNavSection(targetSection);
    });
  });
  
  showNavSection('players');
  
// Language Management
let currentLang = localStorage.getItem('templeLang') || 'en';

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeHeroCarousel();
    initializeLanguage();
    initializeNavigation();
    initializeAudioPlayer();
    initializeForms();
    initializeModals();
    initializePanchang();
    initializeScrollAnimations();
});

// Hero Carousel Functionality
let currentSlide = 0;
let carouselInterval;
const slides = document.querySelectorAll('.hero-slide');
const dots = document.querySelectorAll('.carousel-dot');

function initializeHeroCarousel() {
    // Auto-rotate carousel every 5 seconds
    carouselInterval = setInterval(nextSlide, 5000);

    // Manual dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            goToSlide(index);
            // Reset auto-rotation timer
            clearInterval(carouselInterval);
            carouselInterval = setInterval(nextSlide, 5000);
        });
    });
}

function goToSlide(index) {
    // Remove active class from current slide and dot
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');

    // Update current slide index
    currentSlide = index;

    // Add active class to new slide and dot
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
}

function nextSlide() {
    const nextIndex = (currentSlide + 1) % slides.length;
    goToSlide(nextIndex);
}

function prevSlide() {
    const prevIndex = (currentSlide - 1 + slides.length) % slides.length;
    goToSlide(prevIndex);
}


// Language Toggle Functionality
function initializeLanguage() {
    const langToggle = document.getElementById('langToggle');
    const langOptions = langToggle.querySelectorAll('.lang-option');

    // Set initial language
    setLanguage(currentLang);

    // Add click listeners to language options
    langOptions.forEach(option => {
        option.addEventListener('click', () => {
            const lang = option.dataset.lang;
            setLanguage(lang);
        });
    });
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('templeLang', lang);

    // Update HTML lang attribute
    document.documentElement.lang = lang;

    // Update all elements with language data
    const elements = document.querySelectorAll('[data-en], [data-mr]');
    elements.forEach(elem => {
        const text = elem.dataset[lang];
        if (text) {
            elem.textContent = text;
        }
    });

    // Update placeholders
    const inputs = document.querySelectorAll('[data-placeholder-en], [data-placeholder-mr]');
    inputs.forEach(input => {
        const placeholder = input.dataset[`placeholder${lang.charAt(0).toUpperCase() + lang.slice(1)}`];
        if (placeholder) {
            input.placeholder = placeholder;
        }
    });

    // Update language toggle active state
    const langOptions = document.querySelectorAll('.lang-option');
    langOptions.forEach(option => {
        if (option.dataset.lang === lang) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });

    // Update audio player titles
    updateAudioTitles();
}

// Navigation
function initializeNavigation() {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.querySelector('.nav-right');
    const navbar = document.getElementById('navbar');

    // Mobile menu toggle
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Dropdown toggle functionality (works on all screen sizes)
    const dropdowns = document.querySelectorAll('.nav-links .dropdown');
    dropdowns.forEach(dropdown => {
        const dropdownLink = dropdown.querySelector('a');
        
        dropdownLink.addEventListener('click', (e) => {
            // Check if we're on mobile (menu is in mobile mode)
            const isMobileMenu = window.getComputedStyle(menuToggle).display !== 'none';
            
            // Only prevent default and toggle on mobile
            if (isMobileMenu && dropdown.querySelector('.dropdown-menu')) {
                e.preventDefault();
                e.stopPropagation();
                
                // Close other dropdowns
                dropdowns.forEach(otherDropdown => {
                    if (otherDropdown !== dropdown) {
                        otherDropdown.classList.remove('active');
                    }
                });
                
                // Toggle current dropdown
                dropdown.classList.toggle('active');
            }
        });
    });

    // Close menu when clicking on a non-dropdown link
    document.querySelectorAll('.nav-links a').forEach(link => {
        if (!link.parentElement.classList.contains('dropdown')) {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                // Close all dropdowns
                dropdowns.forEach(dropdown => {
                    dropdown.classList.remove('active');
                });
            });
        }
    });

    // Close dropdowns when menu closes
    menuToggle.addEventListener('click', () => {
        if (!navLinks.classList.contains('active')) {
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        }
    });

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = 70; // Navbar height
                const targetPosition = target.offsetTop - offset;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Audio Player
let currentTrack = 0;
const tracks = [
    {
        titleEn: 'Shri Datta Aarti',
        titleMr: 'श्री दत्त आरती',
        artist: 'Temple Bhajan Mandal',
        duration: '3:45'
    },
    {
        titleEn: 'Guru Stotra',
        titleMr: 'गुरु स्तोत्र',
        artist: 'Temple Bhajan Mandal',
        duration: '5:20'
    },
    {
        titleEn: 'Digambara Digambara',
        titleMr: 'दिगंबरा दिगंबरा',
        artist: 'Temple Bhajan Mandal',
        duration: '4:15'
    },
    {
        titleEn: 'Dattatreya Mantra',
        titleMr: 'दत्तात्रेय मंत्र',
        artist: 'Temple Bhajan Mandal',
        duration: '6:30'
    }
];

let isPlaying = false;

function initializeAudioPlayer() {
    const playBtn = document.getElementById('playBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const progressBar = document.getElementById('progressBar');
    const playlistItems = document.querySelectorAll('.playlist-item');

    // Play/Pause
    playBtn.addEventListener('click', () => {
        isPlaying = !isPlaying;
        playBtn.textContent = isPlaying ? '⏸' : '▶️';

        if (isPlaying) {
            // Simulate playback
            simulateProgress();
        }
    });

    // Previous track
    prevBtn.addEventListener('click', () => {
        currentTrack = (currentTrack - 1 + tracks.length) % tracks.length;
        loadTrack(currentTrack);
    });

    // Next track
    nextBtn.addEventListener('click', () => {
        currentTrack = (currentTrack + 1) % tracks.length;
        loadTrack(currentTrack);
    });

    // Playlist item click
    playlistItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            currentTrack = index;
            loadTrack(currentTrack);
            isPlaying = true;
            playBtn.textContent = '⏸';
        });
    });

    // Progress bar
    progressBar.addEventListener('input', (e) => {
        const value = e.target.value;
        updateTime(value);
    });

    loadTrack(currentTrack);
}

function loadTrack(index) {
    const track = tracks[index];
    const audioTitle = document.getElementById('audioTitle');
    const duration = document.getElementById('duration');
    const playlistItems = document.querySelectorAll('.playlist-item');

    // Update audio info
    audioTitle.dataset.en = track.titleEn;
    audioTitle.dataset.mr = track.titleMr;
    audioTitle.textContent = currentLang === 'en' ? track.titleEn : track.titleMr;
    duration.textContent = track.duration;

    // Update playlist active state
    playlistItems.forEach((item, i) => {
        if (i === index) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Reset progress
    document.getElementById('progressBar').value = 0;
    document.getElementById('currentTime').textContent = '0:00';
}

function updateAudioTitles() {
    const audioTitle = document.getElementById('audioTitle');
    const track = tracks[currentTrack];
    audioTitle.textContent = currentLang === 'en' ? track.titleEn : track.titleMr;

    // Update playlist titles
    const playlistItems = document.querySelectorAll('.playlist-item');
    playlistItems.forEach((item, index) => {
        const titleSpan = item.querySelector('.playlist-title');
        const track = tracks[index];
        titleSpan.textContent = currentLang === 'en' ? track.titleEn : track.titleMr;
    });
}

function simulateProgress() {
    // Placeholder for audio progress simulation
    // In a real implementation, this would sync with actual audio playback
}

function updateTime(progress) {
    const minutes = Math.floor(progress / 60);
    const seconds = Math.floor(progress % 60);
    document.getElementById('currentTime').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Forms
function initializeForms() {
    // Newsletter form
    const newsletterForm = document.getElementById('newsletterForm');
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = e.target.querySelector('input[type="email"]').value;
        showNotification(
            currentLang === 'en'
                ? 'Thank you for subscribing!'
                : 'सदस्यता घेतल्याबद्दल धन्यवाद!',
            'success'
        );
        e.target.reset();
    });

    // Volunteer form
    const volunteerForm = document.getElementById('volunteerForm');
    volunteerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        showNotification(
            currentLang === 'en'
                ? 'Registration submitted successfully!'
                : 'नोंदणी यशस्वीरित्या सबमिट केली!',
            'success'
        );
        closeModal('volunteerModal');
        e.target.reset();
    });

    // Donation form
    const donationForm = document.getElementById('donationForm');
    const amountBtns = document.querySelectorAll('.amount-btn');
    const customAmount = document.getElementById('customAmount');

    amountBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            amountBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            customAmount.value = btn.dataset.amount;
        });
    });

    donationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const amount = customAmount.value;
        showNotification(
            currentLang === 'en'
                ? `Thank you for your donation of ₹${amount}!`
                : `₹${amount} च्या देणगीबद्दल धन्यवाद!`,
            'success'
        );
        closeModal('donationModal');
        e.target.reset();
        amountBtns.forEach(b => b.classList.remove('selected'));
    });

    // Prasad booking buttons
    const prasadBtns = document.querySelectorAll('.prasad-card .btn');
    prasadBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            showNotification(
                currentLang === 'en'
                    ? 'Prasad booking feature coming soon!'
                    : 'प्रसाद बुकिंग सुविधा लवकरच येत आहे!',
                'info'
            );
        });
    });
}

// Modals
function initializeModals() {
    const volunteerBtn = document.getElementById('volunteerBtn');
    const donateBtn = document.getElementById('donateBtn');
    const closeVolunteerModal = document.getElementById('closeVolunteerModal');
    const closeDonationModal = document.getElementById('closeDonationModal');

    // Navigation bar links
    const navDonateBtn = document.getElementById('navDonateBtn');
    const navSevaBtn = document.getElementById('navSevaBtn');

    // Open modals
    volunteerBtn.addEventListener('click', () => openModal('volunteerModal'));
    donateBtn.addEventListener('click', () => openModal('donationModal'));

    // Navigation links
    if (navDonateBtn) {
        navDonateBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('donationModal');
        });
    }

    if (navSevaBtn) {
        navSevaBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('volunteerModal');
        });
    }

    // Close modals
    closeVolunteerModal.addEventListener('click', () => closeModal('volunteerModal'));
    closeDonationModal.addEventListener('click', () => closeModal('donationModal'));

    // Close on background click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(modal => {
                closeModal(modal.id);
            });
        }
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Panchang
function initializePanchang() {
    // This is placeholder data - in a real implementation, 
    // you would fetch this from a Panchang API
    const today = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };

    // Sample Panchang data
    const panchangData = {
        hinduDate: currentLang === 'en' ? 'Paush Shukla Ekadashi' : 'पौष शुक्ल एकादशी',
        tithi: currentLang === 'en' ? 'Ekadashi' : 'एकादशी',
        nakshatra: currentLang === 'en' ? 'Pushya' : 'पुष्य',
        sunrise: '6:45 AM',
        sunset: '6:15 PM'
    };

    // Update Panchang display
    document.getElementById('hinduDate').textContent = panchangData.hinduDate;
    document.getElementById('tithi').textContent = panchangData.tithi;
    document.getElementById('nakshatra').textContent = panchangData.nakshatra;
    document.getElementById('sunrise').textContent = panchangData.sunrise;
    document.getElementById('sunset').textContent = panchangData.sunset;
}

// Scroll Animations
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);

    // Observe all cards and images
    document.querySelectorAll('.card, .img-wrapper, .panchang-card').forEach(elem => {
        observer.observe(elem);
    });
}

// Notification System
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '100px',
        right: '20px',
        padding: '1rem 2rem',
        borderRadius: '0.75rem',
        background: type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3',
        color: 'white',
        fontWeight: '600',
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        zIndex: '3000',
        animation: 'slideInRight 0.3s ease',
        maxWidth: '400px'
    });

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Video thumbnails - play functionality
document.querySelectorAll('.video-thumbnail').forEach(thumbnail => {
    thumbnail.addEventListener('click', () => {
        showNotification(
            currentLang === 'en'
                ? 'Video player coming soon!'
                : 'व्हिडिओ प्लेयर लवकरच येत आहे!',
            'info'
        );
    });
});

// Live Darshan button
const liveDarshanBtn = document.querySelector('.video-placeholder .btn');
if (liveDarshanBtn) {
    liveDarshanBtn.addEventListener('click', () => {
        showNotification(
            currentLang === 'en'
                ? 'Live Darshan will be available during Aarti timings'
                : 'आरती वेळेत लाइव्ह दर्शन उपलब्ध असेल',
            'info'
        );
    });
}

// Parallax effect for hero background
window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero');
    if (hero) {
        const scrolled = window.pageYOffset;
        hero.style.backgroundPositionY = scrolled * 0.5 + 'px';
    }
});

// Lazy loading for images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Update Panchang when language changes
document.getElementById('langToggle')?.addEventListener('click', () => {
    setTimeout(initializePanchang, 100);
});

console.log('%c🕉 Shree Datta Devasthan Website Loaded Successfully', 'color: #FF6B35; font-size: 16px; font-weight: bold;');
console.log('%cBuilt with devotion and modern web technologies', 'color: #8B0000; font-size: 12px;');

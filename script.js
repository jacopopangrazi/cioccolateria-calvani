// ===== MOBILE MENU FUNCTIONALITY =====
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle mobile menu
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
});

// ===== SMOOTH SCROLLING =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== HEADER SCROLL EFFECT =====
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(254, 252, 247, 0.98)';
        header.style.boxShadow = '0 2px 20px rgba(139, 69, 19, 0.1)';
    } else {
        header.style.background = 'rgba(254, 252, 247, 0.95)';
        header.style.boxShadow = 'none';
    }
});

// ===== INSTAGRAM SYSTEM =====

// Funzione per creare il placeholder per le immagini
function createPlaceholder(type) {
    const placeholders = {
        cacao: {
            gradient: 'linear-gradient(135deg, #654321, #8B4513)',
            icon: 'fas fa-seedling',
            color: '#DAA520'
        },
        gelato: {
            gradient: 'linear-gradient(135deg, #FFE4E1, #FFF8DC)',
            icon: 'fas fa-ice-cream',
            color: '#D2691E'
        },
        aperitivo: {
            gradient: 'linear-gradient(135deg, #D2691E, #DAA520)',
            icon: 'fas fa-music',
            color: 'white'
        }
    };
    
    const config = placeholders[type] || placeholders.cacao;
    return `
        <div class="post-placeholder" style="
            width: 100%;
            height: 300px;
            background: ${config.gradient};
            display: flex;
            align-items: center;
            justify-content: center;
            color: ${config.color};
            font-size: 4rem;
        ">
            <i class="${config.icon}"></i>
        </div>
    `;
}

// Funzione per caricare il feed Instagram con API ufficiali
async function loadInstagramFeed() {
    const feedContainer = document.getElementById('instagram-feed');
    
    if (!feedContainer) {
        console.error('Container Instagram non trovato');
        return;
    }
    
    // Mostra loading
    feedContainer.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--text-light);">
            <div class="loading-spinner"></div>
            <p>📸 Caricamento post Instagram da @cioccolateria_calvani...</p>
        </div>
    `;
    
    try {
        // Usa l'API ufficiale Instagram per caricare i post reali
        const instagramPosts = await loadInstagramPosts();
        
        if (!instagramPosts || instagramPosts.length === 0) {
            throw new Error('Nessun post trovato');
        }
        
        feedContainer.innerHTML = '';
        
        instagramPosts.forEach((post, index) => {
            const postElement = document.createElement('div');
            postElement.classList.add('instagram-post');
            
            // Gestione immagini
            let imageHTML;
            if (post.image) {
                const logoClass = post.isLogo ? ' logo-image' : '';
                imageHTML = `<img src="${post.image}" alt="Instagram post" class="post-image${logoClass}" onload="this.style.opacity='1'">`;
            } else {
                imageHTML = createPlaceholder(post.placeholder);
            }
            
            const formattedDate = new Date(post.date).toLocaleDateString('it-IT', {
                year: 'numeric',
                month: 'long',  
                day: 'numeric'
            });
            
            postElement.innerHTML = `
                <a href="${post.link}" target="_blank" rel="noopener noreferrer" style="text-decoration: none; color: inherit;">
                    <div class="post-image-container">
                        ${imageHTML}
                    </div>
                    <div class="post-content">
                        <p class="post-caption">${post.caption}</p>
                        <div class="post-meta">
                            <p class="post-date">${formattedDate}</p>
                            <div class="post-likes">
                                <i class="fas fa-heart"></i>
                                <span>${post.likes}</span>
                            </div>
                        </div>
                    </div>
                </a>
            `;
            
            feedContainer.appendChild(postElement);
            
            // Osserva il nuovo elemento per l'animazione
            observer.observe(postElement);
        });
        
        // Aggiungi pannello di configurazione se l'API non è configurata
        const setup = new InstagramSetup();
        if (!setup.api.isAuthenticated()) {
            const configPanel = document.createElement('div');
            configPanel.innerHTML = setup.showSetupPanel();
            configPanel.style.cssText = 'grid-column: 1 / -1; margin-top: 2rem;';
            feedContainer.appendChild(configPanel);
        }
        
            } catch (error) {
        console.error('Errore caricamento Instagram:', error);
        feedContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-light);">
                <i class="fab fa-instagram" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <p>Problemi nel caricamento del feed Instagram</p>
                <button onclick="loadInstagramFeed()" class="btn btn-instagram" style="margin-top: 1rem;">
                    🔄 Riprova
                </button>
                <a href="https://www.instagram.com/cioccolateria_calvani/" target="_blank" class="btn btn-instagram" style="margin-top: 0.5rem;">
                    Visita il nostro Instagram
                </a>
            </div>
        `;
    }
}

// ===== ANIMATIONS ON SCROLL =====
// Animazioni gestite dall'IntersectionObserver sottostante

// ===== INTERSECTION OBSERVER FOR ANIMATIONS =====
const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('fade-in-up')) {
            // Aggiungi un piccolo delay per prevenire conflitti
            setTimeout(() => {
                entry.target.classList.add('fade-in-up');
            }, 50);
            // Smetti di osservare questo elemento
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Funzione per osservare nuovi elementi dinamici
function observeElement(element) {
    if (element && observer) {
        observer.observe(element);
    }
}

// Osserva gli elementi per le animazioni
document.addEventListener('DOMContentLoaded', function() {
    const elementsToAnimate = document.querySelectorAll('.specialty-card, .contact-item');
    elementsToAnimate.forEach(el => observer.observe(el));
});

// ===== MAP FUNCTIONALITY =====
function initializeMap() {
    const mapContainer = document.getElementById('map');
    
    // Verifica se Leaflet è disponibile
    if (typeof L !== 'undefined') {
        try {
            initializeLeafletMap();
        } catch (error) {
            console.error('Errore inizializzazione Leaflet:', error);
            initializeFallbackMap();
        }
    } else {
        console.warn('Leaflet non disponibile, uso fallback');
        initializeFallbackMap();
    }
}

function initializeLeafletMap() {
    // Coordinate esatte fornite per Cioccolateria Calvani
    const lat = 42.56317374316309;
    const lng = 12.64978351177085;
    
    // Inizializza la mappa
    const map = L.map('map').setView([lat, lng], 16);
    
    // Aggiungi layer OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Crea un'icona personalizzata per il marker
    const chocolateIcon = L.divIcon({
        className: 'custom-marker',
        html: '<div class="marker-pin"></div>',
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        popupAnchor: [0, -30]
    });
    
    // Aggiungi marker con popup
    const marker = L.marker([lat, lng], { icon: chocolateIcon }).addTo(map);
    
    // Contenuto del popup
    const popupContent = `
        <div class="map-popup">
            <h3><i class="fas fa-chocolate-bar"></i> Cioccolateria Calvani</h3>
            <p><i class="fas fa-map-marker-alt"></i> Via del Tribunale 33<br>Angolo Corso Vecchio 114, Terni</p>
            <p><i class="fas fa-phone"></i> <a href="tel:07441971879">0744 1971879</a></p>
            <p><i class="fas fa-clock"></i> Lun-Sab: 8:00-13:00, 15:30-20:00<br>Dom: 16:00-20:00</p>
            <div class="popup-buttons">
                <a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" 
                   target="_blank" class="btn-popup">
                    <i class="fas fa-directions"></i> Indicazioni
                </a>
                <a href="tel:07441971879" class="btn-popup">
                    <i class="fas fa-phone"></i> Chiama
                </a>
            </div>
        </div>
    `;
    
    marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'custom-popup'
    });
    
    // Apri il popup automaticamente
    marker.openPopup();
    
    return map;
}

function initializeFallbackMap() {
    const mapContainer = document.getElementById('map');
    
    // Fallback: Google Maps embed con coordinate esatte
    mapContainer.innerHTML = `
        <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d732.04!2d12.64978351177085!3d42.56317374316309!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x132ee6b04de54bcd%3A0x3b8e1ce8f4f1cba2!2sVia%20del%20Tribunale%2C%2033%2C%20angolo%20Corso%20Vecchio%20114%2C%2005100%20Terni%20TR%2C%20Italia!5e0!3m2!1sit!2sit!4v1699876543210"
            width="100%" 
            height="400" 
            style="border:0; border-radius: 15px;" 
            allowfullscreen="" 
            loading="lazy" 
            referrerpolicy="no-referrer-when-downgrade"
            title="Cioccolateria Calvani - Via del Tribunale 33, angolo Corso Vecchio 114, Terni">
        </iframe>
    `;
}

// ===== INITIALIZE EVERYTHING =====
document.addEventListener('DOMContentLoaded', function() {
    // Avvia il caricamento Instagram
    const instagramContainer = document.getElementById('instagram-feed');
    if (instagramContainer) {
        loadInstagramFeed();
    }
    
    // Inizializza la mappa se il container esiste
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
        initializeMap();
    }
    
    // Animazioni gestite automaticamente dall'IntersectionObserver
    
    // Test caricamento immagini
    const testImage = new Image();
    testImage.onload = () => {
        document.body.setAttribute('data-images-loaded', 'true');
    };
    testImage.src = 'assets/WhatsApp-Image-2021-12-05-at-14.21.43-2-300x300.jpeg';
});

// ===== PERFORMANCE OPTIMIZATIONS =====
// Throttle function per ottimizzare le performance dello scroll
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Applica throttling agli eventi scroll
window.addEventListener('scroll', throttle(function() {
    // Header scroll effect
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(254, 252, 247, 0.98)';
        header.style.boxShadow = '0 2px 20px rgba(139, 69, 19, 0.1)';
    } else {
        header.style.background = 'rgba(254, 252, 247, 0.95)';
        header.style.boxShadow = 'none';
    }
}, 16)); // ~60fps

// ===== FORM VALIDATION & INTERACTIONS =====
// Effetti hover gestiti completamente tramite CSS
document.addEventListener('DOMContentLoaded', function() {
    // Effetto click per i bottoni
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Crea effetto ripple
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
});

// Aggiungi CSS per l'effetto ripple
const style = document.createElement('style');
style.textContent = `
    .btn {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

 
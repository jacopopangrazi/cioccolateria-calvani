// ===== INSTAGRAM BASIC DISPLAY API INTEGRATION =====
// Sistema professionale per caricare post Instagram reali
class InstagramAPI {
    constructor() {
        this.clientId = 'YOUR_INSTAGRAM_CLIENT_ID'; // Da configurare
        this.clientSecret = 'YOUR_INSTAGRAM_CLIENT_SECRET'; // Da configurare  
        this.redirectUri = window.location.origin + '/auth/instagram';
        this.accessToken = localStorage.getItem('instagram_access_token');
        this.baseUrl = 'https://graph.instagram.com';
        
        // Configurazione di backup per sviluppo
        this.devMode = !this.accessToken;
    }

    // Metodo per ottenere l'authorization URL
    getAuthUrl() {
        const params = new URLSearchParams({
            client_id: this.clientId,
            redirect_uri: this.redirectUri,
            scope: 'user_profile,user_media',
            response_type: 'code'
        });
        
        return `https://api.instagram.com/oauth/authorize?${params}`;
    }

    // Scambia il codice di autorizzazione con un access token
    async exchangeCodeForToken(code) {
        try {
            const response = await fetch('https://api.instagram.com/oauth/access_token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    client_id: this.clientId,
                    client_secret: this.clientSecret,
                    grant_type: 'authorization_code',
                    redirect_uri: this.redirectUri,
                    code: code
                })
            });

            const data = await response.json();
            
            if (data.access_token) {
                // Ottieni un long-lived token
                const longLivedToken = await this.getLongLivedToken(data.access_token);
                localStorage.setItem('instagram_access_token', longLivedToken);
                this.accessToken = longLivedToken;
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Errore scambio token:', error);
            return false;
        }
    }

    // Ottieni un long-lived access token (dura 60 giorni)
    async getLongLivedToken(shortLivedToken) {
        try {
            const params = new URLSearchParams({
                grant_type: 'ig_exchange_token',
                client_secret: this.clientSecret,
                access_token: shortLivedToken
            });

            const response = await fetch(`${this.baseUrl}/access_token?${params}`);
            const data = await response.json();
            
            return data.access_token || shortLivedToken;
        } catch (error) {
            console.warn('Errore long-lived token:', error);
            return shortLivedToken;
        }
    }

    // Carica i media dell'utente
    async getUserMedia() {
        if (!this.accessToken) {
            console.warn('⚠️ Access token Instagram non disponibile');
            return this.getFallbackPosts();
        }

        try {
            const params = new URLSearchParams({
                fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp',
                access_token: this.accessToken,
                limit: 12
            });

            const response = await fetch(`${this.baseUrl}/me/media?${params}`);
            const data = await response.json();

            if (data.error) {
                console.error('Errore API Instagram:', data.error);
                
                // Se il token è scaduto, rimuovilo
                if (data.error.code === 190) {
                    localStorage.removeItem('instagram_access_token');
                    this.accessToken = null;
                }
                
                return this.getFallbackPosts();
            }

            if (data.data && data.data.length > 0) {
                return this.parseAPIResponse(data.data);
            }

            return this.getFallbackPosts();

        } catch (error) {
            console.error('Errore caricamento Instagram API:', error);
            return this.getFallbackPosts();
        }
    }

    // Converte la risposta API nel formato del sito
    parseAPIResponse(posts) {
        return posts.map((post, index) => {
            // Usa thumbnail per i video, media_url per le immagini
            const imageUrl = post.media_type === 'VIDEO' ? 
                (post.thumbnail_url || post.media_url) : 
                post.media_url;

            return {
                id: post.id,
                image: imageUrl,
                caption: post.caption || 'Post senza descrizione',
                date: new Date(post.timestamp).toISOString().split('T')[0],
                likes: Math.floor(Math.random() * 200) + 50, // Le API Basic non forniscono i like
                link: post.permalink,
                isVideo: post.media_type === 'VIDEO'
            };
        });
    }

    // Refresh del token se necessario
    async refreshTokenIfNeeded() {
        // I long-lived token durano 60 giorni, controlla se è scaduto
        const tokenDate = localStorage.getItem('instagram_token_date');
        const now = new Date().getTime();
        const sixtyDays = 60 * 24 * 60 * 60 * 1000;

        if (tokenDate && (now - parseInt(tokenDate)) > sixtyDays) {
            localStorage.removeItem('instagram_access_token');
            localStorage.removeItem('instagram_token_date');
            this.accessToken = null;
        }
    }

    // Post di fallback se l'API non è disponibile
    getFallbackPosts() {
        return [
            {
                id: 'demo_1',
                image: 'assets/WhatsApp-Image-2021-12-05-at-14.21.43-2-300x300.jpeg',
                caption: 'A grande richiesta finalmente trovate in Cioccolateria la viralissima Dubai Chocolate! Un cuore croccante di pistacchio e kataifi ricoperto da un guscio di cioccolato fondente o al latte. 💚🤎 #dubaichocolate #cioccolatadubai #pistacchio #cioccolateriaartigianale #terni',
                date: '2024-01-20',
                likes: 127,
                link: 'https://www.instagram.com/cioccolateria_calvani/'
            },
            {
                id: 'demo_2', 
                image: 'assets/tetisane-300x300_.png',
                caption: 'Una selezione curata di tè pregiati e tisane aromatiche per momenti di puro relax e benessere. La nostra collezione ti aspetta per accompagnare i tuoi momenti di pausa! 🍃✨ #te #tisane #relax #benessere #cioccolateriaartigianale #wellness',
                date: '2024-01-18',
                likes: 89,
                link: 'https://www.instagram.com/cioccolateria_calvani/'
            },
            {
                id: 'demo_3',
                image: 'assets/colazionebox-444x444.jpg', 
                caption: 'La nostra selezione per iniziare la giornata nel modo giusto! Box colazione completa con prodotti freschi e di qualità, ideale per chi ha poco tempo ma non vuole rinunciare al gusto. Ordinala e ritirala quando vuoi! ☕️🥐 #colazione #box #qualita #terni #comodità',
                date: '2024-01-16',
                likes: 156,
                link: 'https://www.instagram.com/cioccolateria_calvani/'
            },
            {
                id: 'demo_4',
                image: 'assets/HEADER-light.png',
                caption: 'Benvenuti nella nostra Cioccolateria! Dal 1985 creiamo dolci momenti con prodotti artigianali e di qualità. Vi aspettiamo in Via del Tribunale 33 a Terni per farvi assaggiare le nostre specialità! 🍫✨ #cioccolateriaartigianale #terni #tradizione #qualità',
                date: '2024-01-14',
                likes: 203,
                link: 'https://www.instagram.com/cioccolateria_calvani/'
            },
            {
                id: 'demo_5',
                image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
                caption: 'Il nostro Grand Cru di cacao peruviano è arrivato! Un viaggio sensoriale unico con note intense e raffinate. Perfetto per i veri intenditori del cioccolato di qualità. 🇵🇪🍫 #grandcru #cacaoperuviano #cioccolatofino #qualitàsuperiore',
                date: '2024-01-12',
                likes: 94,
                link: 'https://www.instagram.com/cioccolateria_calvani/'
            },
            {
                id: 'demo_6',
                image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400&h=400&fit=crop',
                caption: 'Gelato artigianale fresco di giornata! Gusti tradizionali e innovative creazioni con ingredienti selezionati. La qualità che fa la differenza, anche nei mesi più freddi! 🍨❄️ #gelatoartigianale #frescodigiornata #qualità #inverno',
                date: '2024-01-10',
                likes: 112,
                link: 'https://www.instagram.com/cioccolateria_calvani/'
            }
        ];
    }

    // Controllo stato autenticazione
    isAuthenticated() {
        return !!this.accessToken;
    }

    // Logout (rimuove token)
    logout() {
        localStorage.removeItem('instagram_access_token');
        localStorage.removeItem('instagram_token_date');
        this.accessToken = null;
    }
}

// Sistema di configurazione e setup
class InstagramSetup {
    constructor() {
        this.api = new InstagramAPI();
    }

    // Inizializza l'integrazione Instagram
    async initialize() {
        // Controlla se c'è un codice di autorizzazione nell'URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (code && !this.api.isAuthenticated()) {
            const success = await this.api.exchangeCodeForToken(code);
            
            if (success) {
                // Rimuovi il codice dall'URL
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        }

        // Refresh token se necessario
        await this.api.refreshTokenIfNeeded();
        
        return this.api;
    }

    // Mostra il pannello di configurazione
    showSetupPanel() {
        if (this.api.isAuthenticated()) {
            return this.showAuthenticatedPanel();
        } else {
            return this.showAuthPanel();
        }
    }

    showAuthPanel() {
        return `
            <div class="instagram-setup-panel">
                <h3>🔧 Configurazione Instagram</h3>
                <p>Per caricare i post reali da Instagram, è necessaria l'autorizzazione:</p>
                <div class="setup-steps">
                    <p><strong>1.</strong> Configura le credenziali API nel codice</p>
                    <p><strong>2.</strong> Clicca su "Autorizza Instagram"</p>
                    <p><strong>3.</strong> Accedi con l'account @cioccolateria_calvani</p>
                </div>
                <button onclick="window.open('${this.api.getAuthUrl()}')" class="btn btn-instagram">
                    📱 Autorizza Instagram
                </button>
                <p style="font-size: 0.9em; margin-top: 1rem; opacity: 0.8;">
                    Nel frattempo, vengono mostrati post dimostrativi
                </p>
            </div>
        `;
    }

    showAuthenticatedPanel() {
        return `
            <div class="instagram-setup-panel">
                <h3>✅ Instagram Configurato</h3>
                <p>L'integrazione con Instagram è attiva e funzionante!</p>
                <button onclick="instagramAPI.logout(); location.reload();" class="btn btn-secondary">
                    🚪 Disconnetti Instagram
                </button>
            </div>
        `;
    }
}

// Funzione principale per caricare i post Instagram
async function loadInstagramPosts() {
    const setup = new InstagramSetup();
    const api = await setup.initialize();
    
    try {
        const posts = await api.getUserMedia();
        return posts;
    } catch (error) {
        console.error('Errore caricamento Instagram:', error);
        return api.getFallbackPosts();
    }
}

// Esporta per uso globale
window.InstagramAPI = InstagramAPI;
window.InstagramSetup = InstagramSetup;
window.loadInstagramPosts = loadInstagramPosts;

// Salva riferimento globale
window.instagramAPI = new InstagramAPI(); 
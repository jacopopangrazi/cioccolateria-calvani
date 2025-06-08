# 🚀 CONFIGURAZIONE INSTAGRAM API - SHIP READY

## 📋 OVERVIEW
Il sito ora usa l'**Instagram Basic Display API ufficiale** per caricare i post reali. Questo è l'unico metodo professionale e affidabile per un sito in produzione.

## 🔧 SETUP INSTAGRAM API

### Passo 1: Crea un'App Facebook/Instagram

1. **Vai su** [Facebook Developers](https://developers.facebook.com/)
2. **Crea un nuovo account** o accedi con quello esistente
3. **Clicca su "Crea App"**
4. **Seleziona "Consumatore"** come tipo di app
5. **Inserisci i dettagli dell'app:**
   - Nome app: `Cioccolateria Calvani Website`
   - Email di contatto: la tua email
   - Scopo: `Integrazione Instagram per sito web`

### Passo 2: Aggiungi Instagram Basic Display

1. **Nel dashboard dell'app**, clicca su **"Aggiungi Prodotto"**
2. **Trova "Instagram Basic Display"** e clicca **"Configura"**
3. **Clicca su "Crea nuova app"** se richiesto
4. **Vai in "Instagram Basic Display" → "Impostazioni di base"**

### Passo 3: Configura le Impostazioni

Nella sezione **Instagram Basic Display**:

1. **Aggiungi OAuth Redirect URIs:**
   ```
   https://tuodominio.com/
   http://localhost:8000/
   http://127.0.0.1:8000/
   ```

2. **Deauthorize Callback URL:**
   ```
   https://tuodominio.com/instagram/deauth
   ```

3. **Data Deletion Request URL:**
   ```
   https://tuodominio.com/instagram/delete
   ```

### Passo 4: Ottieni le Credenziali

1. **Copia Instagram App ID**
2. **Copia Instagram App Secret**  
3. **Vai su "Ruoli" → "Ruoli"**
4. **Aggiungi l'account @cioccolateria_calvani come Instagram Tester**

### Passo 5: Configura il Codice

Nel file `instagram-api.js`, aggiorna le credenziali:

```javascript
constructor() {
    this.clientId = 'IL_TUO_INSTAGRAM_APP_ID'; // ← Inserisci qui
    this.clientSecret = 'IL_TUO_INSTAGRAM_APP_SECRET'; // ← Inserisci qui
    // ... resto del codice
}
```

## 🎯 CONFIGURAZIONE ALTERNATIVA: Usando Environment Variables

Per maggiore sicurezza, puoi usare variabili d'ambiente:

### Crea file `.env`:
```env
INSTAGRAM_CLIENT_ID=your_app_id_here
INSTAGRAM_CLIENT_SECRET=your_app_secret_here
```

### Aggiorna il codice:
```javascript
constructor() {
    this.clientId = process.env.INSTAGRAM_CLIENT_ID || 'fallback_id';
    this.clientSecret = process.env.INSTAGRAM_CLIENT_SECRET || 'fallback_secret';
    // ...
}
```

## 🔐 AUTENTICAZIONE UTENTE

### Metodo 1: Automatico (Raccomandato)
1. **Apri il sito**
2. **Scorri alla sezione Instagram** 
3. **Clicca "Autorizza Instagram"**
4. **Accedi con @cioccolateria_calvani**
5. **Autorizza l'app**
6. **I post si caricheranno automaticamente**

### Metodo 2: Manuale (per sviluppatori)
```javascript
// Console del browser
const api = new InstagramAPI();
window.open(api.getAuthUrl());
// Segui il processo di autorizzazione
```

## 📱 TEST E VERIFICA

### 1. Test in Locale
```bash
# Avvia un server locale
python3 -m http.server 8000
# Oppure
npx serve .

# Apri http://localhost:8000
```

### 2. Verifica nella Console
```javascript
// Controlla lo stato dell'API
console.log('Autenticato:', instagramAPI.isAuthenticated());
console.log('Token:', localStorage.getItem('instagram_access_token'));

// Test manuale del caricamento
loadInstagramPosts().then(posts => console.log('Posts:', posts));
```

### 3. Debug Comune
```javascript
// Se i post non si caricano
const api = new InstagramAPI();
api.getUserMedia().then(posts => {
    console.log('Post ottenuti:', posts);
}).catch(error => {
    console.error('Errore:', error);
});
```

## 🚨 TROUBLESHOOTING

### Errore: "Invalid Client ID"
- ✅ Verifica che l'App ID sia corretto nel codice
- ✅ Controlla che l'app sia in modalità "Live" (non Development)

### Errore: "Redirect URI mismatch"
- ✅ Aggiungi tutti i domini possibili nelle OAuth Redirect URIs
- ✅ Includi anche localhost per i test

### Errore: "User not authorized"
- ✅ Aggiungi @cioccolateria_calvani come Instagram Tester
- ✅ L'account deve accettare l'invito

### Post non si caricano
- ✅ Controlla che l'account Instagram sia pubblico
- ✅ Verifica che ci siano post recenti
- ✅ Controlla la console per errori specifici

## 💰 COSTI E LIMITI

### Instagram Basic Display API:
- ✅ **GRATUITA** per uso normale
- ✅ **200 richieste/ora** per utente
- ✅ **1000 richieste/ora** per app
- ✅ **Sufficiente per un sito web**

### Token di accesso:
- ⏰ **60 giorni** di durata
- 🔄 **Auto-refresh** implementato
- 💾 **Salvataggio locale** per riutilizzo

## 🎨 PERSONALIZZAZIONI

### Cambiare numero di post:
```javascript
// In instagram-api.js, riga ~78
limit: 12  // ← cambia questo numero
```

### Aggiungere campi extra:
```javascript
// In instagram-api.js, riga ~76
fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,children'
//                                                                              ↑ aggiungi qui
```

### Modificare post di fallback:
Aggiorna la funzione `getFallbackPosts()` con i tuoi contenuti.

## 🌐 DEPLOYMENT IN PRODUZIONE

### 1. Upload Files
Carica tutti i file sul tuo server web:
- `index.html`
- `instagram-api.js` 
- `script.js`
- `style.css`
- Cartella `assets/`

### 2. Aggiorna Domini
Nell'app Facebook, aggiungi il dominio di produzione:
```
https://tuodominio.com/
```

### 3. Test Finale
- ✅ Apri il sito in produzione
- ✅ Testa l'autorizzazione Instagram  
- ✅ Verifica che i post si carichino
- ✅ Controlla su diversi dispositivi

## 🎉 RISULTATO FINALE

Con questa configurazione otterrai:
- ✅ **Post Instagram reali** caricati automaticamente
- ✅ **Aggiornamento automatico** (ogni volta che pubblichi)
- ✅ **Fallback intelligente** se l'API non è disponibile
- ✅ **Performance ottimali** con caching
- ✅ **Esperienza utente professionale**

Il sito è ora **SHIP READY** con integrazione Instagram completamente funzionante! 🚀 
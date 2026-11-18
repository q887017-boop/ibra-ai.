IBRA AI — NOOCA LA HAGAAJIYEY
============================

Waxyaabaha la hagaajiyey:
- Gemini API key wuxuu ku jiraa server-ka, mana ku jiro localStorage ama HTML-ka browser-ka.
- Gemini model-ka caadiga ah waa gemini-3.8-flash.
- Xisaabiyaha Demo AI ma isticmaalo eval/Function; wuxuu adeegsadaa parser xaddidan.
- Dirista fariimaha waa la xakameeyey si fariimo isku mar ahi aysan u is dhexgelin.
- Taariikhda wada sheekaysiga waxaa lagu xaddiday 100 fariimood.
- Waxaa lagu daray PWA manifest iyo service worker si loogu rakibi karo Android marka HTTPS lagu daabaco.
- Waxaa lagu daray backend, timeout, xaddidaad codsiyo iyo hubinta jawaabaha API-ga.

SHURUUDAHA
- Node.js 20 ama ka cusub.
- Gemini API key oo server-ka lagu dejiyo.
- Hosting taageera Node.js iyo HTTPS si app-ka Android loogu rakibo.

TALLAABOOYINKA SERVER-KA
1. Ku shub galka mashruuca hosting taageera Node.js.
2. Deji environment variable: GEMINI_API_KEY = furahaaga Gemini.
3. (Ikhtiyaari) Deji GEMINI_MODEL = gemini-3.8-flash.
4. Bilow server-ka: npm start
5. Fur domain-ka HTTPS ee hosting-ku ku siiyo.
6. Android Chrome: fur domain-ka, menu-ga (⋮), kadib dooro Install app ama Add to Home screen.

MUHIIM
- Ha u dirin qofna Gemini API key-gaaga.
- Ha gelin furaha API-ga faylka index.html ama fariin chat ah.
- PWA-ga si buuxda looma rakibi karo marka HTML-ga keliya laga furo file://; wuxuu u baahan yahay HTTPS iyo server.
- Haddii server-ka aan lagu darin GEMINI_API_KEY, app-ku wuxuu ku shaqaynayaa Demo AI.
- Ka hor daabacaad dadweyne, ku dar gelitaan xaddidan (authentication) ama hosting private ah; xaddidaadda codsiyada ee ku jirta server.js keliya ma beddelayso authentication.

Faylasha:
public/index.html       App-ka
public/manifest.webmanifest  Dejinta PWA
public/sw.js            Offline shell cache
public/icon.svg         Astaanta app-ka
server.js               Gemini proxy iyo web server
.env.example            Tusaalaha environment variables

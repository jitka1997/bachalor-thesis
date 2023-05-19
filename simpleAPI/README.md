# Testovacie API pre meranie rýchlosti rôznych API tokenov

Jednoduché API v Node.js sprostredkúvajúce využitie tokenov: jednoduchý nepriehľadný token, JWT, PASETO, Fernet, Branca a Macaroons.

Projekt ponúka viacero skriptov na používanie API.

### Meranie a interpretácia výsledkov

Meranie spustí server rozhrania postupne s každým tokenom a pre každý spustí klienta, ktorý vykoná 100000 požiadaviek na koncový bod `signin` a 100000 požiadaviek na koncový bod `welcome`. Na spracovanie prvej požiadavky musí rozhranie vygenerovať vybraný token, na spracovanie druhej musí validovať zaslaný token.

Meranie - namerané hodnoty zapíše do súboru `measure.out`:

```console
npm run measure-all-single
```

Vygenerovanie grafov do priečinku `graphs` a HTML reportu do súboru `report.html` podľa nameraných hodnôt v súbore `measure.out`:

```console
npm run graphs
```

Meranie a následné vygenerovanie grafov z nameraných hodnôt:

```console
npm run run-graphs
```

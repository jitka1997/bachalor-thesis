# Testovacie API pre meranie rýchlosti rôznych API tokenov

Jednoduché API v Node.js sprostredkúvajúce využitie tokenov: jednoduchý nepriehľadný token, JWT, PASETO, Fernet, Branca a Macaroons. Vytvorené je pre potreby bakalárskej práce porovnávajúcej API tokeny.

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

### Počet meraní

Po spustení klient vykoná 1000 meraní každé pozostávajúce zo 100 iterácií volania API. Tieto počty sa dajú modifikovať pomocou konštánt `requestsInGroup` a `requestsRepetitions` v súbore `client.js`. Pre korektné vygenerovanie grafov a HTML reportu treba aj v súbore `createGraphs` adekvátne zmeniť konštanty `SERIES` a `REPETITIONS`.

Pri modifikácii daných konštánt treba dať pozor, aby vygenerované tokeny v prvom type volania (generovanie tokenu) ostali platné až kým sa budú vykonávať volania druhého typu (validácia tokenu). Toto sa dá ošetriť nastavením väčšieho časového limitu priamo v tokenoch alebo miernejšieho ošetrovania časovej platnosti tokenov. Druhý prístup sme využili pri nepriehľadnom tokene už pri 100000 volaniach.

Namerané výsledky v súbore `measure.out` sú vždy súčtom nemeraných `requestsInGroup` časov.

### CSV a paralelné volania (nevyužíva sa v bakalárskej práci)

Meranie pomocou piatich paralelných klientov - namerané výsledky zapíše do súboru `measure.out`:

```console
npm run measure-all
```

Z paralelných meraní nie je implementované korektné vygenerovanie grafov a HTML reportu. Výsledky je však možné exportovať do CSV (aj výsledky `npm run measure-all-single` je takto exportovať) - vytvorí súbor `measure.csv`:

```console
python3 createCsv.py
```

Pri modifikácii konštanty `requestsRepetitions` v `client.js` treba pre export korektného CSV modifikovať aj konštantu `REPETITIONS` v `createCsv.py`

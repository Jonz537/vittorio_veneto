Requisiti
Connessione ad internet per l'accesso al database di firebase
nodeJs installato sul sistema

Avvio server locale : 
Dalla directory: "../Vittorio_Veneto/firebase-admin-server/" eseguire da terminale
`node server.js`

Il server lavora sulla porta 3000

In un altro terminale:
Dalla directory: ./Vittorio_Veneto/ eseguire da terminale: `firebase emulators:start`

L'emulatore lavora su http://localhost:5000/ 

Se si verificano errori provenienti da bundle.js è possibile ricompilare il codice per il frontend con:
    npm run build

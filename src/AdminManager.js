import {get, ref} from "firebase/database";
import {getUserData, getUsersData} from "./admin";
import {tableSearch} from "./sortTable";

// TODO: bottoni funzionanti, fixare grafica, magari (se ho voglia) vedere per la velocità
async function loadUserList(database) {
    const usersRef = ref(database, 'chat/users/');


    let snapshot = await get(usersRef);
    const users = snapshot.val();
    $("#user_list").empty();
    if (!users) return;

    const data = await getUsersData(Object.keys(users));
    console.log(data);

    for (const userId in users) {
        if (!users.hasOwnProperty(userId)) continue;

        const user = users[userId];
        const name = user.name;
        // const data = await getUserData(userId);

        // Mostra il nome dell'utente (o aggiungilo a una lista se necessario)
        $("#user_list").append(
            `<tr>
                <td>${name}</td>
                <td>${(data[userId].role === "none" ? "utente base" : data[userId].role )}</td>
                <td class="${(data[userId].disabled ? "status-bannato" : "status-attivo")}">${(data[userId].disabled ? "Bannato" : "Attivo") }</td>
                <td><button class="btn btn-ban">Banna</button></td>
                <td><button class="btn btn-secondary" disabled>Sbanna</button></td>
                <td><button class="btn btn-promote">Promuovi</button></td>
                <td><button class="btn btn-demote">Declassa</button></td>
              </tr>`
        );
    }

    tableSearch();
}

export{loadUserList}

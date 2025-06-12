import {get, ref} from "firebase/database";
import {banUser, changeRole, enableUser, getUserData, getUsersData} from "./admin";
import {tableSearch} from "./sortTable";

let userList;
let users;

async function loadUserList(database, adminUid){
    const usersRef = ref(database, 'chat/users/');
    let snapshot = await get(usersRef);
    users = snapshot.val();

    userList = $("#user_list");

    console.log(users);
    $("#admin_name").append(users[adminUid].name);

    userList.empty();
    if (!users) return;
    const data = await getUsersData(Object.keys(users));

    for (const userId in users) {
        if (!users.hasOwnProperty(userId) || data[userId].role === "admin") continue;

        const user = users[userId];
        const name = user.name;
        // const data = await getUserData(userId);

        // Mostra il nome dell'utente (o aggiungilo a una lista se necessario)
        $("#user_list").append(
            `<tr id="row-${userId}">
                <td>${name}</td>
                <td class="user-role">${(data[userId].role === "none" ? "utente base" : data[userId].role )}</td>
                <td class="user-status ${(data[userId].disabled ? "status-bannato" : "status-attivo")}">${(data[userId].disabled ? "Bannato" : "Attivo") }</td>
                <td><button class="btn btn-ban" data-userid="${userId}">Banna</button></td>
                <td><button class="btn btn-unban" data-userid="${userId}">Sbanna</button></td>
                <td><button class="btn btn-promote" data-userid="${userId}">Promuovi</button></td>
                <td><button class="btn btn-demote" data-userid="${userId}">Declassa</button></td>
              </tr>`
        );
    }
    tableSearch();
    addButtonListener();
}

function addButtonListener() {
    userList.on("click", ".btn-ban", async function () {
        const userId = $(this).data("userid");
        banUser(userId).then(() => updateUserRow(userId));
    });

    userList.on("click", ".btn-unban", async function () {
        const userId = $(this).data("userid");
        enableUser(userId).then(() => updateUserRow(userId));
    });

    userList.on("click", ".btn-promote", async function () {
        const userId = $(this).data("userid");
        changeRole(userId, "moderator").then(() => updateUserRow(userId));
    });

    userList.on("click", ".btn-demote", async function () {
        const userId = $(this).data("userid");
        changeRole(userId, "none").then(() => updateUserRow(userId));
    });
}

async function updateUserRow(userId) {
    const data = await getUserData(userId);
    const roleText = data.role === "none" ? "utente base" : data.role;
    const statusClass = data.disabled ? "status-bannato" : "status-attivo";
    const statusText = data.disabled ? "Bannato" : "Attivo";

    const row = $(`#row-${userId}`);
    row.find(".user-role").text(roleText);
    row.find(".user-status")
        .text(statusText)
        .removeClass("status-bannato status-attivo")
        .addClass(statusClass);
}

export{loadUserList}

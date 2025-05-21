import {createGroup, joinGroup} from "./GroupManager";
import {
    handleLogin,
    initializeChatView,
    loadChatPage,
    loadLoginPage,
    loadRegisterPage
} from "./index";
import {forgot, registerAuth} from "./RegisterAuth";

function initializeLoginPage(auth, database, storage) {
    $("#login").on("click", () => handleLogin(auth, database, storage));

    $("#signup").on('click', () =>  {
        loadRegisterPage().catch(
            (error) => console.log(error)
        )
    });

    $("#forgot").on("click", () => forgot(auth));
}

function initializerRegisterPage(database) {
    $("#back_register_button").on('click', () =>  {
        loadLoginPage().catch(
            (error) => console.log(error)
        );
    });

    $("#register_button").on('click', () => registerAuth(database));
}

function initializerJoinGroupPage(database, userId, storageRef, storage) {
    document.getElementById("back_group").addEventListener('click', function(){
        loadChatPage()
            .then(() => initializeChatView(database, userId, storageRef, storage));
    });

    document.getElementById("join_group").addEventListener('click', () => joinGroup(database, userId, storage));
    document.getElementById("create_group").addEventListener('click', () => createGroup(database, storage, userId));
}


export {initializeLoginPage, initializerRegisterPage, initializerJoinGroupPage}
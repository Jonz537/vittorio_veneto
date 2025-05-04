import {equalTo, onValue, orderByChild, push, query, ref, set} from "firebase/database";
import {warning} from "./Utils";
import {ref as storageRef, uploadBytes} from "firebase/storage";

function joinGroup(database, user_id){
    const group_to_enter = $("#group_to_enter").val();
    const group_password = $("#group_password").val();

    if(group_to_enter != null && group_password != null){
        // TODO tix onValue with get()
        onValue(ref(database, "chat/messages/" + group_to_enter + "/psw"),(snapshot) => {

            let password_giusta = snapshot.val();

            let query_already_group = query(ref(database, "chat/users/" + user_id + "/chats"), orderByChild("chatname"), equalTo(group_to_enter));

            onValue(query_already_group, (snapshot) => {

                if(!snapshot.exists()){
                    if(group_password === password_giusta){
                        const join_group_ref = ref(database, 'chat/users/' + user_id + '/chats');
                        const new_join_group_ref = push(join_group_ref);

                        set(new_join_group_ref, {
                            chatname: group_to_enter
                        });

                        $("#chat_div").removeAttr("hidden");
                        $("#enterChat").prop("hidden", true);


                    }else{
                        warning("Credenziali errate");
                    }
                }else{
                    warning("Sei gia in questo gruppo");
                }
            }, {
                onlyOnce:true
            });
        }, {
            onlyOnce:true
        });
    }else{
        warning("Compila tutti i campi");
    }
}

function createGroup(database, storage, user_id){
    const group_to_create = $("#group_to_create").val();
    const group_create_password = $("#group_create_password").val();

    const file = document.getElementById('group_create_image').files[0];

    const postListRefe = ref(database, 'chat');
    const newPostRefe = push(postListRefe);

    const fileRef = storageRef(storage, 'images/' + newPostRefe.key + "." + file.type.substring(6, 10));

    uploadBytes(fileRef, file).then(() => {

        set(ref(database, "chat/messages/" + group_to_create), {
            img: newPostRefe.key + "." + file.type.substring(6, 10),
            psw: group_create_password
        }).catch();

        const join_group_ref = ref(database, 'chat/users/' + user_id + '/chats');
        const new_join_group_ref = push(join_group_ref);

        set(new_join_group_ref, {
            chatname: group_to_create
        });

        $("#chat_div").removeAttr("hidden");
        $("#enterChat").prop("hidden", true);
    });
}

export {joinGroup, createGroup}
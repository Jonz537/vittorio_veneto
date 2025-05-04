import {createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail} from "firebase/auth";
import {push, ref, set} from "firebase/database";
import {requestFoot, warning} from "./Utils";

function registerAuth(database) {

    let email_reg = $("#email_reg");
    let password_reg = $("#password_reg");

    if(emailCheck(email_reg.val()) && usernameCheck($("#username_reg").val())
        && bothPasswordsCheck(password_reg.val(),
        $("#confirm_password_reg").val()))  {
        //Firebase registration
        console.log("registration");
        const auth = getAuth();
        createUserWithEmailAndPassword(auth, email_reg.val(), password_reg.val())
            .then((userCredential) => {
                // Signed in
                const user = userCredential.user;
                const postListRef = ref(database, 'chat/users/' + user.uid);

                push(postListRef);
                set(postListRef, {
                    name: $("#username_reg").val()
                }).then(function() {
                    $("#signup_div").prop("hidden", true);
                    $("#login_div").removeAttr('hidden');
                });
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorCode + ": " + errorMessage)
            });
    }

}

async function forgot (auth) {

    requestFoot("Recover password",
        "<input type='text' class='form-control w-100' placeholder='Enter your email' id='email_reset'>",
        "<button type='button' class='btn btn-danger chiudi' data-bs-dismiss='modal'>Cancel</button><button class='btn btn-success' id='forgot_conf' data-bs-dismiss='modal'>Confirm</button> ");

    document.getElementById("confirm_modal").addEventListener('click', async function forgot () {
        sendPasswordResetEmail(auth, $("#email_reset").val())
            .then(() => console.log("Email di recupero"))
            .catch((error) => console.log(error));
    });
}

function emailCheck(email)   {
    if(emptyString(email))   {
        // console.log("email vuota");
        return false;
    } else  {
        return email.includes("@") && email.includes(".com");
    }
}

function usernameCheck(username) {
    if(emptyString(username))  {
        warning("Choose a username");
        return false;
    }

    return true;
}

function bothPasswordsCheck(password, confirm) {
    if(emptyString(password) || emptyString(confirm))   {
        return false;
    }
    if(password !== confirm)   {
        warning("The password are different");
        return false;
    }
    // console.log("password uguali");
    return(stringCheck(password));
}

function emptyString(string)  {
    return string === "";
}

function stringCheck(string) {
    const lowerCaseLetters = /[a-z]/g;
    const upperCaseLetters = /[A-Z]/g;
    const numbers = /[0-9]/g;

    if(string.length < 8)  {
        warning("The password must contain at least 8 characters");
        return false;
    }

    if(!string.match(numbers))   {
        warning("The password must contain a number");
        return false;
    }

    if(!string.match(lowerCaseLetters))   {
        warning("The password must contain a lower case letter");
        return false;
    }

    if(!string.match(upperCaseLetters))   {
        warning("The password must contain a upper case letter");
        return false;
    }
    return true;
}

export {registerAuth, forgot}
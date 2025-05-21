export class User {
    constructor(username, roles = []) {
        this.username = username;
        this.roles = roles;
    }

    addRole(role) {
        if (!this.roles.includes(role)) {
            this.roles.push(role);
        }
    }

    removeRole(role) {
        this.roles = this.roles.filter(r => r !== role);
    }

    hasRole(role) {
        return this.roles.includes(role);
    }
}
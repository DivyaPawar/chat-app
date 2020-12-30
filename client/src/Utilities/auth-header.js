import { authenticationService } from '../Services/authenticationService';

export function authHeader() {
    const currentUser = authenticationService.currentUserValue;
    if (currentUser && currentUser.token) {
        return {
            Authorization: `${currentUser.token}`,
            'Content-Type': 'application/json',
        };
    } else {
        return {};
    }
}

export function authHeaderImg() {
    const currentUser = authenticationService.currentUserValue;
    if (currentUser && currentUser.token) {
        return {
            Authorization: `${currentUser.token}`,
            //'Content-Type': 'multipart/form-data',
        };
    } else {
        return {};
    }
}

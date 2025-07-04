import { inject } from "@angular/core";
import { Router } from "@angular/router";

export const AuthGuard = () => {
    var router = inject(Router)
    const token = sessionStorage.getItem('token');

    if(!token){
        router.navigateByUrl('/auth/login');
    }
    return true
}
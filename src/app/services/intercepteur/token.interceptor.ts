import {HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
 let router = inject(Router);
  const token = localStorage.getItem('token');
  if(token){
    let decodedToken = jwtDecode(token);
    const isExpired =
    decodedToken && decodedToken.exp
    ? decodedToken.exp < Date.now() / 1000
    : false;
    if(isExpired){
      console.log('token expired');
      localStorage.removeItem('token');
     router.navigateByUrl('/login');
    } else {
      console.log('token not expired');
    }
  }
  return next(req);
};

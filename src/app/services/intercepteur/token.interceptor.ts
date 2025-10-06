import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (token) {
    try {
      // Supprimer un éventuel "Bearer " mal stocké
      const pureToken = token.startsWith("Bearer") ? token.split(" ")[1] : token;

      // Décoder le token
      const decodedToken: any = jwtDecode(pureToken);

      // Vérifier expiration
      const isExpired =
        decodedToken && decodedToken.exp
          ? decodedToken.exp < Date.now() / 1000
          : false;

      if (isExpired) {
        console.warn('token expired');
        localStorage.removeItem('token');
        router.navigateByUrl('/login');
      } else {
        console.log('token not expired');

        // Ajouter le token dans l'en-tête Authorization
        req = req.clone({
          setHeaders: {
            Authorization: `Bearer ${pureToken}`,
          },
        });
      }
    } catch (err) {
      console.error("Token invalide :", err);
      localStorage.removeItem('token');
      router.navigateByUrl('/login');
    }
  }

  return next(req);
};

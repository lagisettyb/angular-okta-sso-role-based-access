import { Injectable } from '@angular/core';

import { Observable, Observer } from 'rxjs';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { OktaAuth, OktaAuthOptions, TokenManager, IDToken, AccessToken, UserClaims, TokenParams } from '@okta/okta-auth-js';
 
import { TokenService } from './token.service';
import { environment } from 'src/environments/environment';
 
const config: OktaAuthOptions = {
  issuer: environment.oauthIssuerUrl,
  authorizeUrl: environment.oauthLoginUrl,
  userinfoUrl: environment.oauthUserInfoUrl,
  tokenUrl: environment.oauthTokenUrl,
  clientId: environment.oauthClientId,
  redirectUri: environment.oauthCallbackUrl,
  responseMode: 'fragment',
  scopes: ['openid', 'email', 'profile'],
  tokenManager: {
    storage: 'sessionStorage'
  },
  devMode: true
};
 
const authClient: OktaAuth = new OktaAuth(config);
const tokenManager: TokenManager = authClient.tokenManager;
 
@Injectable({
  providedIn: 'root'
})
export class AuthService{
 
  constructor(public router: Router, private tokenService: TokenService) { }

 /* canActivate(): boolean {
    if(!this.tokenService.getToken()) {
      return false;
    }

    this.router.navigate(['dashboard']);
    return true;
  } */
 
  async signout() {
	await authClient.signOut({
	   postLogoutRedirectUri: environment.oauthPostLogoutUrl
	});
  }
 
  async signin() {
	if(authClient.isLoginRedirect()) {
	   try {
		 await authClient.handleLoginRedirect();
	   } catch(e) {
		 console.log(e);
	   }
	} else if(!await authClient.isAuthenticated()) {
	   authClient.signInWithRedirect();
	} else {
	   const accessToken: AccessToken = await tokenManager.get('accessToken') as AccessToken;
	  
	   const idToken: IDToken = await tokenManager.get('idToken') as IDToken;
	  
	   let userInfo: UserClaims = await authClient.getUser();
     console.log("user");
	  console.log(userInfo);
    // localStorage.setItem('Id', accessToken.accessToken);
	   if(!userInfo) {
		 const tokenParams: TokenParams = {
			scopes: ['openid', 'email', 'profile']
		 }
		
		 authClient.token.getWithRedirect(tokenParams);
	   }
	  
	   this.tokenService.saveUserDetails(accessToken, userInfo);
	  
	   this.router.navigate(['dashboard']);
	}
  }
 
}

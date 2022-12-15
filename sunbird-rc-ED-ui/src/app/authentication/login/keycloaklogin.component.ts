import { Component, OnInit } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { Router } from '@angular/router';
import { AppConfig } from '../../app.config';

@Component({
  selector: 'app-keycloaklogin',
  templateUrl: './keycloaklogin.component.html',
  styleUrls: ['./keycloaklogin.component.css'],
})
export class KeycloakloginComponent implements OnInit {
  user: any;
  entity: string;
  profileUrl: string = '';
  constructor(
    public keycloakService: KeycloakService,
    public router: Router,
    private config: AppConfig
  ) {}

  ngOnInit(): void {
    this.keycloakService.loadUserProfile().then((res) => {
      this.entity = res['attributes'].entity[0];
      if (
        res['attributes'].hasOwnProperty('locale') &&
        res['attributes'].locale.length
      ) {
        localStorage.setItem('setLanguage', res['attributes'].locale[0]);
      }
    });
    this.user = this.keycloakService.getUsername();
    this.keycloakService.getToken().then((token) => {
      localStorage.setItem('token', token);
      localStorage.setItem(
        'LoggedInKeyclockID',
        JSON.parse(atob(token.split('.')[1])).sub
      );
      // localStorage.setItem('token', 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJjT2c0WnRTaUpEN25rbFpodGJlQ0lmcDBzQTl1RkI0UVhEWVpPNzFLcThVIn0.eyJleHAiOjE2Njk4MzQwNjEsImlhdCI6MTY2OTc5ODA2NiwiYXV0aF90aW1lIjoxNjY5Nzk4MDYxLCJqdGkiOiJmODZiZGIzNS1jMGYxLTRhZDEtYjY0NC01ZWQxYmE1YmEwNGUiLCJpc3MiOiJodHRwczovL2VnMi51bml0ZWZyYW1ld29yay5pby9hdXRoL3JlYWxtcy9zdW5iaXJkLXJjIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6IjQzMTUzZjFhLWEwMDMtNDRjMi04NmRlLTUyNWRkY2NmYTc2ZiIsInR5cCI6IkJlYXJlciIsImF6cCI6InJlZ2lzdHJ5LWZyb250ZW5kIiwibm9uY2UiOiI3YTFjNDNhNi0zMGNmLTRkOTgtODQ1ZC1jNTZiMjE1MzdlYjAiLCJzZXNzaW9uX3N0YXRlIjoiZTFmODBkZmItNTY4OS00ZWY5LTk0MjMtY2RiNGRmZTgyMGM2IiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyIqIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJvZmZsaW5lX2FjY2VzcyIsImFkbWluIiwiZGVmYXVsdC1yb2xlcy1zdW5iaXJkLXJjIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6Im9wZW5pZCBlbWFpbCBwcm9maWxlIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJlZC1hZG1pbiIsImVtYWlsIjoiZWQtYWRtaW5AZ21haWwuY29tIn0.ebB4gcqtVUx1LzqzZltQlneALyGn7sDznn7j-I6FrutdFn_MEg0gRLllksGTaxWX-ZvsRT4YO-JgNoT9_tp843AwUJya0Ukir2UGWDXOiFcAbd75mwIcQcn_9Hkljg0Kg6fL-JJ6cIlSUgIKVVBXktgOdTUTE4_DRXhsWm4ZqU15BSZdB1YDdasztRQTT4qUAw_oSwr1dHGipPHQ6ABMc0JwV5oKiWFWxH0ght75jZmw9cpAjXKlDHBxJKTc1o6I6qzXpLnhx-4zS6-LGK1XUKjoFPmTCk2kkUBaVmRPpdXeBkCQi_o0N8ndFRbABSCvfwUY0JnT8CA0ovZgS-9jHA');
      localStorage.setItem('loggedInUser', this.user);
      if (
        this.config.getEnv('appType') &&
        this.config.getEnv('appType') === 'digital_wallet'
      ) {
        this.profileUrl = this.entity + '/documents';
      } else {
        this.profileUrl = '/profile/' + this.entity;
      }
      this.router.navigate([this.profileUrl]);
    });
  }
}

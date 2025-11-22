// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyA9qAXm92bGQIWMODfpeqsmIQBErg_cabg",
    authDomain: "arvisionx-mobile.firebaseapp.com",
    projectId: "arvisionx-mobile",
    storageBucket: "arvisionx-mobile.firebasestorage.app",
    messagingSenderId: "840201187986",
    appId: "1:840201187986:web:4b6705e0bf438804376c4b",
    measurementId: "G-XKMBQEHZ0S",
    databaseURL: "https://arvisionx-mobile-default-rtdb.firebaseio.com"
  },
  supabase: {
    url: 'https://mxolpapfefidjdzdwlql.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14b2xwYXBmZWZpZGpkemR3bHFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3Njc2MzgsImV4cCI6MjA3OTM0MzYzOH0.O18PhZ10U23Z93u2WinyCKg3O3q7kT_RcS5IJ73lOCQ',
    storageBucket: 'assets'
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.

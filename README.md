# What's Fora
A platform for building end-to-end Isomorphic JS apps.

Fora builds on the significance of every shipping browser also including a debugging and dev environment for JavaScript.
Which means that if the stack is entirely JavaScript, you could develop/test in a browser and expect it to run with Node.JS on the Server.

- Fora is an Build System (and an App Store and IDE which are external tools not part of this repo) for "End-to-End Isomorphic" JS Apps.
- End-to-End Isomorphism? We've gotten the Web Server, App and the Db API (MongoDb initially) to run entirely within the browser
- The App Store will feature (eventually) apps in various categories, like Publishing, Social Service, Travel ...
- Most Apps in the App Store will be Open Source, but there'll be an Enterprise Version
- Any user can Fork, Edit and Debug an existing app within just the browser (we've an IDE, based on http://ace.c9.io/)
- You can set breakpoints for Business Logic and Db inside the browser (since Fora's Mongo API runs in the browser)
- Once they make a worthwhile change, they may also send pull requests to the original maintainer
- These apps can also be provisioned and deployed on a Server (which will be a paid service)
- We'll see what we can do with React Native to enable Mobile Apps
- In Phase 2, we'll support all compile to JS languages (like Java, Python, LISP, Dart etc)

The platform preview is ready, but at this point we're working on *docs and examples*.
- We were planning to do this by June 1st week, but it might take a month more. Apologies.
- We will also be switching the licenses for all Fora Projects from GPL3 to MIT.


If you're adventurous:
```
npm install -g fora
fora install fora-template-fora-appstore
fora new fora-appstore somedir
cd somedir
fora build
```

Most of the development testing has been with io.js, so we recommend using io.js. 

The example appstore template is an empty template right now.


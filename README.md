# _blimp-io_

blimp-io can manage one or multiple blimps. So far it only accepts JSON data, which it logs to the corresponding API-Key

Based on **Node.js**, **Express.js**, **Mongoose.js** (MongoDB), **Socket.io**, **Passport.js** (+Bcrypt) and **Angular.js**

Generated with [angular-fullstack][1]

## TODO

 - Create _"data buckets"_ instead of attaching reports directly to a blimp
 - Implement real-time graphing ([highcharts-ng][7] ?)
 - Means of filtering / ordering / grouping reports and _interpreting_ the data
 - Cleanup styles / Switch to LESS
 - Revamp Authentication Service in the Front-End

## Project Setup

###How do I, as a developer, start working on the project?

 - You will need [npm][2] and [yeoman][3] (Grunt.js, Bower)
 - Inside the blimp-io directory do `npm install && bower install`
 - Make sure MongoDB is up
 - Fire up a local server with `grunt server`

###How do I make use of the generators for angular components?

You don't. The application has an entirely different structure now. The modules should provide enough of a template.
 ~~Please refer to the [angular-fullstack generator documentation][4]~~~

###What's the default user login?

Username: **blimp**

Password: **blimp**

This user will automatically be created at server start if the user collection is empty.

## Server & Deployment

###What's the current deploy workflow?

~~~GitHub commit hook -> [Travis-CI][5] -> Heroku (Autodeploy)~~

Switched to [drone.io][8] / [VIEW BUILDS][9]

###Generate a seperate deployment build

Easy.

    grunt heroku 

###Alternatively: Service & Autostart

A service script is provided together with blimp-io; ~~it assumes the usage of hotnode~~

    nano init.d/blimp-io

Copy it to /etc/init.d 

    sudo cp init.d/blimb-io /etc/init.d/blimp-io
    sudo chmod 0755 /etc/init.d/blimp-io

Use it to start blimb-io

    /etc/init.d/blimp-io {start|stop|restart|status}



###Redirection with _nginx_
[Proxying WebSockets with nginx][6]

    location ~^/ {
        proxy_pass http://localhost:9007;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    


  [1]: https://github.com/DaftMonk/generator-angular-fullstack
  [2]: http://nodejs.org/download/
  [3]: http://yeoman.io/
  [4]: https://github.com/DaftMonk/generator-angular-fullstack#generators
  [5]: https://chrislea.com/2013/02/23/proxying-websockets-with-nginx/ 
  [6]: https://travis-ci.org/d-simon/blimp-io
  [7]: https://github.com/pablojim/highcharts-ng
  [8]: https://drone.io
  [9]: https://drone.io/github.com/d-simon/blimp-io
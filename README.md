# _blimp-io_

blimp-io will manage one or multiple blimps - so far it is only a raw skeleton.

Based on **Node.js**, **Express.js**, **Mongoose.js** (MongoDB), **Socket.io** and **Angular.js**

Generated with [angular-fullstack][1]

## Project Setup

###How do I, as a developer, start working on the project?

 - You will need [npm][2] and [yeoman][3] (Grunt.js, Bower)
 - Inside the blimp-io directory do `npm install && bower install`
 - Make sure MongoDB is up
 - Fire up a local server with `grunt server`

###How do I make use of the generators for angular components?

 - Please refer to the [angular-fullstack generator documentation][4]

###What's the default user login?

Username: **blimp**

Password: **blimp**

This user will automatically be created at server start. Disable it in the **_server.js_** at the bottom.

###How do I add more users?

Currently only manually, or by extending the initialisation part in the **_server.js_** at the bottom.

## Server & Deployment

###Generate deployment build

Easy.

    grunt heroku 

###Service & Autostart

A service script is provided together with blimp-io; ~~it assumes the usage of hotnode~~

    nano init.d/blimp-io

Copy it to /etc/init.d 

    sudo cp init.d/blimb-io /etc/init.d/blimp-io
    sudo chmod 0755 /etc/init.d/blimp-io

Use it to start blimb-io

    /etc/init.d/blimp-io {start|stop|restart|status}



### Redirection with _nginx_
[Proxying WebSockets with nginx][5]

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
# _blimp-io_

blimp-io will manage one or multiple blimps - so far it is only a raw skeleton.

Based on **Node.js**, **Express.js**, **Mongoose.js** (MongoDB), **Socket.io** and **Angular.js**

Generated with [angular-fullstack][1]

## Project Setup

_How do I, as a developer, start working on the project?_ 

 - You will need [npm][2] and [yeoman][3] (Grunt.js, Bower)
 - Inside the blimp-io directory do `npm install && bower install`
 - Make sure MongoDB is up
 - Fire up a local server with `grunt server`

_How do I make use of the generators for angular components?_ 

 - Please refer to the [angular-fullstack generator documentation][4]

## Server & Deployment

_Deployment build_ 
 -`grunt heroku` (this creates a folder 'heroku')

_Service & Autostart_
 - Configure the _blimp-io_ file
 - Move it to _/etc/init.d_ and set `chmod 0755 /etc/init.d/blimp-io
 - Start it with `/etc/init.d/blimp-io start` _(start|stop|restart|status)_
 

  [1]: https://github.com/DaftMonk/generator-angular-fullstack
  [2]: http://nodejs.org/download/
  [3]: http://yeoman.io/
  [4]: https://github.com/DaftMonk/generator-angular-fullstack#generators

# Bootstrap Setup Instructions

We will be using Bootstrap for all UI/UX development of Dotz Enterprise Platform.

See more at: https://getbootstrap.com/ 

While we may not do much in customization of vanilla bootstrap styles, you should download the the following via npm to do your own corporate assimilation:

1) in your terminal console, cd into this static directory.

2) run: npm install 

This will install all packages listed in static/package.json file.

3) Install a Sass compiler, like so:
 > npm install -g sass

4) Examine our Sass files found in static/scss/ directory. You can modify or add to, as you deem appropriate.

5) Once satisfied with your changes, you may compile the code:

 > sass ./scss/dotzstrap.scss:./css/dotzstrap.css --style=compressed
 
 (while cd'd in the static folder of this codebase.)

6) Run your application and refresh your front-end code to see your changes.

Also see Bootstrap's documentation on customizing Sass:
https://getbootstrap.com/docs/5.3/customize/sass/


### Notes
 - To keep the custom.scss file auto-recompile mode, while testing, you can also run (in dev environment):

  > sass --watch ./scss/dotzstrap.scss ./css/dotzstrap.css

 View useable icons:
 https://icons.getbootstrap.com/




 # JS Code-base Development Environment:

Our Dotz Enterprise Platform has turned into a JS quasi-SPA application. What started out as a Django + Bootstrap stack, has been shifting to more JS centered, in-terms of end-user functionality.

Thus we are missing ReactJS, and have developed our own mini-framework, the $A library. All throughout the Javascript code you will find references to $A.someModule.function(). 

The $A library largely resides in the static/core/js directory. Though each app has the liberty of adding modules to it in their own domain (using the static/{app}/js/helper.js definition file).

We have tried to keep the static/core/js/ codebase well documented with comments, so feel free to browse the code.

To enable our JS code in your environment:

In your commandline utility: 

 > cd into static/ directory.

(in-case you have not run npm install, run:)

 > npm install 

Then run:

 > npm run build

This builds all js bundle files: 

 - static/dist/users-bundle.js 
 - static/dist/tasks-bundle.js
 - etc...

This should have the front-end functionality (in terms of JS) up and running.


### Why Webpack/Babel? (side note)

To run a web app using ES6 code across a wide range of browsers, you need to use a transpiler (like Babel or SWC) to convert your modern JavaScript into a backward-compatible version (typically ES5). This process is essential because older browsers may not support all ES6+ features. 

Here is a general guide on how to set up your workflow:
Key Tools Needed

 - Babel: The most widely used JavaScript transpiler for converting ES6+ syntax (like arrow functions, const/let, classes) into ES5.

 - A Module Bundler: Tools like Webpack, Rollup, or Parcel.

 - Polyfills: These are code snippets that provide the functionality for newer APIs (like Promise or Array.from) that Babel can't simply "transpile".

 (-- taken from Google AI's answers)




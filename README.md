# metacolon

parses RFC 822-style text files with headers and body

```
title: Hello World
format: markdown

lorem ipsum
dolor sit amet
```


Getting Started
---------------

```
$ npm install metacolon
```

```javascript
let colonParse = require("metacolon");

colonParse("sample.md").then(({ headers, body }) => {
    // …
});
```


Contributing
------------

* ensure [Node](http://nodejs.org) is installed
* `npm install` downloads dependencies
* `npm test` runs the test suite and checks code for stylistic consistency

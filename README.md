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
import { colonParse } from "metacolon";

let { headers, body } = await colonParse("./sample.md");
// `headers` is a `Map`, `body` a string
```


Contributing
------------

*   ensure your editor supports [EditorConfig](https://editorconfig.org)

*   ensure [Node](http://nodejs.org) and [Deno](https://deno.com) are installed

    Node is our primary runtime environment while Deno provides development
    tooling

*   `npm install` downloads dependencies

*   `npm test` runs the test suite

    `deno test` might be used to check compatibility with alternative runtimes

*   `deno task vet` checks code for stylistic consistency

    `deno fmt` can be used to automatically format code

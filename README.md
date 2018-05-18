# Juno IDE for [Jupiter Programming Language](https://github.com/davidarias/Jupiter)

A Smalltalk-like IDE for Jupipter

![screenshot](https://raw.githubusercontent.com/davidarias/juno/master/Screenshot.png)

### Features

- File explorer with Miller columns / cascading lists ( MacOS Finder style )
- Source code editor
- Documentation editor with Markdown format

### Why Jupiter needs an especific IDE?

**tl;dr** It doesn't, you can use any editor, but it can provide a nicer development environment.

#### Long answer

Jupiter is a programming laguage based on Smalltalk/Self. One mayor difference with other
Smalltalk dialects is the way the source code is stored: **Jupiter uses plain text files**, but
instead of fitting all methods of several objects in one file, like most of other programming
languages do, **Jupiter only allow one method per file.** Regular source code editors
are optimiced for large files containing a lot of code entities. Jupiter is different
regqarding this issue.

In a way, a directory with Jupier source code is like an *'old school'* Smalltalk image that can
be also inspected with any other unix tool.

There is a ver direct equivalence between the file system and objects in Jupiter:
- A directory is always an Object ( Usually a prototype intended for clone/copy )
- A file with .st extension is a method in the object represented by the containing folder

Aditionaly can be files with Markdown format and yaml. Those files are ignored by the interpreter
but the Juno IDE shows them as Docs and metadata asociated to the entity with the same name:
For instance if we have a file named 'test.st' and a file named 'test.md', the source will appear in the
first tab of the editor and the .md file will apper in the second tab.

### To get started:
* Run `npm install`

##### Development
* Run `npm run dev` to start webpack-dev-server. Electron will launch automatically after compilation.

##### Production
_You have two options, an automatic build or two manual steps_

###### One Shot
* Run `npm run package` to have webpack compile your application into `dist/bundle.js` and `dist/index.html`, and then an electron-packager run will be triggered for the current platform/arch, outputting to `builds/`

###### Manual
_Recommendation: Update the "postpackage" script call in package.json to specify parameters as you choose and use the `npm run package` command instead of running these steps manually_
* Run `npm run build` to have webpack compile and output your bundle to `dist/bundle.js`
* Then you can call electron-packager directly with any commands you choose

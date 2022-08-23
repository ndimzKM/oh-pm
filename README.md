```oh-pm``` an offline first package manager.

[![MIT License](https://img.shields.io/apm/l/atomic-design-ui.svg?)](https://github.com/tterb/atomic-design-ui/blob/master/LICENSEs)
![GitHub code size](https://img.shields.io/github/languages/code-size/ndimzKM/notexpress)
![Version](https://img.shields.io/npm/v/@ndimz/notexpress)

It is a local Node.js server that allows you to have your own local npm registry. It has a simple database where packages are cached.

Packages that have already been installed, do not require internet to be installed again.

# Installation
```
$ npm install -g oh-pm
```
In order to start the server:
```
$ oh-pm
```
The above command can take optional arguments. To see available arguments, run:
```
$ oh-pm --help
```
You are all set. To set as registry, while the server is running, in a new terminal, run:
```
$ npm set registry http://localhost:5501
```
To revert back to default registry, run:
```
$ npm set registry https://registry.npmjs.com
```

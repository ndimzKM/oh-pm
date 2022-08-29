```oh-pm``` an offline first package manager.

[![MIT License](https://img.shields.io/apm/l/atomic-design-ui.svg?)](https://github.com/tterb/atomic-design-ui/blob/master/LICENSEs)
![GitHub code size](https://img.shields.io/github/languages/code-size/ndimzKM/oh-pm)
![Version](https://img.shields.io/npm/v/@ndimz/oh-pm)

It is a local Node.js server that allows you to have your own local npm registry. It has a simple database where packages are cached. Packages that have already been installed, do not require internet to be installed again.

# How it works
- it looks for the package in the local db
- if found, package is simply installed
- if not found, it fetches it from the main npm registry and store it in the local db
- repeat step 1 and 2

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
# Default values for the arguments
These arguments are optional.
```
    -p  5501   # port number to use for local registry
    -pp 6543   # port number for the pouchdb server
    -u  http://localhost:5501 # url for local registry
    -d  ./     # directory to store pouchdb data

```
You are all set. To set as registry, while the server is running, in a new terminal, run:
```
$ npm set registry http://localhost:5501
```
To revert back to default registry, run:
```
$ npm set registry https://registry.npmjs.com
```

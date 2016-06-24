Port to NW.js v0.15 with better application structure and some other enhancements

[Warning! Popcorntime.sh threatens your computer privacy.](http://popcorntime.ag/official-statement.html#Malware2)

# Popcorn Time Community

[![Join the chat at https://gitter.im/vzamanillo/desktop](https://badges.gitter.im/vzamanillo/desktop.svg)](https://gitter.im/vzamanillo/desktop?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Allow anyone to easily watch their favorite movies, shows, and anime.

![Popcorn Time](src/images/icon.png)

Visit the project's website at <http://popcorntime.ag>.

This project would absolutely **not** be possible without the original developer's hard work into making Popcorn Time what it is today. All credit should go to them, we're just trying to help the community :)

***

## Getting Involved

Want to report a bug, request a feature, contribute or translate Popcorn Time? We need all the help we can get! You are welcome.

## Contributing

Please don't post pull requests that reformats the code. Please don't remove whitespaces. Don't do any dirty job.

## Getting Started

If you're comfortable getting up and running from a `git clone`, this method is for you.

The [nwjs-15-restructured](https://github.com/vzamanillo/desktop/tree/nwjs-15-restructured) branch which contains all the new code.

#### Requirements

1. You must have git installed
2. You must have npm installed

#### Running
*Runs the app without building, useful for testing*

1. `git clone https://github.com/vzamanillo/desktop.git -b develop`
1. `cd desktop`
1. `npm install --global gulp-cli` or `npm install gulp -g` (if you have not installed `gulp` before)
1. `npm install`
1. `gulp run`

#### PopcornTime-CE configuration

The configuration settings for this port are stored in your profile directory `.Popcorn-Time-CE-dev` (name in manifest src/package.json), if you want to import the configuration settings from a previous installation of PopcornTime-CE you can do that from the configuration page after run this port.

#### Building
*Builds the app for a packaged, runnable app*

1. `npm install`
1. `gulp build` **OR** `node_modules/.bin/gulp build` depending whether you have gulp installed globally or not.
  2. You can also build for different platforms by passing them with the `-p` argument as a comma-seperated list (For example: `gulp build -p osx64,win32`
1. There should be a `build/` directory containing the built files

## Versioning

For transparency and insight into our release cycle, and for striving to maintain backward compatibility, Popcorn Time will be maintained according to the [Semantic Versioning](http://semver.org/) guidelines as much as possible.

Releases will be numbered with the following format:

`<major>.<minor>.<patch>-<build>`

Constructed with the following guidelines:

* A new *major* release indicates a large change where backwards compatibility is broken.
* A new *minor* release indicates a normal change that maintains backwards compatibility.
* A new *patch* release indicates a bugfix or small change which does not affect compatibility.
* A new *build* release indicates this is a pre-release of the version.

***

If you distribute a copy or make a fork of the project, you have to credit this project as source.

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program.  If not, see http://www.gnu.org/licenses/ .

***

**This project and the distribution of this project is not illegal, nor does it violate *any* DMCA laws. The use of this project, however, may be illegal in your area. Check your local laws and regulations regarding the use of torrents to watch potentially copyrighted content. The maintainers of this project do not condone the use of this project for anything illegal, in any state, region, country, or planet. *Please use at your own risk*.**

***

Copyright (c) 2015 Popcorn Time Community - Released under the [GPL v3 license](LICENSE.txt).

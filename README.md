<h1 align="center">nginx location match visible</h1>
<p align="center">
  <img src="https://detailyang.github.io/nginx-location-match-visible/favicon.ico" width="100" height="100" />
  <br />
  <a href="https://img.shields.io/badge/branch-master-brightgreen.svg?style=flat-square">
    <img src="https://img.shields.io/badge/branch-master-brightgreen.svg?style=flat-square" />
  </a>
  <a href="https://travis-ci.org/detailyang/nginx-location-match-visible">
    <img src="https://travis-ci.org/detailyang/nginx-location-match-visible.svg?branch=master" />
  </a>
  <a href="https://img.shields.io/badge/license-MIT-blue.svg">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" />
  </a>
  <a href="https://img.shields.io/github/release/detailyang/nginx-location-match-visible.svg">
    <img src="https://img.shields.io/github/release/detailyang/nginx-location-match-visible.svg" />
  </a>
</p>

#Purpose

This project aims to help guys to understand how does nginx location match work. Wish you can learn something from this project :grin:

#How

In [Nginx Website](http://nginx.org/en/docs/http/ngx_http_core_module.html#location), it include these docs as the following:

````
Syntax:	location [ = | ~ | ~* | ^~ ] uri { ... }
location @name { ... }
Default:	—
Context:	server, location

````
>
A location can either be defined by a prefix string, or by a regular expression. Regular expressions are specified with the preceding “~*” modifier (for case-insensitive matching), or the “~” modifier (for case-sensitive matching). To find location matching a given request, nginx first checks locations defined using the prefix strings (prefix locations). Among them, the location with the longest matching prefix is selected and remembered. Then regular expressions are checked, in the order of their appearance in the configuration file. The search of regular expressions terminates on the first match, and the corresponding configuration is used. If no match with a regular expression is found then the configuration of the prefix location remembered earlier is used.
>
location blocks can be nested, with some exceptions mentioned below.
>
For case-insensitive operating systems such as Mac OS X and Cygwin, matching with prefix strings ignores a case (0.7.7). However, comparison is limited to one-byte locales.
>
Regular expressions can contain captures (0.7.40) that can later be used in other directives.
>
If the longest matching prefix location has the “^~” modifier then regular expressions are not checked.
>
Also, using the “=” modifier it is possible to define an exact match of URI and location. If an exact match is found, the search terminates. For example, if a “/” request happens frequently, defining “location = /” will speed up the processing of these requests, as search terminates right after the first comparison. Such a location cannot obviously contain nested locations.

extra_match(alpha)->inclusive(alpha)->reg(location order)->name(alpha)->noname(location order)

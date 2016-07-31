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


Table of Contents
-----------------

  * [Purpose](#purpose)
  * [Rough](#rough)
  * [Detail](#detail)
  * [Contributing](#contributing)
  * [Author](#author)
  * [License](#license)

#Purpose

This project aims to help guys to understand how does nginx location match work. Wish you can learn something from this project :grin:

#Rough

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

Let's explain something about this:

1. the exact match is the best priority
2. the prefix match is second is the second, but there are two type prefix match like `^~` and `/`, if you are ^~, nginx will skip regular match else it will continue to match all the regular match.

a little fake code as the following:

````python
def match(uri):
  rv = NULL

  if uri in exact_match:
    return exact_match[uri]
  
  if uri in prefix_match:
    if prefix_match[uri] is '^~':
      return prefix_match[uri]
    else:
      rv = prefix_match[uri]
    
  if uri in regex_match:
    return regex_match[uri]
  
  return rv
````

Let’s illustrate the above by an example:

````
location = / {
    [ configuration A ]
}

location / {
    [ configuration B ]
}

location /documents/ {
    [ configuration C ]
}

location ^~ /images/ {
    [ configuration D ]
}

location ~* \.(gif|jpg|jpeg)$ {
    [ configuration E ]
}
````
* if we are requesting "/index.html", it will match `configureation B`.
* if we are requesting "/1.jpg", it will find `configuration B` at first, then regular match `configuration E` finally.
* if we are requesting "/images/xxx", it will match `configuration D`, but never match regular location becasuse of ^~

#Detail
Let’s talk about the something about nginx location data struct when nginx match location.

Firstly Nginx will sort the location list by the order 

````
extra_match(alpha order)->prefix(alpha order)->regular(order write by conf)->named(alpha order)->noname(order write by conf)
````

Then Nginx will move named and noname location from the list, because normal will not hit these location.    
Then Nginx will split regular location to signle list like the following.    
Then Nginx transform the location list only have match and prefix to a ternary tree like the following.

![nginx location tree and regular location list](https://raw.githubusercontent.com/detailyang/nginx-location-match-visible/master/docs/images/nginxds.png)


Contributing
------------

To contribute to ngx_http_updown, clone this repo locally and commit your code on a separate branch.           
PS: PR Welcome :rocket: :rocket: :rocket: :rocket:

This project consist of the three parts:

* Parse the nginx conf:
  nginx conf parser are not implement like compiler, it's just string  manipulate. And now it cannot support rewrite directive.
* Construct the nginx static location tree、regular location list and Implement the nginx_find_location method:
  it translate nginx c code to js code by manually

* Render nginx match process:
  now render the process is deal with by canvas api, it could be implmented better actually. 

The code of this project is a little dirty but workaround. It's enough to help guys to know how to work when nginx match location.

Wish it can help you as more as what I have learn from nginx code. 
:rocket: Thank You !!! :rocket:

Author
------

> GitHub [@detailyang](https://github.com/detailyang)


License
-------
ngx_http_updown is licensed under the [MIT] license.

[MIT]: https://github.com/detailyang/ybw/blob/master/licenses/MIT

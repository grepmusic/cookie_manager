cookie_manager
==============

A simple cookie manager extension for chrome, version 1.0 only supports HTTP header 'Set-Cookie: xxxx' format for updating cookie.

The textarea accepts cookies like below:

# comment will be ignored, which is starting from '# '
[Set-Cookie: ]name=value;[[ expires=Tue, 10-Mar-2015 16:36:24 GMT;] path=/;] domain=example.com[[ secure; ]httponly]

# to delete a cookie, you must specify the value to empty string '', AND set expires to a time(GMT date format) before now
[Set-Cookie: ]name=; expires=Thu, 01-Jan-1970 00:00:00 GMT; domain=example.com

Hope you enjoy it, any advice is welcome.

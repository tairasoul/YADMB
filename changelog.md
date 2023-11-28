# Changelog for YADMB

Addons can now declare two extra resolver-specific fields/methods.

They can now declare an async available() function, taking in a URL as an argument and returning a boolean.

If this is true, it can be used for said URL.

They can also declare a priority field.

The higher it is, the earlier on it'll be tried.

The lower, the later.
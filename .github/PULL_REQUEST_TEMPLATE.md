# Code review challenge

Please review this PR as you would do at work.  

Code in this repository contains an `ApolloLink` implementation.  
A member of your team is proposing changes to the current `ApolloLink` implementation in order to retrieve a user's permissions and store these in Local Storage.  

After you finish the review, please answer the questions below in a separate comment on the PR:
* What feedback do you have on the code?
* How do you determine that this is a good change?
* What information, if any, is missing from this PR?

Good luck!

## Authors Notes

These changes address the need to GET the users permission set, and then store these in the browsers Local Storage.

* Add 'GET' method to current 'Util' function
* Refactor permissionLink Handler for Apollo

Here are my proposed changes to the system.

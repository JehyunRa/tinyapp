# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

###### Login Page / Register Page
!["login page"](docs/login.png)
This is login page. A user who has an account can enter the app through this page using email and password. This page can be accesed by clicking 'Log in' on the right side of top nav bar.

If a user who is not logged in attempts to access a page that isn't register, login, or error page, the user will be redirected back to this page. Also, if a user enters unregistered email or wrong password, the user will be redirected to 403 error page.

Register page has similar layout and it can be accessed by clicking 'Register' on the right side of top nav bar. In register page a user can register new account. However, if the user enters registered email, the user will be redirected to 400 error page.

!["index page"](docs/urls_index.png)
!["edit page"](docs/urls_show.png)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session
- request
- nodemon

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` or `npm start` command.
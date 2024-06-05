# Dreamify
## What is Dreamify?
A website for sharing dreams, tracking your dreaming consistency, and sharing them with others with a modern design suitable for people of all ages.
## Technologies used:
1. Vue.js
2. Node.js
3. Express
4. Bootstrap
5. Javascript + libraries
6. HTML + vanilla CSS
## What Does Dreamify Offer?
1. **Login Page**
2. **Signup Page**
3. **Password Reset Page**
4. **Dream Management Options**:
   - Add Dream
   - Delete Dream
   - Edit Dream
5. **View Dream Journal with Statistics**
6. **View Specific Dream**
7. **Dream Sharing Features**:
   - Share Dream to Dreamboard: A section where all shared dreams from all users are stored for registered users to see.
   - Unshare Dream: Make dreams private instead of public.
8. **Commenting System**:
   - Comment on Dreams
   - Reply to Comments
   - Reply to Other Replies
9. **Statistics**
10. **Custom Filtering**
11. **Calendar of Lucidity with Dream Views**





## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
cd backend -> npm start
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

## tabula
| Test case id | Test scenario                                                 | Expected result                                                                                  | Actual result                                                                                  | Status |
|--------------|---------------------------------------------------------------|--------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------|--------|
| 1            | User registration with all required fields correctly filled. | User is successfully registered and redirected to the login page                                | User successfully registered and redirected to the login page                                | Passed |
| 2            | User attempts to register without inputting any of the fields.| Under registration form, an error is displayed indicating missing fields.                        | Under registration form, an error is displayed indicating missing fields.                      | Passed |
| 3            | User logs in with the correct email and password.             | User is successfully logged in, redirected to the home page, and sees new navigation tabs.       | User successfully logged in, redirected to the home page, and sees new navigation tabs.         | Passed |
| 4            | User logs in with incorrect details.                          | Under login form, an error is displayed indicating invalid details.                               | Under login form, an error is displayed indicating invalid details.                             | Passed |
| 5            | User clicks the “Drea,” button in the navigation bar.       | User is directed to the profile page, and their information is displayed.                        | User is directed to the profile page, and their information is displayed.                      | Passed |


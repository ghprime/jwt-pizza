# Converting a JS backend into TS

I'm not a huge fan of JS, but I do really like TS. In addition to this, I feel that TS is safer for production environments and while it isn't invicible I feel that it leads to safer code. In addition, by adding types you can create easier to understand code that is more extensible and easier to transfer knowledge with when you work on a codebase with more than one person, which this project is supposed to emulate.

So, with that being said, I changed the `jwt-pizza-service` package to use typescript instead of javascript. My main motivations, based on what I previously said as well as others, are thus:
- By rewriting the backend, I can become more familiar with how the code works and what it does
- I can make documentation with types
- If there are any bugs (which there were) then I can fix them

## Knowledge gained

In doing this, even know I'm quite familiar with TS, I still learned some things and had to look things up. One of the main things I learned was how best to use `express` locals, which is to say information that is passed from middleware to middleware. It was something that was being done in `jwt-pizza-service` to authenticate a user, and if they are authenticated then you can pass that user on to the next middleware. However, the location for the user wasn't documented anywhere other than just in the code, and the location to store it was somewhat arbitrary. Basically, the JS code would store the user on the request, which makes sense since the user's info is taken from the request. However, `express` has a place set aside for variables to be passed from middleware to middleware, called locals, on the response object. You access it using `request.locals`, and you can also add types to it to document what is supposed to be stored there. In order to do that, you have to use the tsconfig file and create a types.d.ts file, and then specify to include it in the tsconfig. The way I implemented it was using these files and this file structure:
```
/jwt-pizza-service
|/types/types.d.ts
|/src/*
|tsconfig.json
```
types/types.d.ts
```ts
import "express";
import type { UserData } from "../src/model";
import { DatabaseDAO } from "../src";

declare global {
  namespace Express {
    interface Locals { // overrides express.Response.locals
      user: UserData;
      dao: DatabaseDAO;
    }
  }
}
```

tsconfig.json
```json
{
  "compilerOptions": {
    ...
  },
  "include": [ // need to specify both src files and types
    "src/**/*",
    "types/**/*" 
  ],
  "exclude": [
    ...
  ]
}
```

So after this, if I want to add any more locals (which I do for stuff like metrics and the likes), it's easy and in a documented place.

In my src files, I can now access the locals pretty easily

```ts
import { Router, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// middleware to authenticate user and add them to locals
export const setAuthUser = asyncHandler(async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = readAuthToken(req);
  const dao = res.locals.dao;
  if (token) {
    try {
      if (await dao.isLoggedIn(token)) {
        // Check the database to make sure the token is valid.
        // token is hashed user
        const user = jwt.verify(token, config.jwtSecret) as unknown as UserData;
        res.locals.user = user; // user as defined in the types file
        user.isRole = (role: Role) =>
          !!res.locals.user.roles.find((r: RoleData) => r.role === role);
      }
    } catch {
      res.locals.user = undefined;
    }
  }
  next();
});


// now if I add this middleware, I can access res.locals.user

// updateUser
authRouter.put(
  "/:userId",
  authenticateToken, // add middleware
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const id = Number(req.params.userId);
    const user = res.locals.user; // user is accessible

    if (user.id !== id && !user.isRole(Role.ADMIN)) {
      return res.status(403).json({ message: "unauthorized" });
    }

    const dao = res.locals.dao;
    const updatedUser = await dao.updateUser({
      id,
      email,
      password,
    } as UserData);
    res.json(updatedUser);
  }),
);
```

It's really nice for development, since it's also integrated into intellisense for vscode, so I get type safety while developing

## Outcomes
- Type documentations were added
  - This was honestly the best part, since before I had no clue about what was being passed around and how, but now I know!
- I learned how to extend other libraries' types!
- I found some bugs from adding types
- I found some bugs from just going through the code

Overall, I thought this was not only really useful for the class, but also going forward when I work in other production systems
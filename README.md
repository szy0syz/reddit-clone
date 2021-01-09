# Reddit Clone

> `Nextjs` `TypeORM` `TailwindCSS` `TypeScript` `[Classsed]`

## Notes

- `yarn add ts-node@latest @types/node@latest typescript@latest`
- `yarn add express`
- `yarn add -D @types/express`
- `yarn add class-validator`

### class-validator

```ts
// ---- entity ----
import { IsEmail, Min } from "class-validator";

@Entity("users")
export class User extends BaseEntity {
  constructor(user: Partial<User>) {
    super();
    Object.assign(this, user);
  }
  @Index()
  @IsEmail()
  @Column({ unique: true })
  email: string;

  @Index()
  @Min(3)
  @Column({ unique: true })
  username: string;

  @Column()
  @Min(6)
  password: string;
}

// ---- routes ----
const user = new User({ email, username, password });
// 在 entity 上定义 class-validate 生成的装饰器，可以喂给自己 “吃”
const errors = await validate(user);
if (errors.length > 0) return res.status(400).json({ errors });
```

> 为什么 typeORM 那么好用 ？

```ts
@Entity("users")
export class User extends BaseEntity {
  constructor(user: Partial<User>) {
    super();
    Object.assign(this, user);
  }

  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @IsEmail()
  @Column({ unique: true })
  email: string;

  @Index()
  @Length(3, 32, { message: "用户名最少为三个字符" })
  @Column({ unique: true })
  username: string;

  @Exclude()
  @Column()
  @Length(6, 32)
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 6);
  }

  toJSON() {
    return classToPlain(this);
  }
}
```

- `npm i jsonwebtoken cookie cookie-parser dotenv`
- `npm i -D @types/jsonwebtoken @types/cookie @types/cookie-parser`

#### 数据库

- `npm run typeorm entity:create -- --name Post`
- `npm run typeorm schema:drop`
- `npm run typeorm migration:generate -- --name create-users-table`

```ts
import { BeforeInsert, Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "typeorm";
import { makeId } from "../utils/helpers";
import Post from "./Post";
import User from "./User";

@Entity("comments")
class Comment extends BaseEntity {
  constructor(comment: Partial<Comment>) {
    super();
    Object.assign(this, comment);
  }

  @Index()
  @Column()
  identifier: string;

  @Column()
  body: string;

  @Column()
  username: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "username", referencedColumnName: "username" })
  user: User;

  @ManyToOne(() => Post, (post) => post.comments)
  post: Post;

  @BeforeInsert()
  makeId() {
    this.identifier = makeId(8);
  }
}

export default Comment;
```

> - 当关闭了同步 `"synchronize": false`，而新建了一个 `Entity` 时，主动 `npm run typeorm migration:generate -- --name create-comments-table`
> - 然后就可以执行 sql 了：`npm run typeorm migration:run`
> - 最后如果发现刚创建的表有些字段没配置好，且没有写入数据时，可以进行 `revert` 恢复操作，然后修改字段，然后重新 `generate` 和 `run`
>   - 特别注意，revert 操作会先删表，因为原操作是创建表，然后删 migrations 的该行记录
>   - 如果已经同步到线上，就不能这样搞，只能再生成一个新的 migration 操作
>   - `npm run typeorm migration:revert`
>   - 把原 `xxxxxxx-create-comments-table.ts` 先删除，因为数据库 `migrations` 里已经删除该记录，一定先确认！
>   - `npm run typeorm migration:generate -- --name create-comments-table`
>   - `npm run typeorm migration:run`
>   - 最后再检查下 数据库的 `migrations` 里到和文件夹内的文件是否一一对应

```ts
// 修改 Entity 字段
@ManyToOne(() => Post, (post) => post.comments, { nullable: false })
post: Post;
```

- 开启跨域 + 开启 cookie
- `npm i -S cors`

```js
// 前端
Axios.defaults.withCredentials = true;
```

```js
// 后端
app.use(
  cors({
    credentials: true,
    origin: process.env.ORIGIN,
    optionsSuccessStatus: 200,
  })
);

// 写入 cookie
res.set(
  "Set-Cookie",
  cookie.serialize("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 3600,
    path: "/",
  })
);
```

```ts
// 类似 mongoose 的虚拟字段，但感觉一股面向对象的味道
// Entity/Post.ts
@Expose() get url(): string {
  return `/r/${this.subName}/${this.identifier}/${this.slug}`;
}

// protected url: string;
// @AfterLoad()
// createField() {
//   this.url = `/r/${this.subName}/${this.identifier}/${this.slug}`;
// }
```

![drawSQL](assets/drawSQL.png)

```ts
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import Comment from './Comment';
import BaseEntity from './Entity';
import Post from './Post';
import User from './User';

@Entity('votes')
export default class Vote extends BaseEntity {
  constructor(vote: Partial<Vote>) {
    super();
    Object.assign(this, vote);
  }

  @Column()
  value: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'username', referencedColumnName: 'username' })
  user: User;

  @Column()
  username: string;

  @ManyToOne(() => Post)
  post: Post;

  @ManyToOne(() => Comment)
  comment: Comment;
}
```

- `npm run typeorm migration:generate -- --name create-votes-table`
- `npm run typeorm migration:run`

- **关于vote时是否用写的事务，还是用读的计算**
  - 如果单机系统开事务就算了，如果分布式还是读的计算吧

```ts
// ---- Entity/Post.ts ----
// ! 这里的意思就是把所有和这个帖子相关的vote取出来，后面计算用
@OneToMany(() => Vote, (Vote) => Vote.post)
votes: Vote[];

@Expose() get url(): string {
  return `/r/${this.subName}/${this.identifier}/${this.slug}`;
}

@Expose() get commentCount(): number {
  return this.comments?.length;
}

// ! 计算帖子的得分，有些人1、有些人-1 ...
@Expose() get voteScore(): number {
  return this.votes?.reduce((memo, curt) => memo + (curt.value || 0), 0);
}
```

- 要是开事务就开两个以上了

```ts
// for example:
await getConnection().transaction(async (tm) => {
  await tm.query(
    `
    insert into updoot ("userId", "postId", value)
    values ($1, $2, $3);
  `,
    [userId, postId, value]
  );

  await tm.query(
    `
    update post
    set points = points + $1
    where id = $2;
  `,
    [value, postId]
  );
});
```

### Client

- `npx create-next-app client`
- `yarn add --dev typescript @types/react @types/node`
- `touch tsconfig.json` 后再 `yarn dev` 会自动填入配置文件

- 修改 `_app.js` -> `_app.ts`

```typescript
import { AppProps } from "next/app";

function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default App;
```

- `yarn add tailwindcss@latest postcss@latest autoprefixer@latest`
- `npx tailwindcss init -p`

```js
module.exports = {
  purge: ["./src/pages/**/*.js", "./src/components/**/*.js"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
```

- 调色：<https://noeldelgado.github.io/shadowlord/#0079d3>
- 字体：
  - <https://fonts.google.com/>
  - tailwind.config.js
  - \_document.tsx

```js
fontFamily: {
  body: ['IBM Plex Sans'],
},
```

```jsx
<body className="font-body">
  <Main />
  <NextScript />
</body>
```

- 封装一个 Input 组件

```ts
import cls from "classnames";

interface InputGroupProps {
  className?: string;
  type?: string;
  placeholder?: string;
  value: string;
  error: string | undefined;
  setValue: (str: string) => void;
}

const InputGroup: React.FC<InputGroupProps> = ({
  className = "mb-2",
  type = "text",
  placeholder = "",
  error,
  value,
  setValue,
}) => {
  return (
    <div className={className}>
      <input
        type={type}
        className={cls(
          "w-full p-3 transition duration-200 border border-gray-400 rounded bg-gray-50 focus:bg-white hover:bg-white",
          {
            "border-red-500": error,
          }
        )}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <small className="font-medium text-red-500">{error}</small>
    </div>
  );
};

export default InputGroup;
```

- Next.js 使用 svg
  - `npm i @svgr/webpack -D`
  - `next.config.js`

```js
// next.config.js
module.exports = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      issuer: {
        test: /\.(js|ts)x?$/,
      },
      use: ["@svgr/webpack"],
    });

    return config;
  },
};
```

> #8 4:00

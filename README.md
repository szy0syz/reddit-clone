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
import { IsEmail, Min } from 'class-validator';

@Entity('users')
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
@Entity('users')
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
  @Length(3, 32, { message: '用户名最少为三个字符' })
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
import {
  BeforeInsert,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { BaseEntity } from 'typeorm';
import { makeId } from '../utils/helpers';
import Post from './Post';
import User from './User';

@Entity('comments')
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
  @JoinColumn({ name: 'username', referencedColumnName: 'username' })
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

- `npm i -S cors`

```js
app.use(
  cors({
    credentials: true,
    origin: process.env.ORIGIN,
    optionsSuccessStatus: 200
  })
);
```

### Client

- `npx create-next-app client`
- `yarn add --dev typescript @types/react @types/node`
- `touch tsconfig.json` 后再 `yarn dev` 会自动填入配置文件

- 修改 `_app.js` -> `_app.ts`

```typescript
import { AppProps } from 'next/app';

function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default App;
```

- `yarn add tailwindcss@latest postcss@latest autoprefixer@latest`
- `npx tailwindcss init -p`

```js
module.exports = {
  purge: ['./src/pages/**/*.js', './src/components/**/*.js'],
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
  - _document.tsx

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

> #8

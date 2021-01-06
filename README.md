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

> 4-17

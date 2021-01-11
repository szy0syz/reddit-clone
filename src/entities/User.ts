import { IsEmail, Length } from "class-validator";
import bcrypt from "bcrypt";
import { Exclude } from "class-transformer";
import { Index, Entity, Column, BeforeInsert, OneToMany } from "typeorm";
import BaseEntity from "./Entity";
import Post from "./Post";
import Vote from "./Vote";

@Entity("users")
export default class User extends BaseEntity {
  constructor(user: Partial<User>) {
    super();
    Object.assign(this, user);
  }

  @Index()
  @IsEmail(undefined, { message: "邮箱地址不正确" })
  @Length(1, 255, { message: "邮箱地址不能为空" })
  @Column({ unique: true })
  email: string;

  @Index()
  @Length(3, 32, { message: "用户名最少为三个字符" })
  @Column({ unique: true })
  username: string;

  @Exclude()
  @Column()
  @Length(6, 255, { message: "密码必须大于6位" })
  password: string;

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @OneToMany(() => Vote, (vote) => vote.user)
  votes: Vote[];

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 6);
  }
}

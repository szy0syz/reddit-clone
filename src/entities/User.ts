import { IsEmail, Length } from "class-validator";
import bcrypt from "bcrypt";
import { Exclude, classToPlain } from "class-transformer";
import {
  Index,
  Entity,
  Column,
  BeforeInsert,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  OneToMany,
} from "typeorm";
import BaseEntity from './Entity'
import Post from "./Post";

@Entity("users")
export default class User extends BaseEntity {
  constructor(user: Partial<User>) {
    super();
    Object.assign(this, user);
  }

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

  @OneToMany(() => Post, post => post.user)
  posts: Post[]

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 6);
  }
}

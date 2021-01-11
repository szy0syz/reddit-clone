import {
  Index,
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import BaseEntity from "./Entity";
import Post from "./Post";
import User from "./User";

@Entity("subs")
export default class Sub extends BaseEntity {
  constructor(sub: Partial<Sub>) {
    super();
    Object.assign(this, sub);
  }

  @Index()
  @Column({ unique: true })
  name: string;

  @Column()
  title: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ nullable: true })
  imageUrn: string;

  @Column({ nullable: true })
  bannerUrn: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "username", referencedColumnName: "username" })
  user: User;

  @OneToMany(() => Post, (post) => post.sub)
  posts: Post[];
}

import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import Comment from "./Comment";
import BaseEntity from "./Entity";
import Post from "./Post";
import User from "./User";

@Entity("votes")
export default class Vote extends BaseEntity {
  constructor(vote: Partial<Vote>) {
    super();
    Object.assign(this, vote);
  }

  @Column()
  value: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "username", referencedColumnName: "username" })
  user: User;

  @Column()
  username: string;

  @ManyToOne(() => Post)
  post: Post;

  @ManyToOne(() => Comment)
  comment: Comment;
}

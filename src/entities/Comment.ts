import { BeforeInsert, Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { makeId } from "../utils/helpers";
import Post from "./Post";
import User from "./User";
import BaseEntity from './Entity'

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
  username: string; // 这个 username 来自 User 实体的 username 字段

  @ManyToOne(() => User)
  @JoinColumn({ name: "username", referencedColumnName: "username" })
  user: User;

  @ManyToOne(() => Post, (post) => post.comments, { nullable: false })
  post: Post;

  @BeforeInsert()
  makeId() {
    this.identifier = makeId(8);
  }
}

export default Comment;

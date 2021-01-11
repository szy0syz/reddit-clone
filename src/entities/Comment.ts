import {
  BeforeInsert,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { makeId } from "../utils/helpers";
import Post from "./Post";
import User from "./User";
import BaseEntity from "./Entity";
import Vote from "./Vote";
import { Exclude } from "class-transformer";

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

  @Exclude()
  @OneToMany(() => Vote, (Vote) => Vote.comment)
  votes: Vote[];

  protected userVote: number;

  setUserVote(user: User) {
    // * 你到底是顶了一下还是踩了一下
    const index = this.votes?.findIndex((v) => v.username === user.username);
    this.userVote = index > -1 ? this.votes[index].value : 0;
  }

  @BeforeInsert()
  makeId() {
    this.identifier = makeId(8);
  }
}

export default Comment;

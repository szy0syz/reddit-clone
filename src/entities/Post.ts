import {
  Index,
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  OneToMany,
} from 'typeorm';
import { makeId, slugify } from '../utils/helpers';
import { Exclude, Expose } from 'class-transformer';
import BaseEntity from './Entity';
import Comment from './Comment';
import Sub from './Sub';
import User from './User';
import Vote from './Vote';

@Entity('posts')
export default class Post extends BaseEntity {
  constructor(post: Partial<Post>) {
    super();
    Object.assign(this, post);
  }

  @Index()
  @Column()
  identifier: string; // 7 Character Id

  @Column()
  title: string;

  @Index()
  @Column()
  slug: string;

  @Column({ nullable: true, type: 'text' })
  body: string;

  @Column()
  subName: string;

  @Column()
  username: string;

  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({ name: 'username', referencedColumnName: 'username' })
  user: User;

  @ManyToOne(() => Sub, (sub) => sub.posts)
  @JoinColumn({ name: 'subName', referencedColumnName: 'name' })
  sub: Sub;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  // ! 这里的意思就是把所有和这个帖子相关的vote取出来，后面计算用
  @Exclude()
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

  protected userVote: number;

  setUserVote(user: User) {
    // * 你到底是顶了一下还是踩了一下
    const index = this.votes?.findIndex((v) => v.username === user.username);
    this.userVote = index > -1 ? this.votes[index].value : 0;
  }

  // protected url: string;
  // @AfterLoad()
  // createField() {
  //   this.url = `/r/${this.subName}/${this.identifier}/${this.slug}`;
  // }

  @BeforeInsert()
  makeIdAndSlug() {
    this.identifier = makeId(7);
    this.slug = slugify(this.title);
  }
}

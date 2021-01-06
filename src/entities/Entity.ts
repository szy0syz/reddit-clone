import { Exclude, classToPlain } from "class-transformer";
import { BaseEntity, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from "typeorm";

export default abstract class Entity extends BaseEntity {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  toJSON() {
    return classToPlain(this);
  }
}

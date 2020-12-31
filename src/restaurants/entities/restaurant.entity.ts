import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToMany, ManyToOne, OneToMany, RelationId } from 'typeorm';
import { IsString, Length } from 'class-validator';
import { CoreEntity } from '../../common/entity/core.entity';
import { Category } from './category.entity';
import { User } from '../../users/entity/user.entity';
import { Dish } from './dish.entity';
import { Order } from '../../orders/entity/order.entity';
import { type } from 'os';

@InputType('RestaurantInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Restaurant extends CoreEntity {

  @Field(type => String)
  @Column()
  @IsString()
  @Length(5)
  name: string;

  @Field(type => String)
  @Column()
  @IsString()
  address: string;

  @Field(type => String)
  @Column()
  @IsString()
  coverImage: string;

  @Field(type => Category)
  @ManyToOne(type => Category, category => category.restaurants, { nullable: true, onDelete: 'SET NULL' })
  category: Category;

  @RelationId((restaurant: Restaurant) => restaurant.owner)
  ownerId: number;

  @Field(type => User, { nullable: true })
  @OneToMany(type => User, user => user.restaurants, { onDelete: 'CASCADE' })
  owner: User;

  @Field(type => [Order], { nullable: true })
  @OneToMany(type => Order, order => order.restaurant, { onDelete: 'CASCADE' })
  orders: Order[];

  @Field(type => [Dish])
  @OneToMany(type => Dish, dish => dish.restaurant)
  menu: Dish[];

  @Field(type => Boolean)
  @Column({ default: false })
  isPromoted: boolean;

  @Field(type => Date, { nullable: true })
  @Column({ nullable: true })
  promotedUntil?: Date;

}

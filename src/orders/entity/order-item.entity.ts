import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne } from 'typeorm';
import { CoreEntity } from '../../common/entity/core.entity';
import { Dish, DishChoice, DishOption } from '../../restaurants/entities/dish.entity';

@InputType('OrderItemOptionsInputType', { isAbstract: true })
@ObjectType()
export class OrderItemOption {
  @Field(type => String)
  name: string;

  @Field(type => DishChoice, { nullable: true })
  choice: DishChoice;

  @Field(type => Int, { nullable: true })
  extra?: number;
}


@InputType('OrderItemInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class OrderItem extends CoreEntity {

  @ManyToOne(type => Dish, { nullable: true, onDelete: 'CASCADE' })
  dish: Dish;

  @Field(type => [OrderItemOption], { nullable: true })
  @Column({ type: 'json', nullable: true })
  options?: OrderItemOption[];
}

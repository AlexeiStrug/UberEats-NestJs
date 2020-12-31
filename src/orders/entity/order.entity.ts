import { Field, Float, InputType, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, RelationId } from 'typeorm';
import { CoreEntity } from '../../common/entity/core.entity';
import { User } from '../../users/entity/user.entity';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { OrderItem } from './order-item.entity';
import { IsEnum, IsNumber } from 'class-validator';


export enum OrderStatus {
  Pending,
  Cooking,
  Cooked,
  PickedUp,
  Delivered,
}

registerEnumType(OrderStatus, { name: 'OrderStatus' });

@InputType('OrderInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Order extends CoreEntity {

  @RelationId((order: Order) => order.customer)
  customerId: number;

  @Field(type => User, { nullable: true })
  @ManyToOne(type => User, user => user.orders, { onDelete: 'SET NULL', nullable: true, eager: true })
  customer?: User;

  @RelationId((order: Order) => order.driver)
  driverId: number;

  @Field(type => User, { nullable: true })
  @ManyToOne(type => User, user => user.rides, { onDelete: 'SET NULL', nullable: true, eager: true })
  driver?: User;

  @Field(type => Restaurant, { nullable: true })
  @ManyToOne(type => Restaurant, restaurant => restaurant.orders, { onDelete: 'SET NULL', nullable: true, eager: true })
  restaurant?: Restaurant;

  @Field(type => [OrderItem])
  @ManyToMany(type => OrderItem)
  @JoinTable()
  items: OrderItem[];

  @Field(type => Float, { nullable: true })
  @Column({ nullable: true })
  @IsNumber()
  total?: number;

  @Field(type => OrderStatus)
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.Pending })
  @IsEnum(OrderStatus)
  status: OrderStatus;


}

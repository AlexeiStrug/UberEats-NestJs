import { CoreEntity } from '../../common/entity/core.entity';
import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { User } from '../../users/entity/user.entity';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';

@InputType('PaymentInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Payment extends CoreEntity {

  @Field(type => String)
  @Column()
  transactionId: number;

  @RelationId((payment: Payment) => payment.user)
  userId: number;

  @Field(type => User)
  @ManyToOne(type => User, user => user.payments)
  user: User;

  @Field(type => Int)
  @RelationId((payment: Payment) => payment.restaurant)
  restaurantId: number;

  @Field(type => Restaurant)
  @ManyToOne(type => Restaurant)
  restaurant: Restaurant;
}

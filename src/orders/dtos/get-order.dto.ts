import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { Order } from '../entity/order.entity';
import { CoreOutput } from '../../common/dtos/output.dto';

@InputType()
export class GetOrderInput extends PickType(Order, ['id']) {
}

@ObjectType()
export class GetOrderOutput extends CoreOutput {
  @Field(type => Order, { nullable: false })
  order?: Order;
}

import { InputType, PickType } from '@nestjs/graphql';
import { Order } from '../entity/order.entity';


@InputType()
export class OrderUpdatesInput extends PickType(Order, ['id']) {

}

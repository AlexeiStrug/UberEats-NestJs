import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entity/order.entity';
import { OrdersService } from './orders.service';
import { OrdersResolver } from './orders.resolver';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { OrderItem } from './entity/order-item.entity';
import { Dish } from '../restaurants/entities/dish.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Restaurant, Dish])],
  providers: [
    OrdersService,
    OrdersResolver,
  ],

})
export class OrdersModule {
}

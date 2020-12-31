import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entity/order.entity';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { User, UserRole } from '../users/entity/user.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { OrderItem } from './entity/order-item.entity';
import { Dish } from '../restaurants/entities/dish.entity';
import { GetOrdersInput, GetOrdersOutput } from './dtos/get-orders.dto';
import { GetOrderInput, GetOrderOutput } from './dtos/get-order.dto';
import { EditOrderInput, EditOrderOutput } from './dtos/edit-order.dto';
import { NEW_COOKED_ORDER, NEW_ORDER_UPDATE, NEW_PENDING_ORDER, PUB_SUB } from '../common/common.constancts';
import { PubSub } from 'graphql-subscriptions';
import { TakeOrderInput, TakeOrderOutput } from './dtos/take-order.dto';


@Injectable()
export class OrdersService {
  constructor(@InjectRepository(Order) private readonly orders: Repository<Order>,
              @InjectRepository(OrderItem) private readonly orderItems: Repository<OrderItem>,
              @InjectRepository(Dish) private readonly dishes: Repository<Dish>,
              @InjectRepository(Restaurant) private readonly restaurants: Repository<Restaurant>,
              @Inject(PUB_SUB) private readonly pubSub: PubSub) {
  }


  async createOrder(customer: User, { restaurantId, items }: CreateOrderInput): Promise<CreateOrderOutput> {
    try {
      const restaurant = await this.restaurants.findOne(restaurantId);
      if (!restaurant) {
        return { ok: false, error: 'Restaurant not found' };
      }

      let orderFinalPrice = 0;
      const orderItems: OrderItem[] = [];

      for (const item of items) {
        const dish = await this.dishes.findOne(item.dishId);
        if (!dish) {
          return { ok: false, error: 'Dish not found' };
        }
        let dishFinalPrice = dish.price;
        for (const itemOption of item.options) {
          const dishOption = dish.options.find(dishOption => dishOption.name === itemOption.name);
          if (dishOption) {
            if (dishOption.extra) {
              dishFinalPrice = dishFinalPrice + dishOption.extra;
            } else {
              const dishOptionChoice = dishOption.choices.find(optionChoice => optionChoice.name === itemOption.choice.name);
              if (dishOptionChoice) {
                if (dishOptionChoice.extra) {
                  dishFinalPrice = dishFinalPrice + dishOptionChoice.extra;
                }
              }
            }
          }
        }

        orderFinalPrice = orderFinalPrice + dishFinalPrice;

        const orderItem = await this.orderItems.save(this.orderItems.create({ dish, options: item.options }));
        orderItems.push(orderItem);
      }

      const order = await this.orders.save(this.orders.create({
        customer,
        restaurant,
        total: orderFinalPrice,
        items: orderItems,
      }));

      await this.pubSub.publish(NEW_PENDING_ORDER, { pendingOrders: { order, ownerId: restaurant.ownerId } });

      return { ok: true };
    } catch {
      return { ok: false, error: 'Could not create Order' };
    }
  }

  async getOrders(user: User, { status }: GetOrdersInput): Promise<GetOrdersOutput> {
    try {
      let orders: Order[];
      if (user.role === UserRole.Client) {
        orders = await this.orders.find({ where: { customer: user, ...(status && { status }) } });
      } else if (user.role === UserRole.Delivery) {
        orders = await this.orders.find({ where: { driver: user, ...(status && { status }) } });
      } else if (user.role === UserRole.Owner) {
        const restaurants = await this.restaurants.find({ where: { owner: user }, relations: ['orders'] });
        orders = restaurants.map(restaurant => restaurant.orders).flat(1);
        if (status) {
          orders = orders.filter(order => order.status === status);
        }
      }

      return { ok: true, orders };
    } catch {
      return { ok: false, error: 'Could not get Orders' };
    }

  }

  async getOrder(user: User, { id: orderId }: GetOrderInput): Promise<GetOrderOutput> {
    try {
      const order = await this.orders.findOne(orderId, { relations: ['restaurant'] });
      if (!order) {
        return { ok: false, error: 'Order not found' };
      }
      if (!this.canSeeOrder(order, user)) return { ok: false, error: 'You can see that' };

      return { ok: true, order };
    } catch {
      return { ok: false, error: 'Could not get Order' };
    }
  }

  async editOrder(user: User, { id: orderId, status }: EditOrderInput): Promise<EditOrderOutput> {
    try {
      const order = await this.orders.findOne(orderId);
      if (!order) {
        return { ok: false, error: 'Order not found' };
      }
      if (!this.canSeeOrder(order, user)) return { ok: false, error: 'You can not see that' };
      if (!this.canEditOrder(user, status)) return { ok: false, error: 'You can not do that' };

      await this.orders.save({ id: orderId, status });

      const newOrder = { ...order, status };
      if (user.role === UserRole.Owner && status === OrderStatus.Cooked) {
        await this.pubSub.publish(NEW_COOKED_ORDER, { cookedOrders: newOrder });
      }

      await this.pubSub.publish(NEW_ORDER_UPDATE, { orderUpdates: newOrder });

      return { ok: true };
    } catch {
      return { ok: false, error: 'Could not edit Order' };
    }
  }

  async takeOrder(driver: User, { id: orderId }: TakeOrderInput): Promise<TakeOrderOutput> {
    try {
      const order = await this.orders.findOne(orderId);
      if (!order) {
        return { ok: false, error: 'Order not found' };
      }
      if (order.driver) {
        return { ok: false, error: 'Order already has driver' };
      }
      await this.orders.save({ id: orderId, driver });
      await this.pubSub.publish(NEW_ORDER_UPDATE, { ...order, driver });

      return { ok: true };
    } catch {
      return { ok: false, error: 'Could not take Order' };
    }
  }

  private canSeeOrder(order: Order, user: User): boolean {
    return (order.customerId !== user.id && user.role === UserRole.Client ||
      order.driverId !== user.id && user.role === UserRole.Delivery ||
      order.restaurant.ownerId !== user.id && user.role === UserRole.Owner);
  }

  private canEditOrder(user: User, status) {
    return (user.role === UserRole.Client ||
      user.role === UserRole.Owner && status !== OrderStatus.Cooking && status !== OrderStatus.Cooked ||
      user.role === UserRole.Delivery && status !== OrderStatus.PickedUp && status !== OrderStatus.Delivered);
  }

}

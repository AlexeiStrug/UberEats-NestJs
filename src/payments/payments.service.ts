import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { LessThan, Repository } from 'typeorm';
import { CreatePaymentInput, CreatePaymentOutput } from './dtos/create-payment.dto';
import { User } from '../users/entity/user.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { GetPaymentOutput } from './dtos/get-payment.dto';
import { Interval } from '@nestjs/schedule';

@Injectable()
export class PaymentsService {
  constructor(@InjectRepository(Payment) private readonly payments: Repository<Payment>,
              @InjectRepository(Restaurant) private readonly restaurants: Repository<Restaurant>) {
  }

  async createPayment(owner: User, { transactionId, restaurantId }: CreatePaymentInput): Promise<CreatePaymentOutput> {
    try {
      const restaurant = await this.restaurants.findOne(restaurantId);
      if (!restaurant) {
        return { ok: false, error: 'Not found Restaurant' };
      }
      if (restaurant.ownerId !== owner.id) {
        return { ok: false, error: 'You are not allowed to do this' };
      }

      await this.payments.save(this.payments.create({
        transactionId,
        user: owner,
        restaurant,
      }));

      restaurant.isPromoted = true;
      const date = new Date();
      date.setDate(date.getDate() + 7);
      restaurant.promotedUntil = date;
      await this.restaurants.save(restaurant);

      return { ok: true };
    } catch {
      return { ok: false, error: 'Could not create Payment' };
    }
  }

  async getPayments(user: User): Promise<GetPaymentOutput> {
    try {
      const payments = await this.payments.find({ user: user });

      return { ok: true, payments };
    } catch {
      return { ok: false, error: 'Could not get Payments' };
    }
  }

  @Interval(200000)
  async checkPromotedRestaurants() {
    const restaurants = await this.restaurants.find({ isPromoted: true, promotedUntil: LessThan(new Date()) });
    for (const restaurant of restaurants) {
      restaurant.isPromoted = false;
      restaurant.promotedUntil = null;
      await this.restaurants.save(restaurant);
    }
  }


  // @Cron('30 * * * * *')
  // checkForPaymentsCron() {
  //   console.log('dupa.....(cron)')
  // }
  //
  // @Interval(30000)
  // checkForPaymentsInterval() {
  //   console.log('dupa.....(interval)')
  // }
}

import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Payment } from './entities/payment.entity';
import { PaymentsService } from './payments.service';
import { CreatePaymentInput, CreatePaymentOutput } from './dtos/create-payment.dto';
import { User } from '../users/entity/user.entity';
import { AuthUser } from '../auth/auth-user.decorator';
import { Role } from '../auth/role.decorator';
import { GetPaymentOutput } from './dtos/get-payment.dto';


@Resolver(of => Payment)
export class PaymentsResolver {
  constructor(private readonly paymentService: PaymentsService) {
  }

  @Mutation(returns => CreatePaymentOutput)
  @Role(['Owner'])
  createPayment(@AuthUser() owner: User,
                @Args('input') creatPaymentInput: CreatePaymentInput): Promise<CreatePaymentOutput> {
    return this.paymentService.createPayment(owner, creatPaymentInput);
  }

  @Query(returns => GetPaymentOutput)
  @Role(['Owner'])
  getPayments(@AuthUser() owner: User): Promise<GetPaymentOutput> {
    return this.paymentService.getPayments(owner);
  }
}

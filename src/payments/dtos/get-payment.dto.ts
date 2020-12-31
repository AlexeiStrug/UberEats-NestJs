import { Field, ObjectType } from '@nestjs/graphql';
import { Payment } from '../entities/payment.entity';
import { CoreOutput } from '../../common/dtos/output.dto';


@ObjectType()
export class GetPaymentOutput extends CoreOutput {
  @Field(type => [Payment], { nullable: true })
  payments?: Payment[];
}

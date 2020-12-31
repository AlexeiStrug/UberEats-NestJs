import { CoreOutput } from '../../common/dtos/output.dto';
import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { Verification } from '../entity/verification.entity';

@InputType()
export class VerifyEmailInput extends PickType(Verification, ['code']) {

}

@ObjectType()
export class VerifyEmailOutput extends CoreOutput {

}

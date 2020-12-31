import { CoreOutput } from '../../common/dtos/output.dto';
import { InputType, ObjectType, PartialType, PickType } from '@nestjs/graphql';
import { User } from '../entity/user.entity';

@InputType()
export class EditProfileInput extends PartialType(PickType(User, ['email', 'password'])) {

}

@ObjectType()
export class EditProfileOutput extends CoreOutput {

}

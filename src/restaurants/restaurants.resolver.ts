import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantInput, CreateRestaurantOutput } from './dtos/restaurant/create-restaurant.dto';
import { AuthUser } from '../auth/auth-user.decorator';
import { User } from '../users/entity/user.entity';
import { Role } from '../auth/role.decorator';
import { EditRestaurantInput, EditRestaurantOutput } from './dtos/restaurant/edit-restourant.dto';
import { DeleteRestaurantInput, DeleteRestaurantOutput } from './dtos/restaurant/delete-restaurant.dto';
import { Category } from './entities/category.entity';
import { AllCategoriesOutput } from './dtos/category/all-categories.dto';
import { CategoryInput, CategoryOutput } from './dtos/category/category.dto';
import { RestaurantsInput, RestaurantsOutput } from './dtos/restaurant/restaurants.dto';
import { RestaurantInput, RestaurantOutput } from './dtos/restaurant/restaurant.dto';
import { SearchRestaurantInput, SearchRestaurantOutput } from './dtos/restaurant/search-restaurant.dto';
import { Dish } from './entities/dish.entity';
import { CreateDishInput, CreateDishOutput } from './dtos/dish/create-dish.dto';
import { DeleteDishInput } from './dtos/dish/delete-dish.dto';
import { EditDishInput, EditDishOutput } from './dtos/dish/edit-dish.dto';

@Resolver(of => Restaurant)
export class RestaurantsResolver {

  constructor(private readonly restaurantsService: RestaurantsService) {
  }


  @Mutation(returns => CreateRestaurantOutput)
  @Role(['Owner'])
  createRestaurant(@Args('input') createRestaurantInput: CreateRestaurantInput,
                   @AuthUser() authUser: User): Promise<CreateRestaurantOutput> {
    return this.restaurantsService.createRestaurant(authUser, createRestaurantInput);
  }


  @Mutation(returns => EditRestaurantOutput)
  @Role(['Owner'])
  editRestaurant(@AuthUser() authUser: User,
                 @Args('input') editRestaurantInput: EditRestaurantInput): Promise<EditRestaurantOutput> {
    return this.restaurantsService.editRestaurant(authUser, editRestaurantInput);
  }

  @Mutation(returns => EditRestaurantOutput)
  @Role(['Owner'])
  deleteRestaurant(@AuthUser() authUser: User,
                   @Args('input') deleteRestaurantInput: DeleteRestaurantInput): Promise<DeleteRestaurantOutput> {
    return this.restaurantsService.deleteRestaurant(authUser, deleteRestaurantInput);

  }

  @Query(returns => RestaurantsOutput)
  restaurants(@Args('input') restaurantsInput: RestaurantsInput): Promise<RestaurantsOutput> {
    return this.restaurantsService.allRestaurants(restaurantsInput);
  }

  @Query(returns => RestaurantOutput)
  restaurant(@Args('input') restaurantInput: RestaurantInput): Promise<RestaurantOutput> {
    return this.restaurantsService.findRestaurantById(restaurantInput);
  }

  @Query(returns => SearchRestaurantOutput)
  searchRestaurant(@Args('input') searchRestaurantInput: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
    return this.restaurantsService.searchRestaurantByName(searchRestaurantInput);
  }
}


@Resolver(of => Category)
export class CategoryResolver {
  constructor(private readonly restaurantService: RestaurantsService) {
  }

  @ResolveField(type => Int)
  restaurantCount(@Parent() category: Category): Promise<number> {
    return this.restaurantService.countRestaurants(category);
  }


  @Query(type => AllCategoriesOutput)
  allCategories(): Promise<AllCategoriesOutput> {
    return this.restaurantService.allCategories();
  }

  @Query(type => CategoryOutput)
  category(@Args() categoryInput: CategoryInput): Promise<CategoryOutput> {
    return this.restaurantService.findCategoryBySlug(categoryInput);
  }
}

@Resolver(of => Dish)
export class DishResolver {
  constructor(private readonly restaurantService: RestaurantsService) {
  }


  @Mutation(type => CreateDishOutput)
  @Role(['Owner'])
  createDish(@AuthUser() authUser: User,
             @Args('input') createDishInput: CreateDishInput): Promise<CreateDishOutput> {
    return this.restaurantService.createDish(authUser, createDishInput);
  }

  @Mutation(type => EditDishOutput)
  @Role(['Owner'])
  editDish(@AuthUser() authUser: User,
           @Args('input') editDishInput: EditDishInput): Promise<EditDishOutput> {
    return this.restaurantService.editDish(authUser, editDishInput);
  }

  @Mutation(type => DeleteRestaurantOutput)
  @Role(['Owner'])
  deleteDish(@AuthUser() authUser: User,
             @Args('input') deleteRestaurantInput: DeleteDishInput): Promise<DeleteRestaurantOutput> {
    return this.restaurantService.deleteDish(authUser, deleteRestaurantInput);
  }
}

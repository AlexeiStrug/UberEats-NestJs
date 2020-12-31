import { Injectable } from '@nestjs/common';
import { Restaurant } from './entities/restaurant.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Like, Raw, Repository } from 'typeorm';
import { CreateRestaurantInput, CreateRestaurantOutput } from './dtos/restaurant/create-restaurant.dto';
import { User } from '../users/entity/user.entity';
import { Category } from './entities/category.entity';
import { EditRestaurantInput, EditRestaurantOutput } from './dtos/restaurant/edit-restourant.dto';
import { CategoryRepository } from './repositories/category.repository';
import { DeleteRestaurantInput, DeleteRestaurantOutput } from './dtos/restaurant/delete-restaurant.dto';
import { AllCategoriesOutput } from './dtos/category/all-categories.dto';
import { CategoryInput, CategoryOutput } from './dtos/category/category.dto';
import { RestaurantsInput, RestaurantsOutput } from './dtos/restaurant/restaurants.dto';
import { RestaurantInput, RestaurantOutput } from './dtos/restaurant/restaurant.dto';
import { SearchRestaurantInput, SearchRestaurantOutput } from './dtos/restaurant/search-restaurant.dto';
import { CreateDishInput, CreateDishOutput } from './dtos/dish/create-dish.dto';
import { Dish } from './entities/dish.entity';
import { EditDishInput, EditDishOutput } from './dtos/dish/edit-dish.dto';
import { DeleteDishInput } from './dtos/dish/delete-dish.dto';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant) private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Dish) private readonly dishes: Repository<Dish>,
    private readonly categories: CategoryRepository,
  ) {
  }

  async createRestaurant(owner: User, createRestaurantInput: CreateRestaurantInput): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant = await this.restaurants.create(createRestaurantInput);
      newRestaurant.owner = owner;

      const category = await this.categories.getOrCreate(createRestaurantInput.categoryName);
      newRestaurant.category = category;

      await this.restaurants.save(newRestaurant);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: 'Could not create restaurant' };
    }
  }

  async editRestaurant(owner: User, editRestaurantInput: EditRestaurantInput): Promise<EditRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOneOrFail(editRestaurantInput.restaurantId, { loadRelationIds: true });

      if (!restaurant) {
        return { ok: false, error: 'Restaurant not found' };
      }
      if (owner.id !== restaurant.ownerId) {
        return { ok: false, error: 'You can not edit restaurant that you do not own' };
      }

      let category: Category = null;
      if (editRestaurantInput.categoryName) {
        category = await this.categories.getOrCreate(editRestaurantInput.categoryName);
      }

      await this.restaurants.save([{
        id: editRestaurantInput.restaurantId,
        ...editRestaurantInput,
        ...(category && { category }),
      }]);

      return { ok: true };
    } catch (error) {
      return { ok: false, error: 'Could not update restaurant' };
    }
  }

  async deleteRestaurant(owner: User, { restaurantId }: DeleteRestaurantInput): Promise<DeleteRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(restaurantId);

      if (!restaurant) {
        return { ok: false, error: 'Restaurant not found' };
      }
      if (owner.id !== restaurant.ownerId) {
        return { ok: false, error: 'You can not delete a restaurant that you do not own' };
      }

      await this.restaurants.delete(restaurantId);

      return { ok: true };
    } catch (error) {
      return { ok: false, error: 'You can not delete a restaurant' };
    }
  }

  async allRestaurants({ page }: RestaurantsInput): Promise<RestaurantsOutput> {
    try {
      const [restaurants, totalResult] = await this.restaurants.findAndCount({
        skip: (page - 1),
        take: 25,
        order: { isPromoted: 'DESC' },
      });

      return { ok: true, results: restaurants, totalPages: Math.ceil(totalResult / 25), totalResult };
    } catch (e) {
      return { ok: false, error: 'Could not load restaurants' };
    }
  }

  async findRestaurantById({ restaurantId }: RestaurantInput): Promise<RestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(restaurantId, { relations: ['menu'] });
      if (!restaurant) {
        return { ok: false, error: 'Restaurant not found' };
      }
      return { ok: true, restaurant };
    } catch {
      return { ok: false, error: 'Could not find restaurant' };
    }
  }

  async searchRestaurantByName({ query, page }: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
    try {
      const [restaurants, totalResult] = await this.restaurants.findAndCount({
        where: { name: Raw(name => `${name} ILIKE '%${query}%'`) },
        skip: (page - 1),
        take: 25,
      });

      return { ok: true, restaurants, totalPages: Math.ceil(totalResult / 25), totalResult };
    } catch {
      return { ok: false, error: 'Could not search for restaurant' };
    }
  }

  async allCategories(): Promise<AllCategoriesOutput> {
    try {
      const categories = await this.categories.find();

      return { ok: true, categories };
    } catch (error) {
      return { ok: false, error: 'Could not load categories' };
    }
  }

  async countRestaurants(category: Category) {
    return await this.restaurants.count({ category });
  }

  async findCategoryBySlug({ slug, page }: CategoryInput): Promise<CategoryOutput> {
    try {
      const category = await this.categories.findOne({ slug });

      if (!category) {
        return { ok: false, error: 'Category not found' };
      }

      const restaurants = await this.restaurants.find({
        where: { category },
        take: 25,
        skip: (page - 1) * 25,
        order: { isPromoted: 'DESC' },
      });
      category.restaurants = restaurants;

      const totalResults = await this.countRestaurants(category);

      return { ok: true, category, totalPages: Math.ceil(totalResults / 25) };
    } catch (e) {
      return { ok: false, error: 'Could not load category' };
    }
  }

  async createDish(owner: User, createDishInput: CreateDishInput): Promise<CreateDishOutput> {
    try {
      const restaurant = await this.restaurants.findOne(createDishInput.restaurantId);
      if (!restaurant) {
        return { ok: false, error: 'Restaurant not found' };
      }
      if (owner.id !== restaurant.ownerId) {
        return { ok: false, error: 'You can not do that' };
      }

      await this.dishes.save(this.dishes.create({ ...createDishInput, restaurant }));

      return { ok: true };
    } catch {
      return { ok: false, error: 'Could not create dish' };
    }
  }

  async editDish(owner: User, editDishInput: EditDishInput): Promise<EditDishOutput> {
    try {
      const dish = await this.dishes.findOne(editDishInput.dishId, { relations: ['restaurant'] });
      if (!dish) {
        return { ok: false, error: 'Dish not found' };
      }
      if (owner.id !== dish.restaurant.ownerId) {
        return { ok: false, error: 'You can not do that' };
      }

      await this.dishes.save([{ id: editDishInput.dishId, ...editDishInput }]);

      return { ok: true };
    } catch {
      return { ok: false, error: 'Could not edit dish' };
    }
  }

  async deleteDish(owner: User, { dishId }: DeleteDishInput): Promise<DeleteRestaurantOutput> {
    try {
      const dish = await this.dishes.findOne(dishId, { relations: ['restaurant'] });
      if (!dish) {
        return { ok: false, error: 'Dish not found' };
      }
      if (owner.id !== dish.restaurant.ownerId) {
        return { ok: false, error: 'You can not do that' };
      }

      await this.dishes.delete(dishId);

      return { ok: true };
    } catch {
      return { ok: false, error: 'Could not delete dish' };
    }
  }
}

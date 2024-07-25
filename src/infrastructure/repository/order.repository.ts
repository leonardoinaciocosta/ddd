import Order from "../../domain/entity/order";
import OrderModel from "../db/sequelize/model/order.model";
import OrderRepositoryInterface from "../../domain/repository/order-repository.interface";
import OrderItemModel from "../db/sequelize/model/order-item.model";
import OrderItem from "../../domain/entity/order_item";

export default class OrderRepository implements OrderRepositoryInterface {
    async create(entity: Order): Promise<void> {
        await OrderModel.create(
        {
            id: entity.id,
            customer_id: entity.customerId,
            total: entity.total(),
            items: entity.items.map((item) => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    product_id: item.productId,
                    quantity: item.quantity,
                })),
        },
        {
            include: [{ model: OrderItemModel }],
        }
        );
    }

    async update(entity: Order): Promise<void> {
        const order = await OrderModel.findOne({
            where: { id: entity.id },
            include: ["items"],
          });
      
          await OrderModel.update(
            {
              total: entity.total(),
            },
            {
              where: { id: entity.id },
            }
          );
      
          await OrderItemModel.destroy({ where: { order_id: entity.id } });
      
          for (const item of entity.items) {
            await OrderItemModel.create({
              id: item.id,
              name: item.name,
              price: item.price,
              product_id: item.productId,
              quantity: item.quantity,
              order_id: entity.id,
            });
          }
    }

    async find(id: string): Promise<Order> {
        let orderModel;

        try {
            orderModel = await OrderModel.findOne({
                where: {
                    id,
                },
                rejectOnEmpty: true,
                include: ["items"],
            });
        } catch (error) {
            throw new Error("Order not found");
        }

        let items : OrderItem[] = [];

        orderModel.items.forEach(item => {
            let orderItem = new OrderItem(item.id,
                item.name,
                item.price,
                item.product_id,
                item.quantity);

            items.push(orderItem);
        });
        
        const order= new Order(id, orderModel.customer_id, items);

        return order;
    }

    async findAll(): Promise<Order[]> {
        const orderModels = await OrderModel.findAll(
            {include: ["items"]}
        );

        const orders = orderModels.map((orderModels) => {
            let items : OrderItem[] = [];

            orderModels.items.forEach(item => {
                let orderItem = new OrderItem(item.id,
                    item.name,
                    item.price,
                    item.product_id,
                    item.quantity);
    
                items.push(orderItem);
            });
            
            const order= new Order(orderModels.id, orderModels.customer_id, items);

            return order;
        });

        return orders;
    }
}
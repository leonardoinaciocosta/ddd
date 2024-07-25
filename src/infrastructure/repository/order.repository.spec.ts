import { Sequelize } from "sequelize-typescript";
import Customer from "../../domain/entity/customer";
import Address from "../../domain/entity/address";
import CustomerRepository from "./customer.repository";
import CustomerModel from "../db/sequelize/model/customer.model";
import Order from "../../domain/entity/order";
import OrderItem from "../../domain/entity/order_item";
import ProductRepository from "./product.repository";
import Product from "../../domain/entity/product";
import ProductModel from "../db/sequelize/model/product.model";
import OrderItemModel from "../db/sequelize/model/order-item.model";
import OrderModel from "../db/sequelize/model/order.model";
import OrderRepository from "./order.repository";

async function createCustomer() {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.Address = address;
    await customerRepository.create(customer);

    return customer;

}

async function createProduct() {
  const productRepository = new ProductRepository();
  const product = new Product("1", "Product 1", 100);
  await productRepository.create(product);
  
  return product;
}

describe("Order repository test", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    await sequelize.addModels([OrderModel, CustomerModel, ProductModel, OrderItemModel]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should create an order", async () => {
    // Criar cliente
    const customer = await createCustomer();

    // Criar produto
    const product = await createProduct();

    // Criar pedido
    const ordemItem1 = new OrderItem("1", "Produto 1", 123, "1", 1);
    const order = new Order("1", "123", [ordemItem1]);
    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne(
      {
        where: { id: "1" },
        include: ["items"], 
      }
    );
    
    expect(orderModel.toJSON()).toStrictEqual({
      id: order.id,
      customer_id: order.customerId,
      items : [
        {
            id: ordemItem1.id,
            name: ordemItem1.name,
            order_id: order.id,
            price: ordemItem1.price,
            product_id: ordemItem1.productId,
            quantity: ordemItem1.quantity
        }
      ],
      total: order.total()
    });
  });

  it("should update an order", async () => {
    // Criar cliente
    const customer = await createCustomer();

    // Criar produto
    const product = await createProduct();

    // Criar pedido
    const orderRepository = new OrderRepository();
    const ordemItem1 = new OrderItem("5", "Produto 1", 123, "1", 1);
    
    const order = new Order("1", "123", [ordemItem1]);
    await orderRepository.create(order);
    
    // Adicionar novo item ao pedido
    const ordemItem2 = new OrderItem("6", "Produto 2", 15, "1", 1);
    order.addItem(ordemItem2);

    await orderRepository.update(order);
    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: order.id,
      customer_id: order.customerId,
      total: order.total(),
      items : [
        {
            id: ordemItem1.id,
            name: ordemItem1.name,
            price: ordemItem1.price,
            product_id: ordemItem1.productId,
            quantity: ordemItem1.quantity,
            order_id: order.id
        },
        {
          id: ordemItem2.id,
          name: ordemItem2.name,
          price: ordemItem2.price,
          product_id: ordemItem2.productId,
          quantity: ordemItem2.quantity,
          order_id: order.id
        }
      ]
    });
  });

  it("should find an order", async () => {
    // Criar cliente
    const customer = await createCustomer();

    // Criar produto
    const product = await createProduct();

    // Criar pedido
    const orderRepository = new OrderRepository();
    const ordemItem1 = new OrderItem("5", "Produto 1", 123, "1", 1);
    
    const order1 = new Order("1", "123", [ordemItem1]);
    await orderRepository.create(order1);

    const ordemItem2 = new OrderItem("6", "Produto 2", 123, "1", 1);
    const order2 = new Order("2", "123", [ordemItem2]);
    await orderRepository.create(order2);

    const ordemItem3 = new OrderItem("7", "Produto 3", 123, "1", 1);
    const order3 = new Order("3", "123", [ordemItem3]);
    await orderRepository.create(order3);

    const orderResult = await orderRepository.find(order1.id);

    expect(order1).toStrictEqual(orderResult);
  });

  it("should throw an error when order is not found", async () => {
    const orderRepository = new OrderRepository();

    expect(async () => {
      await orderRepository.find("777");
    }).rejects.toThrow("Order not found");
  });

  it("should find all orders", async () => {
    // Criar cliente
    const customer = await createCustomer();

    // Criar produto
    const product = await createProduct();

    // Criar pedido
    const orderRepository = new OrderRepository();
    const ordemItem1 = new OrderItem("5", "Produto 1", 123, "1", 1);
    
    const order1 = new Order("1", "123", [ordemItem1]);
    await orderRepository.create(order1);

    const ordemItem2 = new OrderItem("6", "Produto 2", 123, "1", 1);
    const order2 = new Order("2", "123", [ordemItem2]);
    await orderRepository.create(order2);

    const ordemItem3 = new OrderItem("7", "Produto 3", 123, "1", 1);
    const order3 = new Order("3", "123", [ordemItem3]);
    await orderRepository.create(order3);

    const orders = await orderRepository.findAll();

    expect(orders).toHaveLength(3);
    expect(orders).toContainEqual(order1);
    expect(orders).toContainEqual(order2);
    expect(orders).toContainEqual(order3);
  });
});
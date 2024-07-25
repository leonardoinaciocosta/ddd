import Address from "./domain/entity/address";
import Customer from "./domain/entity/customer";
import Order from "./domain/entity/order";
import OrdemItem from "./domain/entity/order_item";

const address = new Address("SQS 306", 602, "DF", "70238-070");
let customer = new Customer("123", "Leonardo Inacio");
customer.changeAddress(address);
customer.activate();

const item1 = new OrdemItem("1", "Item 1", 123, "1", 2);
const item2 = new OrdemItem("2", "Item 2", 456, "1", 2);
const order = new Order("1", "123", [item1, item2]);
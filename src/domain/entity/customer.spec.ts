import Address from "./address";
import Customer from "./customer";

describe("Customer unit tests", () => {
    it("should throw error when Id is required", ()=>{
        expect(()=>{
            let customer = new Customer("", "Joao");
        }).toThrowError("Id is required");
    });


    it("should create a customer", () => {
        const address = new Address("Rua 1", 123, "72000-000", "DF");
        const customer = new Customer("1", "Cliente 1");
        customer.changeAddress(address);
        expect(customer.name).toBe("Cliente 1");
        expect(customer.Address.street).toBe("Rua 1");
        expect(customer.Address.number).toBe(123);
        expect(customer.Address.city).toBe("DF");
  });
});
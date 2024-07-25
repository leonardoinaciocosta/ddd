import EnviaConsoleLogHandler from "../customer/handler/envia-console-log.handler";
import EnviaConsoleLog1Handler from "../customer/handler/envia-console-log1.handler";
import EnviaConsoleLog2Handler from "../customer/handler/envia-console-log2.handler";
import EventDispatcherInterface from "./event-dispatcher.interface";
import EventHandlerInterface from "./event-handler.interface";
import eventInterface from "./event.interface";

export default class EventDispatcher implements EventDispatcherInterface {
  static eventDispatcher : EventDispatcher;
  private eventHandlers: { [eventName: string]: EventHandlerInterface[] } = {};

  get getEventHandlers(): { [eventName: string]: EventHandlerInterface[] } {
    return this.eventHandlers;
  }

  register(eventName: string, eventHandler: EventHandlerInterface): void {
    if (!this.eventHandlers[eventName]) {
      this.eventHandlers[eventName] = [];
    }
    this.eventHandlers[eventName].push(eventHandler);
  }

  unregister(eventName: string, eventHandler: EventHandlerInterface): void {
    if (this.eventHandlers[eventName]) {
      const index = this.eventHandlers[eventName].indexOf(eventHandler);
      if (index !== -1) {
        this.eventHandlers[eventName].splice(index, 1);
      }
    }
  }

  unregisterAll(): void {
    this.eventHandlers = {};
  }

  notify(event: eventInterface): void {
    const eventName = event.constructor.name;
    if (this.eventHandlers[eventName]) {
      this.eventHandlers[eventName].forEach((eventHandler) => {
        eventHandler.handle(event);
      });
    }
  }

  static getEventDispatcher() : EventDispatcher {
    if (!this.eventDispatcher) {
      this.eventDispatcher = this.createEventDispatcher();
    }

    return this.eventDispatcher;
  }

  private static createEventDispatcher() : EventDispatcher {
    this.eventDispatcher = new EventDispatcher();
    const eventHandler1 = new EnviaConsoleLog1Handler();
    this.eventDispatcher.register("CustomerCreatedEvent", eventHandler1);
    const eventHandler2 = new EnviaConsoleLog2Handler();
    this.eventDispatcher.register("CustomerCreatedEvent", eventHandler2);
    const eventHandler3 = new EnviaConsoleLogHandler();
    this.eventDispatcher.register("AddressChangedEvent", eventHandler3);

    return this.eventDispatcher;
  }
}
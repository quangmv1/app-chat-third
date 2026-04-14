export enum PSBusEvent {
  MQTT_CONNECTED = 'MQTT_CONNECTED',
  MQTT_MESSAGE_RECEIVED = 'MQTT_MESSAGE_RECEIVED',
  NEW_MESSAGE = 'NEW_MESSAGE',
  NEW_PIN_MESSAGE = 'NEW_PIN_MESSAGE',
  NEW_UNPIN_MESSAGE = 'NEW_UNPIN_MESSAGE',
  SCROLL_TO_MESSAGE = 'SCROLL_TO_MESSAGE',
  SEEN_MESSAGE = 'SEEN_MESSAGE',
  USER_TYPING = 'USER_TYPING',
  USER_REACT = 'USER_REACT',
  USER_UNREACT = 'USER_UNREACT',
  USER_SEEN = 'USER_SEEN',
  USER_VOTE = 'USER_VOTE',
  USER_UNVOTE = 'USER_UNVOTE',
  USER_ADD_OPTION_VOTE = 'USER_ADD_OPTION_VOTE',
  LEAVE_THREAD = 'LEAVE_THREAD',
  DELETE_THREAD_BOTH = 'DELETE_THREAD_BOTH',
  SWITCH_USER = 'SWITCH_USER',
}

type PSEventBusCallback = (data?: any) => void;

export class PSEventBus {
  private static instance?: PSEventBus;

  private eventHandler: {[key: string]: PSEventBusCallback[]} = {};

  subscribe(event: string, cb: PSEventBusCallback): {unsubscribe: () => void} {
    const array = this.eventHandler[event];
    if (array) {
      array.push(cb);
    } else {
      this.eventHandler[event] = [cb];
    }
    return {
      unsubscribe: () => this.unsubscribe(event, cb),
    };
  }

  dispatch(event: string, data?: any) {
    this.eventHandler[event]?.forEach(func => func(data));
  }

  unsubscribe(event: string, cb: PSEventBusCallback) {
    const array = this.eventHandler[event];
    if (array) {
      const index = array.indexOf(cb);
      if (index > -1) {
        array.splice(index, 1);
      }
    }
  }

  public static getInstance(): PSEventBus {
    if (!PSEventBus.instance) {
      PSEventBus.instance = new PSEventBus();
    }
    return PSEventBus.instance;
  }
}

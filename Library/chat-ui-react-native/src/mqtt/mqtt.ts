//#conditional

import { IMQTTClient } from '@communi/mqtt-client-interface-typescript';
import { PSBusEvent, PSEventBus, createMQTTClient, psLogger } from '../utils';
import { PSMqttEvent } from './types';

export class PSMqttClient {
  private static instance?: PSMqttClient;

  private mqtt?: IMQTTClient;

  private userId?: string;

  private closePromise: Promise<void> | undefined;

  private async create(
    appId: string,
    userId: string,
    jwt: string,
  ): Promise<void> {
    this.userId = userId;




    // //#if PRODUCTION
    // host = `${appId}.mqtt.piscale.com`;
    // //#else
    // host = `${appId}.staging-mqtt.piscale.com`;
    // //#endif

    let host = `${appId}.mqtt.piscale.com`;
    // host = `${appId}.staging-mqtt.piscale.com`; // Dùng cho môi trường staging nếu cần

    console.log(`DEBUG MQTT: Creating client - Host: ${host}, ClientID: piscale-react-native-${userId}-...`);
    const mqtt = await createMQTTClient({
      clientId: `piscale-react-native-${userId}-${new Date().getTime()}`,
      host: host,
      port: 8883,
      tls: true,
      username: userId,
      password: jwt,
      keepAlive: 30,
      connectionTimeout: 10000,
      cleanSession: true,
      autoReconnect: true,
      maxReconnectTimeInterval: 5,
      //#if DEVELOPMENT
      debug: true,
      //#endif
    });

    this.mqtt = mqtt;

    this.listen();
  }

  private listen() {
    if (!this.mqtt) {
      return;
    }
    this.mqtt
      .onConnecting(() => {
        psLogger.info('PSMqttClient: onConnecting');
      })
      .onConnected(async (reconnect: boolean) => {
        psLogger.info(`PSMqttClient: onConnected: reconnect = ${reconnect}`);
        PSEventBus.getInstance().dispatch(PSBusEvent.MQTT_CONNECTED, true);
      })
      .onConnectError(errorMessage => {
        psLogger.info(`PSMqttClient: onConnectError: ${errorMessage}`);
      })
      .onSubscribed(topic => {
        psLogger.info(`PSMqttClient: onSubscribed: ${topic}`);
      })
      .onUnsubscribed(topic => {
        psLogger.info(`PSMqttClient: onUnsubscribed: ${topic}`);
      })
      .onMessageReceived((topic: string, payload: string, retain: boolean) => {
        let event: PSMqttEvent | undefined;
        try {
          event = JSON.parse(payload) as PSMqttEvent;
          event.topic = topic;
          event.retain = retain;
          PSEventBus.getInstance().dispatch(
            PSBusEvent.MQTT_MESSAGE_RECEIVED,
            event,
          );
        } catch (e) {
          psLogger.error('PSMqttClient: onMessageReceived: ', e);
          return;
        }
      })
      .onMessagePublished((topic, payload) => {
        psLogger.info(
          `PSMqttClient: onMessagePublished: topic = ${topic} -> payload = ${payload}`,
        );
      })
      .onConnectionLost(manualDisconnect => {
        PSEventBus.getInstance().dispatch(PSBusEvent.MQTT_CONNECTED, false);
        psLogger.info(
          `PSMqttClient: onConnectionLost: manualDisconnect = ${manualDisconnect}`,
        );
      })
      .onDisconnected(() => {
        PSEventBus.getInstance().dispatch(PSBusEvent.MQTT_CONNECTED, false);
        psLogger.info('PSMqttClient: onDisconnected');
      })
      .onException((errorMsg?: string) => {
        psLogger.info(`PSMqttClient: onException: errorMsg = ${errorMsg}`);
      });
  }

  async subscribeDefaultTopic() {
    if (!this.mqtt || !this.userId) {
      return;
    }
    try {
      await this.mqtt.subscribe({
        topic: `v1/users/${this.userId}/events`,
        qos: 0,
      });
    } catch (e) {
      psLogger.error('PSMqttClient: subscribeDefaultTopic', e);
    }
  }

  async subscribe(topic: string) {
    if (!this.mqtt) {
      return;
    }
    try {
      await this.mqtt.subscribe({
        topic: topic,
        qos: 0,
      });
    } catch (e) {
      psLogger.error(`PSMqttClient: subscribe topic = ${topic}`, e);
      throw e;
    }
  }

  async unsubscribe(topic: string) {
    if (!this.mqtt) {
      return;
    }
    try {
      await this.mqtt.unsubscribe(topic);
    } catch (e) {
      psLogger.error(`PSMqttClient: unsubscribe topic = ${topic}`, e);
      throw e;
    }
  }

  async isConnected() {
    if (!this.mqtt) {
      return false;
    }
    if (this.closePromise) {
      await this.closePromise;
      return false;
    }
    return await this.mqtt.isConnected();
  }

  async connect() {
    if (!this.mqtt) {
      return;
    }
    const isConnected = await this.isConnected();
    if (!isConnected) {
      if (this.closePromise) {
        await this.closePromise;
        return;
      }
      if (this.mqtt) {
        await this.mqtt.connect();
      }
    }
  }

  private async closeInternal() {
    if (!this.mqtt) {
      psLogger.info('PSMqttClient already closed');
      return;
    }
    psLogger.info('PSMqttClient closing');
    try {
      await this.mqtt.close();
    } catch (error) {
      psLogger.info('PSMqttClient: close', error);
    } finally {
      psLogger.info('PSMqttClient closed');
      this.userId = undefined;
      this.mqtt = undefined;
      PSMqttClient.instance = undefined;
    }
  }

  async close() {
    if (this.closePromise) {
      await this.closePromise;
    } else {
      this.closePromise = this.closeInternal();
      await this.closePromise;
      this.closePromise = undefined;
    }
  }

  public static async newInstance(
    appId: string,
    userId: string,
    jwt: string,
  ): Promise<PSMqttClient> {
    if (PSMqttClient.instance) {
      if (PSMqttClient.instance.closePromise) {
        await PSMqttClient.instance.closePromise;
      } else {
        await PSMqttClient.instance.close();
      }
    }
    if (!PSMqttClient.instance) {
      PSMqttClient.instance = new PSMqttClient();
      await PSMqttClient.instance.create(appId, userId, jwt);
    }
    return PSMqttClient.instance;
  }
}

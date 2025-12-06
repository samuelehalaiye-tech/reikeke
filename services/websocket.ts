import AsyncStorage from "@react-native-async-storage/async-storage";

export interface LocationUpdate {
  driver_id: number;
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string;
}

export interface RideUpdate {
  ride_id: number;
  status: string;
  driver_id?: number;
  passenger_id?: number;
  message?: string;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private listeners: Map<string, Set<Function>> = new Map();

  constructor(baseUrl: string = "192.168.1.100:8000") {
    // Convert http to ws
    const wsUrl = baseUrl.replace("http://", "ws://").replace("https://", "wss://");
    this.url = `ws://${wsUrl}/ws`;
  }

  async connect(rideId?: number | string) {
    return new Promise((resolve, reject) => {
      try {
        let wsUrl = this.url;

        if (rideId) {
          wsUrl += `/ride/${rideId}/`;
        }

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log("WebSocket connected");
          this.reconnectAttempts = 0;
          this.emit("connected", { message: "Connected to server" });
          resolve(true);
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error("Failed to parse WebSocket message:", error);
          }
        };

        this.ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          this.emit("error", { message: "Connection error" });
          reject(error);
        };

        this.ws.onclose = () => {
          console.log("WebSocket disconnected");
          this.emit("disconnected", { message: "Disconnected from server" });
          this.attemptReconnect(rideId);
        };
      } catch (error) {
        console.error("Failed to create WebSocket:", error);
        reject(error);
      }
    });
  }

  private handleMessage(data: any) {
    if (data.type === "location_update") {
      this.emit("location_update", data as LocationUpdate);
    } else if (data.type === "ride_update") {
      this.emit("ride_update", data as RideUpdate);
    } else if (data.type === "offer") {
      this.emit("offer", data);
    } else if (data.type === "message") {
      this.emit("message", data);
    }
  }

  private attemptReconnect(rideId?: number | string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);

      setTimeout(() => {
        this.connect(rideId).catch((error) => {
          console.error("Reconnection failed:", error);
        });
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn("WebSocket not connected");
    }
  }

  subscribe(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
let wsServiceInstance: WebSocketService | null = null;

export function getWebSocketService(): WebSocketService {
  if (!wsServiceInstance) {
    wsServiceInstance = new WebSocketService();
  }
  return wsServiceInstance;
}

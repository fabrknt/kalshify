// Kalshi API Client
// Reference: https://trading-api.readme.io/reference

import axios, { AxiosInstance } from 'axios';
import {
  KalshiMarket,
  KalshiEvent,
  KalshiSeries,
  KalshiOrderbook,
  KalshiTrade,
  KalshiHistoricalPrice,
  KalshiExchangeStatus,
  MarketsResponse,
  EventResponse,
  EventsResponse,
  SeriesResponse,
  OrderbookResponse,
  TradesResponse,
  HistoryResponse,
  MarketsQueryParams,
  EventsQueryParams,
  TradesQueryParams,
  HistoryQueryParams,
} from './types';

const PROD_BASE_URL = 'https://api.elections.kalshi.com/trade-api/v2';
const DEMO_BASE_URL = 'https://demo-api.kalshi.co/trade-api/v2';

export interface KalshiClientConfig {
  apiKey?: string;
  apiSecret?: string;
  useSandbox?: boolean;
}

export class KalshiClient {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor(config: KalshiClientConfig = {}) {
    const useSandbox = config.useSandbox ?? process.env.KALSHI_USE_SANDBOX === 'true';
    this.baseUrl = useSandbox ? DEMO_BASE_URL : PROD_BASE_URL;

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth header if credentials provided
    if (config.apiKey) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${config.apiKey}`;
    }
  }

  // Exchange Status
  async getExchangeStatus(): Promise<KalshiExchangeStatus> {
    const response = await this.client.get('/exchange/status');
    return response.data;
  }

  // Markets
  async getMarkets(params: MarketsQueryParams = {}): Promise<MarketsResponse> {
    const response = await this.client.get('/markets', { params });
    return response.data;
  }

  async getMarket(ticker: string): Promise<KalshiMarket> {
    const response = await this.client.get(`/markets/${ticker}`);
    return response.data.market;
  }

  async getMarketOrderbook(ticker: string): Promise<KalshiOrderbook> {
    const response = await this.client.get<OrderbookResponse>(`/markets/${ticker}/orderbook`);
    return response.data.orderbook;
  }

  async getMarketTrades(ticker: string, params: TradesQueryParams = {}): Promise<TradesResponse> {
    const response = await this.client.get(`/markets/${ticker}/trades`, { params });
    return response.data;
  }

  async getMarketHistory(params: HistoryQueryParams): Promise<HistoryResponse> {
    const { ticker, ...queryParams } = params;
    const response = await this.client.get(`/markets/${ticker}/history`, { params: queryParams });
    return response.data;
  }

  // Events
  async getEvents(params: EventsQueryParams = {}): Promise<EventsResponse> {
    const response = await this.client.get('/events', { params });
    return response.data;
  }

  async getEvent(eventTicker: string, withNestedMarkets = true): Promise<KalshiEvent> {
    const response = await this.client.get<EventResponse>(`/events/${eventTicker}`, {
      params: { with_nested_markets: withNestedMarkets },
    });
    return response.data.event;
  }

  // Series
  async getSeries(seriesTicker: string): Promise<KalshiSeries> {
    const response = await this.client.get<SeriesResponse>(`/series/${seriesTicker}`);
    return response.data.series;
  }

  // Convenience methods for fetching all markets with pagination
  async getAllMarkets(params: Omit<MarketsQueryParams, 'cursor'> = {}): Promise<KalshiMarket[]> {
    const allMarkets: KalshiMarket[] = [];
    let cursor: string | undefined;

    do {
      const response = await this.getMarkets({ ...params, cursor });
      allMarkets.push(...response.markets);
      cursor = response.cursor;
    } while (cursor);

    return allMarkets;
  }

  // Get markets by category (filters by title/event matching common categories)
  async getMarketsByCategory(category: string, limit = 50): Promise<KalshiMarket[]> {
    // Kalshi API doesn't have direct category filter, so we fetch and filter
    const response = await this.getMarkets({ limit, status: 'open' });
    return response.markets.filter(
      (m) => m.category?.toLowerCase().includes(category.toLowerCase())
    );
  }

  // Get trending markets (highest volume)
  async getTrendingMarkets(limit = 10): Promise<KalshiMarket[]> {
    const response = await this.getMarkets({ limit: 100, status: 'open' });
    return response.markets
      .sort((a, b) => b.volume_24h - a.volume_24h)
      .slice(0, limit);
  }

  // Get markets closing soon
  async getMarketsClosingSoon(withinHours = 24, limit = 10): Promise<KalshiMarket[]> {
    const now = Math.floor(Date.now() / 1000);
    const maxCloseTs = now + withinHours * 60 * 60;

    const response = await this.getMarkets({
      limit: 100,
      status: 'open',
      max_close_ts: maxCloseTs,
    });

    return response.markets
      .sort((a, b) => new Date(a.close_time).getTime() - new Date(b.close_time).getTime())
      .slice(0, limit);
  }

  // Get active markets from events with nested markets (returns actual trading data)
  async getActiveMarketsFromEvents(limit = 100): Promise<KalshiMarket[]> {
    const allMarkets: KalshiMarket[] = [];

    // Fetch events with nested markets - this returns real trading data
    const response = await this.getEvents({
      status: 'open',
      with_nested_markets: true,
      limit: Math.min(limit, 200), // API limit
    });

    // Extract markets from events
    for (const event of response.events) {
      if (event.markets) {
        allMarkets.push(...event.markets);
      }
    }

    // Sort by volume and return top markets
    return allMarkets
      .filter(m => m.yes_ask > 0) // Only markets with valid prices
      .sort((a, b) => b.volume_24h - a.volume_24h)
      .slice(0, limit);
  }
}

// Singleton instance for use throughout the app
let clientInstance: KalshiClient | null = null;

export function getKalshiClient(): KalshiClient {
  if (!clientInstance) {
    clientInstance = new KalshiClient({
      apiKey: process.env.KALSHI_API_KEY,
      useSandbox: process.env.KALSHI_USE_SANDBOX === 'true',
    });
  }
  return clientInstance;
}

export default KalshiClient;

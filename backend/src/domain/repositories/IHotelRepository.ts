import { Hotel, HotelSettings } from '../entities/Hotel';

export interface IHotelRepository {
  findById(id: string): Promise<Hotel | null>;
  findAll(): Promise<Hotel[]>;
  update(id: string, data: Partial<Hotel>): Promise<Hotel>;
}

export interface IHotelSettingsRepository {
  findByHotelId(hotelId: string): Promise<HotelSettings | null>;
  update(hotelId: string, data: Partial<HotelSettings>): Promise<HotelSettings>;
}
